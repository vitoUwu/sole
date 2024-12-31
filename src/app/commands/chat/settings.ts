import { ApplicationCommandOptionType } from "discord.js";
import guildModel, {
	type GuildUpdate,
} from "../../../core/database/model/guild.model.js";
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

		if (!statusRegex && !role) {
			return interaction.reply({
				content: "Please provide any of the options.",
				ephemeral: true,
			});
		}

		const guildData = await guildModel.findById(interaction.guildId);

		const filter = { _id: interaction.guildId };
		const update = { $set: { settings: { ...guildData?.settings } } };

		if (statusRegex) {
			update.$set.settings.statusRegex = statusRegex;
		}

		if (role) {
			update.$set.settings.roles = [role.id];
		}

		await guildModel.updateOne(filter, update, { upsert: true, new: true });

		return interaction.reply({ content: "Settings updated.", ephemeral: true });
	},
});
