import emojis from "../../../shared/constants/emojis.js";
import createCommand from "../../../shared/factories/commands/index.js";

export default createCommand({
	data: {
		name: "status",
		description: "Get the status of the bot",
	},
	execute: async (interaction) => {
		await interaction.reply({
			embeds: [
				{
					color: 0x2b2d31,
					description: `${emojis.guilds}${emojis.right_arrow}\`${interaction.client.guilds.cache.size}\``,
				},
			],
		});
	},
});
