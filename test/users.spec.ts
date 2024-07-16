import { test, beforeAll, afterAll, describe, beforeEach, expect } from "vitest"
import { execSync } from "node:child_process"
import request from "supertest"
import { app } from "../src/app"

describe("Users routes", () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	beforeEach(() => {
		execSync("npm run knex migrate:rollback --all")
		execSync("npm run knex migrate:latest")
	})

	test("Create a new user", async () => {
		const response = await request(app.server).post("/users/register").send({
			name: "teste",
			email: "test@test.com",
			password: "test",
		})

		expect(response.status).toBe(201)
	})

	test("Create a duplicate new user", async () => {
		await request(app.server)
			.post("/users/register")
			.send({
				name: "teste",
				email: "test@test.com",
				password: "test",
			})
			.expect(201)

		const response = await request(app.server).post("/users/register").send({
			name: "teste",
			email: "test@test.com",
			password: "test",
		})

		expect(response.status).toBe(401)
	})

	test("Login User", async () => {
		await request(app.server)
			.post("/users/register")
			.send({
				name: "teste",
				email: "test@test.com",
				password: "test",
			})
			.expect(201)

		const loginUser = await request(app.server)
			.post("/users/login")
			.send({
				email: "test@test.com",
				password: "test",
			})
			.expect(201)

		expect(loginUser.header).toHaveProperty("set-cookie")
	})
})
