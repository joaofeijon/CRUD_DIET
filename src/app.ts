import fastify from "fastify"
import cookie from "@fastify/cookie"
import { userRoutes } from "./routes/users"
import { snackRoutes } from "./routes/snacks"
export const app = fastify()

app.register(cookie)

// Log
app.addHook("preHandler", async (request) => {
	console.log(`[${request.method}] ${request.url}`)
})

app.register(userRoutes, {
	prefix: "/users",
})

app.register(snackRoutes, {
	prefix: "/snacks",
})

app.get("/", async () => {
	return "Hello"
})
