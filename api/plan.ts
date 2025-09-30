import type { FastifyInstance, FastifyReply } from "fastify";
import { DietPlanRequestSchema } from "../backend/src/types";
import { openai } from "../backend/src/agent";
import { streamText } from "ai";
import { buildDocsSystemPropmt, buildStystemPrompt, buildUserPrompt } from "../backend/src/prompt";
import { promises as fs } from "fs";
import path from "path";

export async function planRoutes(app: FastifyInstance) {
  app.post("/plan", async (req, res: FastifyReply) => {
    const parse = DietPlanRequestSchema.safeParse(req.body);

    if (!parse.success) {
      return res.status(400).send({
        error: "ValidationError",
        details: parse.error.flatten((issue) => issue.message),
      });
    }

    try {
      // Usando path.resolve para um caminho mais robusto
      const diretrizesPath = path.resolve("knowledge/diretrizes.md");
      const diretrizes = await fs.readFile(diretrizesPath, "utf-8");

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

      // 2. Define o header e envia a stream de texto diretamente.
      // O Fastify gerenciará a stream para você.
      res.header('Content-Type', 'text/plain; charset=utf-8');
      return res.send(result.textStream);

    } catch (err: any) {
      req.log.error(err, "Error generating diet plan");
      // Verifica se o erro é de arquivo não encontrado para uma mensagem mais específica
      if (err.code === 'ENOENT') {
        return res.status(500).send({ error: "Internal Server Error", message: "Knowledge file not found." });
      }
      return res.status(500).send({ error: "Internal Server Error" });
    }
  });
}
