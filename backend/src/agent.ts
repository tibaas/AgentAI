import OpenAI from "openai";
import { buildDocsSystemPropmt, buildStystemPrompt, buildUserPrompt} from "./prompt"
import type { DietPlanRequest } from "./types";
import fs from "fs"


const client = new OpenAI(
  {
    apiKey: process.env.OPENAI_API_KEY as string,
    timeout: 2 * 60 * 1000,
    logLevel: "debug" // 2 minutes
  }
)

export function generateDietPlan(input: DietPlanRequest) {
  const diretrizes = fs.readFileSync("knowledge/diretrizes.md", "utf-8")

  return client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: buildStystemPrompt() },
      { role: "user", content: buildUserPrompt(input) },
      { role: "system", content: buildDocsSystemPropmt(diretrizes) }
    ], 
    temperature: 0.6, // inspires criativity from AI xd
    stream: true,
  })
}