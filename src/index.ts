import client from "./core/client/index.js";
import env from "./core/config/env.js";
import database from "./core/database/index.js";
import EventService from "./services/EventService.js";
import InteractionService from "./services/InteractionService.js";

async function main() {
	await Promise.all([
		database.connect(),
		EventService.load(),
		InteractionService.load(),
	]);

	await client.login(env.DISCORD_TOKEN);
	await client.updateCommands();
}

main();
