import { ActivityType, type Role } from "discord.js";
import guildModel from "../../core/database/model/guild.model.js";
import createEvent from "../../shared/factories/event.js";

export default createEvent({
	name: "presenceUpdate",
	async execute(oldPresence, newPresence) {
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

		if (newStatus === oldStatus && !!newStatus && !!oldStatus) {
			return;
		}

		console.log(
			`${newPresence.user?.username} (${newPresence.user?.id}) changed status from ${oldStatus} to ${newStatus} in ${guild?.name} (${guild?.id})`,
		);

		const guildData = await guildModel.findById(guild.id);

		if (
			!guildData ||
			!guildData.settings?.statusRegex ||
			!guildData.settings?.roles?.length
		) {
			return;
		}

		const roles = guildData.settings.roles
			.map((role) => guild.roles.cache.get(role))
			.filter((role): role is Role => role !== undefined);

		if (newStatus) {
			const match = new RegExp(guildData.settings.statusRegex).test(newStatus);
			if (match) {
				console.log(
					`"${newStatus}" matches with "${guildData.settings.statusRegex}". Adding roles ${roles.map((role) => role.name).join(", ")}`,
				);
				await newPresence.member?.roles.add(roles);
			} else if (
				newPresence.member?.roles.cache.hasAny(...roles.map((role) => role.id))
			) {
				console.log(
					`"${newStatus}" does not match with "${guildData.settings.statusRegex}". Removing roles ${roles.map((role) => role.name).join(", ")}`,
				);
				await newPresence.member?.roles.remove(roles);
			}

			return;
		}

		if (
			newPresence.member?.roles.cache.hasAny(...roles.map((role) => role.id))
		) {
			console.log(
				`${newPresence.user?.username} (${newPresence.user?.id}) status does not match anymore. Removing roles ${roles.map((role) => role.name).join(", ")}`,
			);
			await newPresence.member?.roles.remove(roles);
		}
	},
});
