import { FastifyInstance } from "fastify"
import { z } from "zod"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"
import { knex } from "../database"
import crypto from "node:crypto"

export async function snackRoutes(app: FastifyInstance) {
	// {
	//     id,
	//     name,
	//     description,
	//     datetime,
	//     is_in_diet
	// }

	app.addHook("preHandler", async (request, reply) => {
		checkSessionIdExists(request, reply)
	})

	app.post("/", async (request, reply) => {
		const createSnackSchema = z.object({
			name: z.string(),
			description: z.string(),
			hour: z.number(),
			date: z.string(),
			isInDiet: z.boolean(),
		})

		const { name, description, hour, date, isInDiet } = createSnackSchema.parse(
			request.body,
		)

		const [day, month, year] = date.split("/").map(Number)

		const timestamp: Date = new Date(
			new Date(year, month - 1, day).setHours(hour),
		)

		const userId: string | undefined = request.cookies.sessionId

		if (!userId) {
			return reply.status(401).send()
		}

		await knex("diet_logs").insert({
			id: crypto.randomUUID(),
			name,
			description,
			datetime: timestamp,
			is_in_diet: isInDiet,
			user_id: userId,
		})

		return reply.status(201).send()
	})
}
