import type { FastifyInstance } from "fastify"; 
import { DietPlanRequestSchema } from "../types";
import { generateDietPlan } from "../agent";
import { OpenAIStream, StreamingTextResponse } from "ai";

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
      const openaiStream = generateDietPlan(parse.data);

      // 2. Converte para um formato compatível com a Vercel AI SDK
      const stream = OpenAIStream(openaiStream);

      // 3. Cria uma resposta de streaming e a envia usando o Fastify
      const streamingResponse = new StreamingTextResponse(stream);
      return res.raw.end(streamingResponse.body);
    } catch (err: any) {
      req.log.error(err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  });
}
