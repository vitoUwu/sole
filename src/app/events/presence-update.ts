import { ActivityType, type Guild, type Role } from "discord.js";
import GuildService from "../../services/GuildService.js";
import createEvent from "../../shared/factories/event.js";

// Reconnecting clients send a presence without the custom status and then
// another with it a moment later; waiting lets the latest one win.
const SETTLE_DELAY_MS = 5_000;
const timers = new Map<string, NodeJS.Timeout>();
// Role PUT and DELETE run on separate REST queues, so a member's syncs are
// chained to keep an older removal from landing after a newer add.
const syncs = new Map<string, Promise<void>>();

function scheduleSync(guild: Guild, userId: string) {
	const key = `${guild.id}:${userId}`;

	clearTimeout(timers.get(key));
	timers.set(
		key,
		setTimeout(() => {
			timers.delete(key);
			const sync: Promise<void> = (syncs.get(key) ?? Promise.resolve())
				.then(() => syncRoles(guild, userId))
				.catch(console.error)
				.finally(() => {
					if (syncs.get(key) === sync) syncs.delete(key);
				});
			syncs.set(key, sync);
		}, SETTLE_DELAY_MS),
	);
}

async function syncRoles(guild: Guild, userId: string) {
	const presence = guild.presences.cache.get(userId);

	if (!presence || presence.status === "offline") {
		return;
	}

	const newStatus = presence.activities.find(
		(activity) => activity.type === ActivityType.Custom,
	)?.state;

	const guildData = await GuildService.findById(guild.id);

	if (
		!guildData ||
		!guildData.settings?.statusRegex ||
		!guildData.settings?.roles?.length
	) {
		return;
	}

	const cachedMember = guild.members.cache.get(userId);
	const member =
		cachedMember && !cachedMember.partial
			? cachedMember
			: await guild.members.fetch(userId).catch(() => null);

	if (!member || member.user.bot) {
		return;
	}

	const me = await guild.members.fetch(guild.client.user.id).catch(() => null);

	if (!me || !me.permissions.has("ManageRoles")) {
		console.log(
			`Ignoring presence update because I don't have permission to manage roles in ${guild.name} (${guild.id})`,
		);
		return;
	}

	const roles = guildData.settings.roles
		.map((role) => guild.roles.cache.get(role))
		.filter(
			(role): role is Role =>
				// biome-ignore lint/complexity/useOptionalChain: ignore
				role !== undefined && role.editable && !role.managed,
		);

	if (!roles.length) {
		console.log(`No roles found in ${guild.name} (${guild.id})`);
		return;
	}

	if (newStatus) {
		const match = new RegExp(guildData.settings.statusRegex).test(newStatus);
		if (match) {
			console.log(
				`"${newStatus}" matches with "${guildData.settings.statusRegex}". Adding roles ${roles.map((role) => role.name).join(", ")}`,
			);
			for (const role of roles) {
				await member.roles.add(role);
			}
		} else if (member.roles.cache.hasAny(...roles.map((role) => role.id))) {
			console.log(
				`"${newStatus}" does not match with "${guildData.settings.statusRegex}". Removing roles ${roles.map((role) => role.name).join(", ")}`,
			);
			for (const role of roles) {
				await member.roles.remove(role);
			}
		}

		return;
	}

	if (member.roles.cache.hasAny(...roles.map((role) => role.id))) {
		console.log(
			`${member.user.username} (${member.id}) status does not match anymore. Removing roles ${roles.map((role) => role.name).join(", ")}`,
		);
		for (const role of roles) {
			await member.roles.remove(role);
		}
	}
}

export default createEvent({
	name: "presenceUpdate",
	async execute(oldPresence, newPresence) {
		if (oldPresence?.user?.bot || newPresence?.user?.bot) {
			console.log("Ignoring presence update because user is a bot");
			return;
		}

		const guild = newPresence.guild;

		if (!guild) {
			console.log("Ignoring presence update because guild is not found", {
				oldPresence,
				newPresence,
			});
			return;
		}

		const newStatus = newPresence.activities?.find(
			(activity) => activity.type === ActivityType.Custom,
		)?.state;
		const oldStatus = oldPresence?.activities?.find(
			(activity) => activity.type === ActivityType.Custom,
		)?.state;

		const wentOnline =
			oldPresence?.status === "offline" && newPresence?.status !== "offline";
		const wentOffline =
			oldPresence?.status !== "offline" && newPresence?.status === "offline";

		if (
			(newStatus === oldStatus && !wentOnline) ||
			(!newStatus && !oldStatus && !wentOnline) ||
			wentOffline
		) {
			return;
		}

		console.log(
			`${newPresence.user?.username} (${newPresence.user?.id}) changed status from ${oldStatus} to ${newStatus} in ${guild?.name} (${guild?.id})`,
		);

		scheduleSync(guild, newPresence.userId);
	},
});
