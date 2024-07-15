// eslint-disable-next-line
import { Knex } from "knex"

declare module "knex/types/tables" {
	export interface Tables {
		users: {
			id: string
			name: string
			email: string
			password: string
		}
		snacks: {
			id: string
			name: string
			description: string
			datetime: Date
			is_in_diet: boolean
			user_id: string
		}
	}
}
