import mongoose from "mongoose";
import GuildService from "../../services/GuildService.js";
import env from "../config/env.js";

class Database {
	async connect() {
		await mongoose.connect(env.MONGO_URI);
		console.log("Connected to MongoDB");
		await GuildService.load();
	}
}

process.on("SIGINT", () => {
	mongoose.connection.close();
	console.log("Disconnected from MongoDB");
	process.exit(0);
});

export default new Database();
