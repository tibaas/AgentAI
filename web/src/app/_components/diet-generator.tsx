"use client"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DietData } from "@/types/diet-data.type";
import { Loader, LocationEdit, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";


export function DietGenerator({data}: {data: DietData}) {
    
    const [output, setOutput] = useState("")
    const [isStreaming, setIsStreaming] = useState(false)
    const controllerRef = useRef<AbortController | null>(null)


  async function startStreaming() {
    const controller = new AbortController()
    controllerRef.current = controller

    setOutput("")
    setIsStreaming(true)  
    
    try {
      const response = await fetch("http://localhost:3333/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: data.nome,
          idade: data.idade,
          altura_cm: data.altura_cm,
          peso_kg: data.peso_kg,
          sexo: data.sexo,
          nivel_atividade: data.nivel_atitivade,
          objetivo: data.objetivo
        }),
        //permite cancelar a req a qualquer momento
        signal: controller.signal
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder("utf-8")

      while(true){
        const { done, value } = await reader!.read()
        if (done) break;

        const chunk = decoder.decode(value)
        // Processa as linhas do evento SSE
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.substring(6);
            const data = JSON.parse(jsonString);
            // Assumindo que o backend envia { content: "..." }
            setOutput(prev => prev + (data.content || ''));
          }
        }

      } 

      
    } catch(err: any) {
      if(err.name === "AbortError") {
        console.log("Request cancelada")
        return
      }
      console.log(err)
    }finally {
      setIsStreaming(false)
      controllerRef.current = null
    }
  }

  async function handleGenerate() {

    if(isStreaming) {
      controllerRef.current?.abort()
      setIsStreaming(false)
      return
    }
    await startStreaming()
  }


  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 ">
        <Card className="w-full max-w-4xl border-0 p-6 md:p-6">
          <div className="flex justify-center gap-4"> 
            <Button
              onClick={handleGenerate} 
              className="cursor-pointer gap-2" 
              size="lg">
              {isStreaming ? <Loader className="animate-spin" /> : <Sparkles name="w-6 h-6"/>}
              {isStreaming ? "Parar de gerar" : "Gerar dieta"}
            </Button>
          </div>

          {output && (
                      <div className="bg-card rounded-lg p-6 border border-border max-h-[500px] overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ node, ...props}) => (
                    <h2
                      className="text-xl font-bold text-green-600 my-1"
                      {...props}
                    />
                  ),
                  h1: ({ node, ...props}) => (
                    <h1
                      className="text-2xl font-bold text-zinc-900 mb-1"
                      {...props}
                    />)
                }}
              
              >
                {output}
              </ReactMarkdown>
            </div>           
          </div>
          )}
        </Card>
      </div>
    
    </>
  )
}