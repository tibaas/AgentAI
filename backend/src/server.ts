import fastify from 'fastify'
import { planRoutes } from './routes/plan'
import cors from '@fastify/cors'

export const app = fastify({
  logger: true,
})

// Define a origem permitida. Em produção, usa a variável de ambiente, senão, permite tudo.
const allowedOrigin = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL
  : '*';

// Registra o CORS para permitir requisições do frontend
app.register(cors, {
  // Se allowedOrigin for undefined (variável não setada em produção), o CORS será desabilitado por segurança.
  origin: allowedOrigin || false, // Fallback to false if undefined, disabling CORS
})

app.register(planRoutes)

// Exporta o app para a Vercel
export default app;
