import createCommand from "../../../shared/factories/commands/index.js";

export default createCommand({
	data: {
		name: "ping",
		description: "Pong!",
	},
	execute(interaction) {
		return interaction.reply({ content: "Pong!" });
	},
});
