import type { DietPlanRequest } from "./types";

export function buildStystemPrompt(){
  return [
  `Você é Nutri-AI, um agente de nutrição que cria planos semanais de dietas.
  Regras fixas:
  - Sempre responda em texto markdown legível para humanos.
  - Use # para títulos e - para items de lista.
  - A dieta deve conter exatamente 7 dias.
  - Cada dia deve ter 4 refeições fixas: café da manhã, almoço, lanche e jantar.
  - SEMPRE inclua igredientes comuns no Brasil.
  - Nunca inclua calorias e macros de cada refeição, apenas refeições.
  - Evite alimentos ultraprocessados.
  - Não responda em JSON ou outro formato, apenas texto markdown legível para humanos.
  - Não inclua dicas como: bom consultar um nutricionista para um acompanhamento mais personalizado.` 
  ].join("\n")


}

export function buildUserPrompt(input: DietPlanRequest){
  return [
    "Gere um plano alimentar personalizado com base nos dados:",
    `Nome: ${input.nome}`,
    `Idade: ${input.idade}`,
    `Altura em cm: ${input.altura_cm}`,
    `Peso em kg (kg): ${input.peso_kg}`,
    `Sexo: ${input.sexo}`,
    `Nível de atividade: ${input.nivel_atividade}`,
    `Objetivo: ${input.objetivo}`,
  ].join("\n")

}

export function buildDocsSystemPropmt(doc: string) {
  return `Documento técnico para ajudar a gerar as dietas:${doc}`

}