import { FastifyInstance } from "fastify"
import { z } from "zod"
import { knex } from "../database"
import crypto from "node:crypto"

export async function userRoutes(app: FastifyInstance) {
	app.post("/login", async (request, reply) => {
		const loginUserSchema = z.object({
			email: z.string(),
			password: z.string(),
		})

		const { email, password } = loginUserSchema.parse(request.body)

		const user = await knex("users")
			.where({
				email,
				password,
			})
			.first()

		if (user) {
			reply.cookie("sessionId", user.id, {
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			})

			return reply.status(201).send()
		} else {
			return reply.status(401).send({
				error: "Email or Password invalid",
			})
		}
		return "users"
	})
	app.post("/register", async (request, reply) => {
		const createUserSchema = z.object({
			name: z.string(),
			email: z.string(),
			password: z.string(),
		})

		const { name, email, password } = createUserSchema.parse(request.body)

		const user = await knex("users").where("name", name).first()

		if (!user) {
			await knex("users").insert({
				id: crypto.randomUUID(),
				name,
				email,
				password,
			})

			return reply.status(201).send()
		} else {
			return reply.status(401).send({
				error: "Exist one user it is name",
			})
		}
	})
}
