import {
	ActivityType,
	ApplicationCommandOptionType,
	type Role,
} from "discord.js";
import GuildService from "../../../services/GuildService.js";
import createCommand from "../../../shared/factories/commands/index.js";

export default createCommand({
	data: {
		name: "refresh",
		description:
			"Sometimes I may not update the roles correctly, use this command to fix it.",
		options: [
			{
				type: ApplicationCommandOptionType.User,
				name: "user",
				description: "Specify a user to refresh the roles for.",
			},
		],
		dmPermission: false,
	},
	async execute(interaction) {
		const member = interaction.options.getMember("user") || interaction.member;

		if (!member) {
			return interaction.reply({
				content: "Member not found.",
				ephemeral: true,
			});
		}

		const guildData = await GuildService.findById(interaction.guildId);

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
