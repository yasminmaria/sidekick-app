import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({

      // =========================
      // PERFIL
      // =========================
      perfil: {
        nome: 'Yasmin',
        nivel: 1,
        xpAtual: 0,
        xpProximoNivel: 100,
        moedas: 0,
        streak: 0,
        ultimaDataLogin: null,
      },

      temaEscuro: false,
      alternarTema: () => set(state => ({ temaEscuro: !state.temaEscuro })),

      // =========================
      // TAREFAS
      // =========================
      tarefas: [
        { id: '1', titulo: 'Passear com o cachorro', xp: 20, moedas: 5, concluida: false, recompensada: false, repetitiva: true, frequencia: 'diaria', dias: ['seg', 'ter', 'qua', 'qui', 'sex'] },
        { id: '2', titulo: 'Tomar remédio', xp: 10, moedas: 2, concluida: false, recompensada: false, repetitiva: true, frequencia: 'diaria', dias: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] },
        { id: '3', titulo: 'Estudar React Native', xp: 30, moedas: 10, concluida: false, recompensada: false, repetitiva: false, frequencia: null, dias: [] },
      ],

      adicionarTarefa: (tarefa) => {
        const { tarefas } = get()
        set({ tarefas: [...tarefas, { ...tarefa, id: Date.now().toString(), concluida: false, recompensada: false }] })
      },

      editarTarefa: (id, dados) => {
        const { tarefas } = get()
        set({ tarefas: tarefas.map(t => t.id === id ? { ...t, ...dados } : t) })
      },

      deletarTarefa: (id) => {
        const { tarefas } = get()
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
      eventos: {
        '2026-04-19': [
          { id: 'e1', titulo: 'Reunião de projeto', horario: '10h00', duracao: '1h', cor: '#1D9E75' },
        ],
        '2026-04-20': [
          { id: 'e2', titulo: 'Consulta neurologista', horario: '14h30', duracao: '1h', cor: '#D4537E' },
        ],
      },

      adicionarEvento: (data, evento) => {
        const { eventos } = get()
        const eventosData = eventos[data] || []
        set({ eventos: { ...eventos, [data]: [...eventosData, { ...evento, id: Date.now().toString() }] } })
      },

      // =========================
      // OBJETIVOS
      // =========================
      objetivos: [
        {
          id: 'o1',
          titulo: 'Aprender React Native',
          prazo: 'curto',
          cor: '#7F77DD',
          tarefas: [
            { id: 'ot1', titulo: 'Criar estrutura de pastas', concluida: true },
            { id: 'ot2', titulo: 'Instalar dependências', concluida: true },
            { id: 'ot3', titulo: 'Criar navegação', concluida: false },
            { id: 'ot4', titulo: 'Construir tela Home', concluida: false },
          ],
        },
        {
          id: 'o2',
          titulo: 'Lançar app Sidekick',
          prazo: 'medio',
          cor: '#1D9E75',
          tarefas: [
            { id: 'ot5', titulo: 'Definir funcionalidades', concluida: true },
            { id: 'ot6', titulo: 'Criar wireframes', concluida: false },
          ],
        },
      ],

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
      habitos: [
        { id: 'h1', titulo: 'Beber água', emoji: '💧', streak: 3, concluidoHoje: false },
        { id: 'h2', titulo: 'Meditar', emoji: '🧘', streak: 1, concluidoHoje: false },
        { id: 'h3', titulo: 'Exercício', emoji: '🏃', streak: 0, concluidoHoje: false },
      ],

      adicionarHabito: (habito) => {
        const { habitos } = get()
        set({ habitos: [...habitos, { ...habito, id: Date.now().toString(), streak: 0, concluidoHoje: false }] })
      },

      concluirHabito: (id) => {
        const { habitos, ganharXP, ganharMoedas } = get()
        const habito = habitos.find(h => h.id === id)
        if (!habito || habito.concluidoHoje) return
        set({ habitos: habitos.map(h => h.id === id ? { ...h, concluidoHoje: true, streak: h.streak + 1 } : h) })
        ganharXP(10)
        ganharMoedas(2)
      },

      // =========================
      // MEDICAMENTOS
      // =========================
      medicamentos: [
        {
          id: 'm1',
          nome: 'Ritalina',
          tipo: 'comprimido',
          dosagem: '10mg',
          frequencia: 'diaria',
          dias: ['seg', 'ter', 'qua', 'qui', 'sex'],
          horarios: ['08:00', '12:00'],
          duracao: 'continuo',
          dataInicio: '2026-04-01',
          dataTermino: null,
          quantidade: 30,
          avisarReposicao: true,
          quantidadeAviso: 10,
          tomadosHoje: [],
        },
      ],

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

      registrarHumor: (emoji, valor, nota) => {
        nota = nota || ''
        const { registrosHumor } = get()
        const agora = new Date()
        const hora = agora.getHours()
        const periodo = hora < 12 ? 'manha' : hora < 18 ? 'tarde' : 'noite'
        const novoRegistro = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          emoji,
          valor,
          nota,
          periodo,
          hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          data: agora.toISOString().split('T')[0],
          timestamp: agora.toISOString(),
        }
        set({ registrosHumor: [novoRegistro, ...registrosHumor] })
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
        await AsyncStorage.removeItem('sidekick-storage')
      },

    }),
    {
      name: 'sidekick-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)