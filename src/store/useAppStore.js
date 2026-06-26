import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persist, createJSONStorage } from 'zustand/middleware'
import { agendarNotificacaoTarefa, cancelarNotificacao } from '../utils/notifications'

export const useAppStore = create(
  persist(
    (set, get) => ({

      // =========================
      // ONBOARDING
      // =========================
      onboardingConcluido: false,

      concluirOnboarding: () => set({ onboardingConcluido: true }),

      // =========================
      // PERFIL
      // =========================
      perfil: {
        nome: '',
        nivel: 1,
        xpAtual: 0,
        xpProximoNivel: 100,
        moedas: 0,
        streak: 0,
        ultimaDataLogin: null,
        ultimoReset: null,
      },

      temaEscuro: false,
      alternarTema: () => set(state => ({ temaEscuro: !state.temaEscuro })),

      // =========================
      // TAREFAS
      // =========================
      tarefas: [],

      adicionarTarefa: async (tarefa) => {
        const { tarefas } = get()
        const novaTarefa = {
          ...tarefa,
          id: Date.now().toString(),
          concluida: false,
          recompensada: false,
          notificacaoId: null,
        }

        // Agenda notificação se tiver lembrete
        if (novaTarefa.lembrete && novaTarefa.prazoData) {
          const notificacaoId = await agendarNotificacaoTarefa(novaTarefa)
          novaTarefa.notificacaoId = notificacaoId
        }

        set({ tarefas: [...tarefas, novaTarefa] })
      },

      editarTarefa: async (id, dados) => {
        const { tarefas } = get()
        const tarefaAtual = tarefas.find(t => t.id === id)

        // Cancela notificação antiga se existia
        if (tarefaAtual?.notificacaoId) {
          await cancelarNotificacao(tarefaAtual.notificacaoId)
        }

        const tarefaAtualizada = { ...tarefaAtual, ...dados, notificacaoId: null }

        // Agenda nova notificação se necessário
        if (tarefaAtualizada.lembrete && tarefaAtualizada.prazoData) {
          const notificacaoId = await agendarNotificacaoTarefa(tarefaAtualizada)
          tarefaAtualizada.notificacaoId = notificacaoId
        }

        set({ tarefas: tarefas.map(t => t.id === id ? tarefaAtualizada : t) })
      },

      deletarTarefa: async (id) => {
        const { tarefas } = get()
        const tarefa = tarefas.find(t => t.id === id)
        if (tarefa?.notificacaoId) {
          await cancelarNotificacao(tarefa.notificacaoId)
        }
        set({ tarefas: tarefas.filter(t => t.id !== id) })
      },

      concluirTarefa: (id) => {
        const { tarefas, ganharXP, ganharMoedas } = get()
        const tarefa = tarefas.find(t => t.id === id)
        if (!tarefa) return
        const novoStatus = !tarefa.concluida
        set({
          tarefas: tarefas.map(t =>
            t.id === id ? { ...t, concluida: novoStatus, recompensada: novoStatus ? true : false } : t
          )
        })
        if (novoStatus && !tarefa.recompensada) {
          ganharXP(tarefa.xp)
          ganharMoedas(tarefa.moedas)
        } else if (!novoStatus && tarefa.recompensada) {
          ganharXP(-tarefa.xp)
          ganharMoedas(-tarefa.moedas)
        }
      },

      resetarTarefasDiarias: () => {
        const { tarefas } = get()
        set({ tarefas: tarefas.map(t => t.repetitiva && t.frequencia === 'diaria' ? { ...t, concluida: false, recompensada: false } : t) })
      },

      // Roda na abertura do app (e quando volta do background). Reseta o status
      // do dia (tarefas diárias, hábitos, doses de remédio) uma vez por dia e
      // atualiza o streak por dias consecutivos. Idempotente: só age 1x por data.
      verificarDiaNovo: () => {
        const { perfil, tarefas, habitos, medicamentos } = get()
        const hoje = new Date().toISOString().split('T')[0]
        if (perfil.ultimoReset === hoje) return

        // Streak: +1 se o último dia ativo foi ontem; senão recomeça em 1.
        const ontem = new Date()
        ontem.setDate(ontem.getDate() - 1)
        const ontemStr = ontem.toISOString().split('T')[0]
        let streak
        if (!perfil.ultimoReset) streak = Math.max(perfil.streak || 0, 1)
        else streak = perfil.ultimoReset === ontemStr ? (perfil.streak || 0) + 1 : 1

        set({
          tarefas: tarefas.map(t =>
            t.repetitiva && t.frequencia === 'diaria'
              ? { ...t, concluida: false, recompensada: false }
              : t
          ),
          habitos: habitos.map(h => {
            const fezOntem = h.tipo === 'contador' ? h.progresso >= h.meta : h.concluidoHoje
            return { ...h, streak: fezOntem ? h.streak : 0, concluidoHoje: false, progresso: 0 }
          }),
          medicamentos: medicamentos.map(m => ({ ...m, tomadosHoje: [] })),
          perfil: { ...perfil, ultimoReset: hoje, ultimaDataLogin: hoje, streak },
        })
      },

      // =========================
      // XP / LEVEL
      // =========================
      ganharXP: (quantidade) => {
        const { perfil } = get()
        let xp = perfil.xpAtual + quantidade
        let nivel = perfil.nivel
        let proximo = perfil.xpProximoNivel
        if (xp < 0) xp = 0
        while (xp >= proximo) { xp -= proximo; nivel += 1; proximo += 50 }
        set({ perfil: { ...perfil, nivel, xpAtual: xp, xpProximoNivel: proximo } })
      },

      // =========================
      // MOEDAS
      // =========================
      ganharMoedas: (quantidade) => {
        const { perfil } = get()
        const novoTotal = Math.max(0, perfil.moedas + quantidade)
        set({ perfil: { ...perfil, moedas: novoTotal } })
      },

      gastarMoedas: (quantidade) => {
        const { perfil } = get()
        if (perfil.moedas < quantidade) return false
        set({ perfil: { ...perfil, moedas: perfil.moedas - quantidade } })
        return true
      },

      // =========================
      // EVENTOS
      // =========================
      eventos: {},

      adicionarEvento: (data, evento) => {
        const { eventos } = get()
        const eventosData = eventos[data] || []
        set({ eventos: { ...eventos, [data]: [...eventosData, { ...evento, id: Date.now().toString() }] } })
      },

      // =========================
      // OBJETIVOS
      // =========================
      objetivos: [],

      adicionarObjetivo: (objetivo) => {
        const { objetivos } = get()
        set({ objetivos: [...objetivos, { ...objetivo, id: Date.now().toString(), tarefas: [] }] })
      },

      editarObjetivo: (id, dados) => {
        const { objetivos } = get()
        set({ objetivos: objetivos.map(o => o.id === id ? { ...o, ...dados } : o) })
      },

      deletarObjetivo: (id) => {
        const { objetivos } = get()
        set({ objetivos: objetivos.filter(o => o.id !== id) })
      },

      adicionarTarefaObjetivo: (objetivoId, titulo) => {
        const { objetivos } = get()
        set({
          objetivos: objetivos.map(o =>
            o.id === objetivoId
              ? {
                ...o,
                tarefas: [...o.tarefas, {
                  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  titulo,
                  concluida: false,
                }]
              }
              : o
          )
        })
      },

      concluirTarefaObjetivo: (objetivoId, tarefaId) => {
        const { objetivos, ganharXP, ganharMoedas } = get()
        set({
          objetivos: objetivos.map(o =>
            o.id === objetivoId
              ? { ...o, tarefas: o.tarefas.map(t => t.id === tarefaId ? { ...t, concluida: !t.concluida } : t) }
              : o
          )
        })
        ganharXP(15)
        ganharMoedas(3)
      },

      // =========================
      // HÁBITOS
      // =========================
      habitos: [],



      adicionarHabito: (habito) => {
        const { habitos } = get()
        set({
          habitos: [...habitos, {
            ...habito,
            id: Date.now().toString(),
            streak: 0,
            concluidoHoje: false,
            progresso: 0,
          }]
        })
      },

      concluirHabito: (id) => {
        const { habitos, ganharXP, ganharMoedas } = get()
        const habito = habitos.find(h => h.id === id)
        if (!habito) return

        const novoStatus = !habito.concluidoHoje

        set({
          habitos: habitos.map(h =>
            h.id === id ? {
              ...h,
              concluidoHoje: novoStatus,
              streak: novoStatus ? h.streak + 1 : Math.max(0, h.streak - 1),
            } : h
          )
        })

        if (novoStatus) {
          ganharXP(10)
          ganharMoedas(2)
        } else {
          ganharXP(-10)
          ganharMoedas(-2)
        }
      },

      incrementarHabito: (id, quantidade) => {
        const { habitos, ganharXP, ganharMoedas } = get()
        const habito = habitos.find(h => h.id === id)
        if (!habito || habito.concluidoHoje) return

        const novoProgresso = Math.max(0, habito.progresso + quantidade)
        const atingiuMeta = novoProgresso >= habito.meta

        set({
          habitos: habitos.map(h =>
            h.id === id ? {
              ...h,
              progresso: novoProgresso,
              concluidoHoje: atingiuMeta,
              streak: atingiuMeta && !h.concluidoHoje ? h.streak + 1 : h.streak,
            } : h
          )
        })

        // Ganha XP só quando conclui pela primeira vez
        if (atingiuMeta && !habito.concluidoHoje) {
          ganharXP(10)
          ganharMoedas(2)
        }
      },
      // =========================
      // MEDICAMENTOS
      // =========================
      medicamentos: [],

      adicionarMedicamento: (medicamento) => {
        const { medicamentos } = get()
        set({ medicamentos: [...medicamentos, { ...medicamento, id: Date.now().toString(), tomadosHoje: [] }] })
      },

      editarMedicamento: (id, dados) => {
        const { medicamentos } = get()
        set({ medicamentos: medicamentos.map(m => m.id === id ? { ...m, ...dados } : m) })
      },

      deletarMedicamento: (id) => {
        const { medicamentos } = get()
        set({ medicamentos: medicamentos.filter(m => m.id !== id) })
      },

      registrarDose: (id, horario) => {
        const { medicamentos, ganharXP, ganharMoedas } = get()
        const med = medicamentos.find(m => m.id === id)
        if (!med) return
        const jaTomou = (med.tomadosHoje || []).includes(horario)
        set({
          medicamentos: medicamentos.map(m =>
            m.id === id ? {
              ...m,
              tomadosHoje: jaTomou ? m.tomadosHoje.filter(h => h !== horario) : [...(m.tomadosHoje || []), horario],
              quantidade: jaTomou ? m.quantidade + 1 : m.quantidade - 1,
            } : m
          )
        })
        if (!jaTomou) { ganharXP(5); ganharMoedas(1) }
      },

      // =========================
      // HUMOR
      // =========================
      registrosHumor: [],

      registrarHumor: (emoji, valor, nota, foco, energia) => {
        nota = nota || ''
        const { registrosHumor, ganharXP } = get()
        const agora = new Date()
        const hora = agora.getHours()
        const periodo = hora < 12 ? 'manha' : hora < 18 ? 'tarde' : 'noite'
        const novoRegistro = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          emoji,
          valor,
          nota,
          // foco / energia: 1–5 (opcional, novos check-ins de humor)
          foco: foco || null,
          energia: energia || null,
          periodo,
          hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          data: agora.toISOString().split('T')[0],
          timestamp: agora.toISOString(),
        }
        set({ registrosHumor: [novoRegistro, ...registrosHumor] })
        ganharXP(5)
      },

      deletarRegistroHumor: (id) => {
        const { registrosHumor } = get()
        set({ registrosHumor: registrosHumor.filter(r => r.id !== id) })
      },

      // =========================
      // STREAK / LOGIN
      // =========================
      registrarLoginHoje: () => {
        const { perfil } = get()
        const hoje = new Date().toDateString()
        if (perfil.ultimaDataLogin !== hoje) {
          set({ perfil: { ...perfil, streak: perfil.streak + 1, ultimaDataLogin: hoje } })
        }
      },

      alterarNome: (novoNome) => {
        const { perfil } = get()
        set({ perfil: { ...perfil, nome: novoNome } })
      },

      resetarTudo: async () => {
        await AsyncStorage.clear()
      },

    }),
    {
      name: 'sidekick-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)