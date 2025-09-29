import type { FastifyInstance } from "fastify"; 
import { DietPlanRequestSchema } from "../types";
import { generateDietPlan } from "../agent";
import { streamToResponse } from "ai";

export async function planRoutes(app: FastifyInstance) {
  app.post("/plan", async (req, res) => {
    const parse = DietPlanRequestSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(400).send({
        error: "ValidationError",
        details: parse.error.flatten((issue) => issue.message),
      });
    }

    try {
      // 1. Gera o stream da OpenAI
      const stream = generateDietPlan(parse.data);

      // 2. Usa o helper `streamToResponse` para enviar a resposta
      //    Isso é compatível com a Vercel e lida com os headers automaticamente.
      streamToResponse(stream, res.raw, {
        headers: {
          // Permite que o frontend na Vercel acesse a API
          'Access-Control-Allow-Origin': '*',
        }
      });
    } catch (err: any) {
      req.log.error(err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  });
}