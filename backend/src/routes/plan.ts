import type { FastifyInstance } from "fastify"; 
import { DietPlanRequestSchema } from "../types";
import { generateDietPlan } from "../agent";



export async function planRoutes(app: FastifyInstance) {
  app.post("/plan", async (req, res) => {
    // Corrigindo o typo em "Acess-Control-Allow-Origin"
    res.raw.setHeader("Access-Control-Allow-Origin", "*");
    // Definindo o Content-Type para Server-Sent Events (SSE)
    res.raw.setHeader("Content-Type", "text/event-stream");
    res.raw.setHeader("Cache-Control", "no-cache");
    res.raw.setHeader("Connection", "keep-alive");

    const parse = DietPlanRequestSchema.safeParse(req.body);

    if (!parse.success) {
      // CORREÇÃO 1: Enviar o erro como uma string no formato de evento (SSE)
      // e não retornar nada.
      const errorPayload = {
        error: "ValidationError",
        details: parse.error.flatten((issue) => issue.message),
      };
      res.raw.statusCode = 400;
      // O formato "data: {...}\n\n" é o padrão para SSE
      res.raw.write(`data: ${JSON.stringify(errorPayload)}\n\n`);
      res.raw.end();
      return; // Apenas `return` para encerrar a execução da função.
    }

    try {
      for await (const delta of generateDietPlan(parse.data)) {
        // Enviando cada parte da stream no formato SSE
        res.raw.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
      }
    } catch (err: any) {
      req.log.error(err);
      // Enviando o erro no formato SSE
      res.raw.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
    } finally {
      // Finaliza a conexão
      res.raw.end();
    }

    // CORREÇÃO 2: Removido o `return res`. Como a resposta já foi enviada
    // manualmente, a função não deve ter retorno.
  });
}


// export async function planRoutes(app: FastifyInstance) {
//   app.post("/plan", async (req, res) => {
//     res.raw.setHeader("Acess-Control-Allow-Origin", "*")
//     res.raw.setHeader("Content-Type", "text/plain; charset=utf-8")

//     res.raw.setHeader("Content-Type", "text/event-stream")
//     res.raw.setHeader("Cache-Control", "no-cache")
//     res.raw.setHeader("Connection", "keep-alive")



//     const parse = DietPlanRequestSchema.safeParse(req.body)
//     if (!parse.success) {
//       return res.status(400).send({
//           error: "ValidationError",
//           details: parse.error.flatten((issue) => issue.message)
//       })
//     }
//     try {
//       for await (const delta of generateDietPlan(parse.data)) {
//         res.raw.write(delta)
//       }

//       res.raw.end()
//     }
//     catch (err: any) {
//     req.log.error(err)
//     res.raw.write(`event: error /n ${JSON.stringify(err.message)}`)
//     res.raw.end()
//     }
//     return res
// })
// }