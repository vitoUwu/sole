import Sole from "./Client.js";

const client = new Sole({
	intents: ["Guilds", "GuildPresences", "GuildMembers"],
	failIfNotExists: false,
});

export default client;
