import fastify from 'fastify'
import { planRoutes } from './routes/plan'
import cors from '@fastify/cors'

export const app = fastify({
  logger: true,
})

// Define a origem permitida. Em produção, usa a variável de ambiente, senão, permite tudo.
const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL // Ex: https://meu-app.vercel.app
  : '*';
// Registra o CORS para permitir requisições do frontend
app.register(cors, {
  origin: allowedOrigin as string,
})

app.register(planRoutes)

// Exporta o app para a Vercel
export default app




// import Fastify from "fastify";
// import { planRoutes } from "./routes/plan";
// import cors from "@fastify/cors";


// export const app = Fastify({
//   logger: true
// });

// await app.register(cors, {
//   origin: "*",
//   methods: ["GET", "POST"]
// })


// app.get('/', async (req, res) => {
//   res.send("Hello World")
// })

// app.register(planRoutes)

// app.listen({
//   port: Number(process.env.PORT) || 3333 , host: "0.0.0.0"})
//   .then(() => {
//     console.log("HTTP Server Running on port 3333")
//   })
//   .catch((err) => {
//     app.log.error(err);
//     process.exit(1);
//   })
