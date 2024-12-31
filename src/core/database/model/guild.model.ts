import {
	type Document,
	type FilterQuery,
	type InferSchemaType,
	Schema,
	type UpdateQuery,
	model,
} from "mongoose";

const GuildSchema = new Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		settings: {
			statusRegex: {
				type: String,
				default: null,
			},
			roles: {
				type: [String],
				default: [],
			},
		},
	},
	{
		timestamps: true,
	},
);

export type GuildSchema = InferSchemaType<typeof GuildSchema>;
export type GuildDocument = InferSchemaType<typeof GuildSchema> & Document;
export type GuildFilter = FilterQuery<typeof GuildSchema>;
export type GuildUpdate = UpdateQuery<typeof GuildSchema>;

export default model("guild", GuildSchema);
