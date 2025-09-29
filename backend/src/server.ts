import Fastify from "fastify";
import { planRoutes } from "./routes/plan";
import cors from "@fastify/cors";


export const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: "*",
  methods: ["GET", "POST"]
})


app.get('/', async (req, res) => {
  res.send("Hello World")
})

app.register(planRoutes)

app.listen({
  port: Number(process.env.PORT) || 3333 , host: "0.0.0.0"})
  .then(() => {
    console.log("HTTP Server Running on port 3333")
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  })


