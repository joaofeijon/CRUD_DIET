import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("diet_logs", (table) => {
		table.uuid("id").primary() // Definindo o ID como string e chave primária
		table.string("name").notNullable()
		table.string("description").notNullable()
		table.timestamp("datetime").notNullable()
		table.boolean("is_in_diet").notNullable()
		table.uuid("user_id").notNullable()

		table.foreign("user_id").references("id").inTable("users")
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists("diet_logs")
}
