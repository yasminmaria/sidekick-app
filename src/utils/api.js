export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY

export async function sugerirTarefas(tituloObjetivo, tarefasExistentes = []) {
  const tarefasAtuais = tarefasExistentes.length > 0
    ? `Tarefas que já existem: ${tarefasExistentes.map(t => t.titulo).join(', ')}.`
    : 'Ainda não há tarefas criadas.'

  const prompt = `Você é um assistente especializado em ajudar pessoas com TDAH a organizar seus objetivos em tarefas concretas e acionáveis.

O usuário tem o seguinte objetivo: "${tituloObjetivo}"
${tarefasAtuais}

Sugira exatamente 5 tarefas novas, diferentes das existentes, que ajudem a alcançar esse objetivo. As tarefas devem ser:
- Específicas e acionáveis (começar com verbo)
- Pequenas o suficiente para completar em 1 sessão
- Ordenadas do mais simples ao mais complexo

Responda APENAS com um JSON válido neste formato, sem texto adicional:
{"tarefas": ["tarefa 1", "tarefa 2", "tarefa 3", "tarefa 4", "tarefa 5"]}`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'Você responde apenas com JSON válido, sem texto adicional, sem markdown, sem explicações.' },
        { role: 'user', content: prompt }
      ],
    }),
  })

  if (!response.ok) throw new Error(`Erro na API: ${response.status}`)

  const data = await response.json()
  const texto = data.choices[0].message.content.trim()
  const limpo = texto.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(limpo)
  return parsed.tarefas
}

export async function segmentarTarefa(tituloTarefa, tituloObjetivo) {
  const prompt = `Você é um assistente especializado em ajudar pessoas com TDAH a quebrar tarefas grandes em passos menores e gerenciáveis.

A pessoa tem o objetivo: "${tituloObjetivo}"
E quer segmentar a seguinte tarefa: "${tituloTarefa}"

Quebre essa tarefa em 3 a 5 subtarefas menores, específicas e acionáveis. Cada subtarefa deve:
- Começar com um verbo de ação
- Ser possível de completar em menos de 30 minutos
- Ser concreta e sem ambiguidade

Responda APENAS com um JSON válido neste formato, sem texto adicional:
{"subtarefas": ["subtarefa 1", "subtarefa 2", "subtarefa 3"]}`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'Você responde apenas com JSON válido, sem texto adicional, sem markdown, sem explicações.' },
        { role: 'user', content: prompt }
      ],
    }),
  })

  if (!response.ok) throw new Error(`Erro na API: ${response.status}`)

  const data = await response.json()
  const texto = data.choices[0].message.content.trim()
  const limpo = texto.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(limpo)
  return parsed.subtarefas
}

export async function chatIA(mensagens, contextoApp) {
  const sistemaPrompt = `Você é o Sidekick, um assistente pessoal inteligente integrado a um app de produtividade para pessoas com TDAH. Você tem acesso ao estado atual do app e pode criar, consultar e sugerir itens.

CONTEXTO ATUAL DO APP:
${JSON.stringify(contextoApp, null, 2)}

AÇÕES DISPONÍVEIS:
- criar_tarefa: cria uma tarefa diária
- criar_objetivo: cria um objetivo
- criar_habito: cria um hábito
- criar_medicamento: cria um medicamento
- criar_evento: cria um evento na agenda
- consultar: responde perguntas sobre os dados
- sugestao: dá sugestões sem criar nada

REGRAS:
1. Sempre responda em português do Brasil
2. Seja direto, amigável e encorajador — lembre que o usuário tem TDAH
3. Respostas curtas e claras
4. Quando criar algo, confirme o que foi criado
5. CRÍTICO: Sua resposta deve ser APENAS o objeto JSON. Sem texto antes, sem texto depois, sem markdown, sem \`\`\`json, sem explicações. Comece sua resposta diretamente com { e termine com }.

EXEMPLOS DE DADOS POR AÇÃO:
- criar_tarefa: { "titulo": "...", "xp": 20, "moedas": 5, "repetitiva": false, "frequencia": null, "dias": [] }
- criar_objetivo: { "titulo": "...", "prazo": "curto|medio|longo", "cor": "#7F77DD" }
- criar_habito: { "titulo": "...", "emoji": "💧" }
- criar_evento: { "data": "YYYY-MM-DD", "titulo": "...", "horario": "HH:MM", "cor": "#1D9E75" }
- criar_medicamento: { "nome": "...", "tipo": "comprimido", "dosagem": "...", "frequencia": "diaria", "horarios": ["08:00"], "dias": [], "duracao": "continuo", "dataInicio": "YYYY-MM-DD", "dataTermino": null, "quantidade": 30, "avisarReposicao": true, "quantidadeAviso": 10 }
- consultar ou sugestao: dados null`

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        { role: 'system', content: sistemaPrompt },
        ...mensagens,
      ],
    }),
  })

  if (!response.ok) throw new Error(`Erro na API: ${response.status}`)

  const data = await response.json()
  const texto = data.choices[0].message.content.trim()
  const match = texto.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Resposta inválida da IA: ${texto}`)
  return JSON.parse(match[0])
}