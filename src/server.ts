import { app } from "./app"
import { env } from "./env"

app
	.listen({
		port: env.PORT,
	})
	.then(() => {
		console.log(`Run serve in: http://localhost:${env.PORT}`)
	})
