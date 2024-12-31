import guildModel, {
	type GuildDocument,
	type GuildSchema,
} from "../core/database/model/guild.model.js";

class GuildService {
	private guilds: Map<string, GuildDocument> = new Map();

	public async load() {
		const guilds = await guildModel.find();
		this.guilds = new Map(guilds.map((guild) => [guild.id, guild]));
	}

	public async findById(id: string) {
		if (this.guilds.has(id)) {
			return this.guilds.get(id);
		}

		const guild = await guildModel.findById(id);
		if (guild) {
			this.guilds.set(id, guild);
		}

		return guild;
	}

	public async update(
		filter: Parameters<typeof guildModel.findOneAndUpdate>[0],
		update: Parameters<typeof guildModel.findOneAndUpdate>[1],
		options?: Parameters<typeof guildModel.findOneAndUpdate>[2],
	) {
		const guild = await guildModel.findOneAndUpdate(filter, update, {
			...options,
			new: true,
		});
		if (guild) {
			this.guilds.set(guild.id, guild);
		}

		return guild;
	}

	public async create(
		guild: Parameters<typeof guildModel.create<GuildSchema>>[0],
	) {
		const newGuild = await guildModel.create<GuildSchema>(guild);
		this.guilds.set(newGuild.id, newGuild);
		return newGuild;
	}

	public async bulkCreate(
		guilds: Parameters<typeof guildModel.create<GuildSchema>>[0][],
	) {
		const newGuilds = await guildModel.bulkWrite(
			guilds.map((guild) => ({
				insertOne: {
					document: guild,
				},
			})),
		);
		const _guilds = await guildModel.find({
			_id: { $in: guilds.map((guild) => guild._id) },
		});
		for (const guild of _guilds) {
			this.guilds.set(guild.id, guild);
		}
		return newGuilds;
	}

	public all() {
		return Array.from(this.guilds.values());
	}
}

export default new GuildService();
