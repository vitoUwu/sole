import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { DiscordEvent } from "../shared/types/event.js";

/**
 * @description The service that handles the events
 */
class EventService {
	private events: Map<string, DiscordEvent> = new Map();

	/**
	 * @description Validates the event import
	 *
	 * @param event The event to validate
	 * @param path The path of the event
	 */
	private validateEventImport(
		event: unknown,
		path: string,
	): asserts event is DiscordEvent {
		if (
			typeof event !== "object" ||
			event === null ||
			!("name" in event) ||
			!("execute" in event)
		) {
			throw new Error(`Invalid event import: ${path}`);
		}
	}

	/**
	 * @description Loads the events
	 */
	public async load() {
		const paths = getJavascriptPaths("./dist/app/").filter((path) =>
			path.includes("/events/"),
		);

		for (const path of paths) {
			const event = (await importUsingRoot(path)).default;
			this.validateEventImport(event, path);
			this.events.set(event.name, event);
		}
	}

	/**
	 * @description Gets an event by its name
	 *
	 * @param name The name of the event
	 * @returns The event
	 */
	public getEvent(name: string) {
		if (this.events.size === 0) {
			throw new Error("Events not loaded");
		}

		return this.events.get(name);
	}

	/**
	 * @description Gets all the events
	 *
	 * @returns The events
	 */
	public getEvents() {
		if (this.events.size === 0) {
			throw new Error("Events not loaded");
		}

		return [...this.events.values()];
	}
}

export default new EventService();
