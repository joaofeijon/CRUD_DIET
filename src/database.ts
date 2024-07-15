import "dotenv/config"
import { knex as setupKnex, Knex } from "knex"
import { env } from "./env"

let database: string | { filename: string } = env.DATABASE_CLIENT

if (database === "sqlite") {
	database = {
		filename: env.DATABASE_URL,
	}
}

export const config: Knex.Config = {
	client: env.DATABASE_CLIENT,
	connection: database,
	useNullAsDefault: true,
	migrations: {
		extension: "ts",
		directory: "./db/migrations",
	},
}

export const knex = setupKnex(config)
