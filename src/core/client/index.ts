import { Partials } from "discord.js";
import Sole from "./Client.js";

const client = new Sole({
	intents: ["Guilds", "GuildPresences", "GuildMembers"],
	// Presence updates carry only the user id; without this, discord.js drops
	// them for uncached users.
	partials: [Partials.User],
	failIfNotExists: false,
});

export default client;
