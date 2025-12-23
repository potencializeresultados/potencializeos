
import { GoogleGenAI } from "@google/genai";

// Tenta obter a chave da variável de ambiente, se disponível
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';

// Inicializa a IA apenas se houver chave (ou deixa falhar graciosamente nos métodos)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Chat rápido usando Gemini Flash Lite
 * Usado no Assistente Virtual Flutuante
 */
export const askAssistantFast = async (message: string) => {
  if (!ai) return "Simulação: O sistema de IA não está configurado com uma API Key real. Por favor, verifique suas configurações.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: message,
    });
    return response.text;
  } catch (error) {
    console.error("Erro AI:", error);
    return "Desculpe, tive um problema ao processar sua solicitação rápida.";
  }
};

/**
 * Pesquisa de informações da empresa usando Google Search Grounding
 * Usado na tela de Detalhes do Negócio
 */
export const researchCompany = async (companyName: string) => {
  if (!ai) {
    return {
      text: `(Simulação) A **${companyName}** é uma empresa líder no setor, com crescimento recente de 15% ao ano. Notícias recentes indicam expansão para novos mercados no Nordeste. Riscos: Alta competitividade local.`,
      sources: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Pesquise notícias recentes e informações de negócios sobre a empresa "${companyName}". 
      Resuma: 
      1. Atuação principal
      2. Notícias recentes (últimos 6 meses)
      3. Possíveis dores ou oportunidades de negócio para uma consultoria de processos e software.`,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Erro Search:", error);
    return null;
  }
};

/**
 * Geração de Proposta Comercial Complexa
 * Usado na tela de Detalhes do Negócio para criar rascunho
 */
export const generateProposalContent = async (dealContext: { 
    client: string, 
    products: string[], 
    value: number, 
    scope: string 
}) => {
  if (!ai) {
    return `PROPOSTA COMERCIAL (Simulada - Sem API Key)

Para: ${dealContext.client}
Soluções: ${dealContext.products.join(', ')}

Prezados,
Com base em nossa conversa, apresentamos a solução ideal para...`;
  }

  try {
    const prompt = `Você é um consultor comercial sênior da Potencialize Resultados. 
    Escreva uma proposta comercial persuasiva e profissional para o cliente "${dealContext.client}".
    
    Produtos Ofertados: ${dealContext.products.join(', ')}
    Valor Total: R$ ${dealContext.value}
    
    Detalhes do Escopo Principal:
    "${dealContext.scope}"
    
    Estrutura da proposta:
    1. Introdução (focada em dor e solução)
    2. O que será entregue (detalhes técnicos mas acessíveis)
    3. Metodologia de Trabalho (Onboarding e Acompanhamento)
    4. Investimento
    5. Fechamento (Chamada para ação)
    
    Tom de voz: Profissional, parceiro, focado em resultados e eficiência.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Modelo mais capaz para raciocínio e escrita longa
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro Proposta:", error);
    return "Erro ao gerar proposta com IA. Tente novamente.";
  }
};

/**
 * Geração de Plano de Ação (OPR)
 * Usado no módulo de Projetos
 */
export const generateActionPlan = async (projectContext: string) => {
   if (!ai) return "Simulação: Plano de ação gerado automaticamente com base no escopo e diagnóstico do cliente.";

   try {
     const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Crie um Plano de Ação Executivo (To-Do List estratégica) para um projeto de consultoria com o seguinte contexto: "${projectContext}".
        Formato: Lista de 5 a 7 itens principais, com "Ação", "Por que fazer" e "Resultado Esperado".`
     });
     return response.text;
   } catch(e) {
      return "Erro ao gerar plano de ação.";
   }
}
