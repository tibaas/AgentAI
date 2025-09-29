import type { FastifyInstance } from "fastify"; 
import { DietPlanRequestSchema } from "../types";
import { openai } from "../agent";
import { streamText } from "ai";
import { buildDocsSystemPropmt, buildStystemPrompt, buildUserPrompt } from "../prompt";
import fs from "fs";

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
      const diretrizes = fs.readFileSync("knowledge/diretrizes.md", "utf-8")

      // 1. Chama streamText com o modelo e as mensagens
      const result = await streamText({
        model: openai.chat("gpt-4o-mini"),
        messages: [
          { role: "system", content: buildStystemPrompt() },
          { role: "user", content: buildUserPrompt(parse.data) },
          { role: "system", content: buildDocsSystemPropmt(diretrizes) }
        ],
        temperature: 0.6,
      });

      // 2. Envia o stream de texto diretamente, pois o Fastify v5 suporta Web Streams nativamente.
      return res.send(result.textStream);
    } catch (err: any) {
      req.log.error(err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  });
}
