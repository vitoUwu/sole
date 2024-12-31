import guildModel from "../../core/database/model/guild.model.js";
import GuildService from "../../services/GuildService.js";
import createEvent from "../../shared/factories/event.js";

export default createEvent({
	name: "ready",
	execute: async (client) => {
		console.log(`Logado em ${client.user.username} (${client.user.id})`);

		// check for new guilds that are not in the database
		const guilds = [...client.guilds.cache.values()];
		const guildsInDatabase = GuildService.all();

		const guildsNotInDatabase = guilds.filter(
			(guild) => !guildsInDatabase.some((g) => g.id === guild.id),
		);

		await GuildService.bulkCreate(
			guildsNotInDatabase.map((guild) => ({
				_id: guild.id,
				settings: { statusRegex: null as unknown as string, roles: [] },
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
		);

		console.log(`${guildsNotInDatabase.length} guilds were created`);
	},
});
