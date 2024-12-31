import env from "../../core/config/env.js";

const emojis =
	env.NODE_ENV === "development"
		? {
				regex:
					"<:regex_1:1323652893718614040><:regex_2:1323652905642885200><:regex_3:1323652915348639856>",
				role: "<:role_1:1323649769134096468><:role_2:1323649779351289967><:role_3:1323649789052583988>",
				right_arrow: "<:right_arrow:1323653003089154110>",
				settings:
					"<:settings_1:1323655950321586176><:settings_2:1323655963420528650><:settings_3:1323655977093824533><:settings_4:1323655987957071972>",
			}
		: {
				regex:
					"<:regex_1:1323657600935657514><:regex_2:1323657610251206746><:regex_3:1323657620573257728>",
				role: "<:role_1:1323657681554247803><:role_2:1323657692686061591><:role_3:1323657702643077120>",
				right_arrow: "<:right_arrow:1323657567624499201>",
				settings:
					"<:settings_1:1323657459692470323><:settings_2:1323657477459542066><:settings_3:1323657489052336229><:settings_4:1323657498745638973>",
			};

export default emojis;
