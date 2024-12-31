function safeEnv<T extends Record<string, unknown>>(
	env: T,
): Record<keyof T, string> {
	for (const key in env) {
		if (env[key] === undefined) {
			throw new Error(`Environment variable ${key} is not set`);
		}
	}
	return env as Record<keyof T, string>;
}

export default safeEnv({
	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	MONGO_URI: process.env.MONGO_URI,
	NODE_ENV: process.env.NODE_ENV || "production",
});
