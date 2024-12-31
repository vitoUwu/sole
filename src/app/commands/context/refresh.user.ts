import { ActivityType, type Role } from "discord.js";
import guildModel from "../../../core/database/model/guild.model.js";
import createUserContext from "../../../shared/factories/user-context.js";

export default createUserContext({
	data: {
		name: "Refresh Roles",
		dmPermission: false,
	},
	async execute(interaction) {
		const member = interaction.targetMember;

		if (!member) {
			return interaction.reply({
				content: "Member not found.",
				ephemeral: true,
			});
		}

		const guildData = await guildModel.findById(interaction.guildId);

		if (
			!guildData ||
			!guildData.settings?.statusRegex ||
			!guildData.settings?.roles?.length
		) {
			return interaction.reply({
				content: "Guild not configured this module yet.",
				ephemeral: true,
			});
		}

		const roles = guildData.settings.roles
			.map((role) => interaction.guild.roles.cache.get(role))
			.filter((role): role is Role => role !== undefined);

		if (!roles.length) {
			return interaction.reply({ content: "No roles found.", ephemeral: true });
		}

		const status = member.presence?.activities?.find(
			(activity) => activity.type === ActivityType.Custom,
		)?.state;

		if (!status || !new RegExp(guildData.settings.statusRegex).test(status)) {
			await member.roles.remove(roles);
			return interaction.reply({ content: "Roles removed.", ephemeral: true });
		}

		await member.roles.add(roles);
		return interaction.reply({ content: "Roles refreshed.", ephemeral: true });
	},
});
