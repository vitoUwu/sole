import { ApplicationCommandOptionType } from "discord.js";
import GuildService from "../../../services/GuildService.js";
import emojis from "../../../shared/constants/emojis.js";
import createCommand from "../../../shared/factories/commands/index.js";

export default createCommand({
	data: {
		name: "settings",
		description: "Configure the settings for the module.",
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: "status_regex",
				description: "The regex to match the status.",
			},
			{
				type: ApplicationCommandOptionType.Role,
				name: "role",
				description: "The role to assign.",
			},
		],
		dmPermission: false,
		defaultMemberPermissions: ["Administrator"],
	},
	async execute(interaction) {
		const statusRegex = interaction.options.getString("status_regex");
		const role = interaction.options.getRole("role");
		const guildData = await GuildService.findById(interaction.guildId);

		if (!statusRegex && !role) {
			if (!guildData) {
				return interaction.reply({
					content: "Not set up yet. Please provide any of the options.",
					ephemeral: true,
				});
			}

			return interaction.reply({
				content:
					`${emojis.settings}` +
					`\n\n${emojis.regex}${emojis.right_arrow}\`${guildData.settings?.statusRegex || "Not set"}\`` +
					`\n${emojis.role}${emojis.right_arrow}${guildData.settings?.roles?.[0] ? `<@&${guildData.settings.roles[0]}>` : "Not set"}`,
				ephemeral: true,
			});
		}

		const filter = { _id: interaction.guildId };
		const update = { $set: { settings: { ...guildData?.settings } } };
		const warnings: string[] = [];
		let settingsUpdated = false;

		if (statusRegex) {
			update.$set.settings.statusRegex = statusRegex;
			settingsUpdated = true;
		}

		const me = await interaction.guild.members.fetch(
			interaction.client.user.id,
		);
		if (role) {
			const cantAssignReason = !role.editable
				? "role is not editable"
				: role.managed
					? "role is managed"
					: !me.permissions.has("ManageRoles")
						? "I don't have permission to manage roles"
						: null;
			if (cantAssignReason) {
				warnings.push(`I can't assign the role because "${cantAssignReason}"`);
			} else {
				update.$set.settings.roles = [role.id];
				settingsUpdated = true;
			}
		}

		await GuildService.update(filter, update, { upsert: true });

		return interaction.reply({
			content: `${settingsUpdated ? "Settings updated." : "No settings updated."} ${warnings.length ? `\n${warnings.join("\n")}` : ""}`,
			ephemeral: true,
		});
	},
});
