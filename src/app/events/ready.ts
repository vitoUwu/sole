import guildModel from "../../core/database/model/guild.model.js";
import createEvent from "../../shared/factories/event.js";

export default createEvent({
	name: "ready",
	execute: async (client) => {
		console.log(`Logado em ${client.user.username} (${client.user.id})`);

		// check for new guilds that are not in the database
		const guilds = [...client.guilds.cache.values()];
		const guildsInDatabase = await guildModel.find({});

		const guildsNotInDatabase = guilds.filter(
			(guild) => !guildsInDatabase.some((g) => g.id === guild.id),
		);

		await guildModel.bulkWrite(
			guildsNotInDatabase.map((guild) => ({
				insertOne: {
					document: {
						_id: guild.id,
						settings: { statusRegex: null, roles: [] },
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
			})),
		);

		console.log(`${guildsNotInDatabase.length} guilds were created`);
	},
});
