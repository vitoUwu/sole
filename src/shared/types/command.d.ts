import type {
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	CacheType,
	ChannelType,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	LocalizationMap,
	MessageApplicationCommandData,
	MessageContextMenuCommandInteraction,
	UserApplicationCommandData,
	UserContextMenuCommandInteraction,
} from "discord.js";

type BaseOption = {
	name: string;
	nameLocalizations?: LocalizationMap;
	description: string;
	descriptionLocalizations?: LocalizationMap;
	required?: boolean;
};

type Choise<T extends string | number> = {
	name: string;
	value: T;
};

type AutocompletableOption = {
	/**
	 * @description The function that will be executed when then option's autocomplete is triggered
	 */
	autocomplete: AutocompleteExecute;
	/**
	 * @description Choices are not allowed for autocomplete options
	 */
	choices?: never;
};

type ChoosableOption<T extends string | number> = {
	/**
	 * @description The choices for the option
	 */
	choices: Choise<T>[];
	/**
	 * @description Autocomplete is not allowed for choosable options
	 */
	autocomplete?: never;
};

type BaseStringOption = BaseOption & {
	minLength?: number;
	maxLength?: number;
	type: ApplicationCommandOptionType.String;
};

type AutocompletableStringOption = BaseStringOption & AutocompletableOption;
type ChoosableStringOption = BaseStringOption & ChoosableOption<string>;

type BaseNumberOption = BaseOption & {
	minValue?: number;
	maxValue?: number;
	type: ApplicationCommandOptionType.Number;
};

type AutocompletableNumberOption = BaseNumberOption & AutocompletableOption;
type ChoosableNumberOption = BaseNumberOption & ChoosableOption<number>;

type BooleanOption = BaseOption & {
	type: ApplicationCommandOptionType.Boolean;
};

type UserOption = BaseOption & {
	type: ApplicationCommandOptionType.User;
};

type RoleOption = BaseOption & {
	type: ApplicationCommandOptionType.Role;
};

type ChannelOption = BaseOption & {
	type: ApplicationCommandOptionType.Channel;
	channelTypes: ChannelType[];
};

type MentionableOption = BaseOption & {
	type: ApplicationCommandOptionType.Mentionable;
};

type SubcommandOption = BaseOption & {
	type: ApplicationCommandOptionType.Subcommand;
	options: Exclude<CommandOption, SubcommandOption | SubcommandGroupOption>[];
};

type SubcommandGroupOption = BaseOption & {
	type: ApplicationCommandOptionType.SubcommandGroup;
	options: Exclude<CommandOption, SubcommandGroupOption>[];
};

export type CommandOption =
	| BaseStringOption
	| AutocompletableStringOption
	| ChoosableStringOption
	| AutocompletableNumberOption
	| ChoosableNumberOption
	| BooleanOption
	| UserOption
	| RoleOption
	| ChannelOption
	| MentionableOption
	| SubcommandOption
	| SubcommandGroupOption;

export type AutocompleteExecute<C extends CacheType = "cached"> = (
	interaction: AutocompleteInteraction<C>,
) => Promise<unknown> | unknown;

type CommandType = "chat" | "user" | "message";
type CommandData<T extends CommandType> = T extends "chat"
	? ChatInputApplicationCommandData
	: T extends "user"
		? UserApplicationCommandData
		: T extends "message"
			? MessageApplicationCommandData
			: never;
type CommandExecute<
	T extends CommandType,
	C extends CacheType = "cached",
> = T extends "chat"
	? (interaction: ChatInputCommandInteraction<C>) => unknown | Promise<unknown>
	: T extends "user"
		? (
				interaction: UserContextMenuCommandInteraction<C>,
			) => unknown | Promise<unknown>
		: T extends "message"
			? (
					interaction: MessageContextMenuCommandInteraction<C>,
				) => unknown | Promise<unknown>
			: never;

export type Command<T extends CommandType, C extends CacheType = "cached"> = {
	data: CommandData<T>;
	/**
	 * Whether the command should be active or not
	 * @default true
	 */
	active?: boolean;
	autocomplete?: T extends "chat" ? Map<string, AutocompleteExecute> : never;
	execute: CommandExecute<T, C>;
};
