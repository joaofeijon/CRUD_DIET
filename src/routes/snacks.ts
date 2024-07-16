import { FastifyInstance } from "fastify"
import { z } from "zod"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"
import { knex } from "../database"
import crypto from "node:crypto"

export async function snackRoutes(app: FastifyInstance) {
	app.addHook("preHandler", async (request, reply) => {
		checkSessionIdExists(request, reply)
	})

	app.get("/", async (request, reply) => {
		const userId: string | undefined = request.cookies.sessionId

		if (!userId) reply.status(401).send()

		const snacks = await knex("diet_logs").where("user_id", userId).select("*")

		reply.status(200).send(snacks)
	})

	app.get("/:id", async (request, reply) => {
		const userId: string | undefined = request.cookies.sessionId
		const createParamsSchema = z.object({
			id: z.string(),
		})
		const { id } = createParamsSchema.parse(request.params)

		if (!userId || id === "") reply.status(401).send()

		const snacks = await knex("diet_logs")
			.where({
				id,
				user_id: userId,
			})
			.select()
			.first()

		reply.status(200).send(snacks)
	})

	app.get("/metrics", async (request, reply) => {
		const userId: string | undefined = request.cookies.sessionId

		if (!userId) reply.status(401).send()

		const snacks = await knex("diet_logs").where("user_id", userId).select("*")

		const QTDAllSnacks = snacks.length
		const snacksIsDiet = []
		const snacksIsNotDiet = []
		let bestSequency = 0
		let nowSequency = 0

		snacks.forEach((snack) => {
			if (snack.is_in_diet) {
				snacksIsDiet.push(snack)
				nowSequency++
				if (nowSequency > bestSequency) {
					bestSequency = nowSequency
				}
			} else {
				snacksIsNotDiet.push(snack)
				nowSequency = 0
			}
		})

		reply.status(200).send({
			QTDAllSnacks,
			snacksIsDiet: snacksIsDiet.length,
			snacksIsNotDiet: snacksIsNotDiet.length,
			BestSquencyInDiet: bestSequency,
		})
	})

	app.put("/:id", async (request, reply) => {
		const userId: string | undefined = request.cookies.sessionId
		const createParamsSchema = z.object({
			id: z.string(),
		})
		const { id } = createParamsSchema.parse(request.params)

		if (!userId || id === "") reply.status(401).send()

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
		const datetime: number = new Date(year, month - 1, day).setHours(hour)

		try {
			await knex("diet_logs")
				.where({
					id,
					user_id: userId,
				})
				.update({
					name,
					description,
					datetime,
					is_in_diet: isInDiet,
					// user_id: userId,
				})

			reply.status(200).send()
		} catch (error) {
			reply.status(400).send({ error })
		}
	})

	app.delete("/:id", async (request, reply) => {
		const userId: string | undefined = request.cookies.sessionId
		const createParamsSchema = z.object({
			id: z.string(),
		})
		const { id } = createParamsSchema.parse(request.params)

		if (!userId || id === "") reply.status(401).send()

		try {
			await knex("diet_logs")
				.where({
					id,
					user_id: userId,
				})
				.delete()

			reply.status(200).send()
		} catch (error) {
			reply.status(400).send({ error })
		}
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

		const timestamp: number = new Date(year, month - 1, day).setHours(hour)

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
