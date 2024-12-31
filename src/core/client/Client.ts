import { Client, type ClientOptions } from "discord.js";
import CommandService from "../../services/CommandService.js";
import EventService from "../../services/EventService.js";
import env from "../config/env.js";

export default class Sole<T extends boolean = false> extends Client<T> {
	private serversUpdateTimeout: NodeJS.Timeout | undefined;

	private listen() {
		const events = EventService.getEvents();

		for (const event of events) {
			this.on(event.name, async (...args) => {
				try {
					await event.execute(...args);
				} catch (error) {
					console.error(error);
				}
			});
		}
	}

	public override async login(token?: string) {
		this.listen();

		return super.login(token || env.DISCORD_TOKEN);
	}

	public async updateCommands() {
		await this.application?.commands.set([
			...CommandService.getCommands().map((command) => command.data),
		]);
	}
}
