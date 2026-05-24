import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'

const COR_PRAZO = { curto: '#7F77DD', medio: '#1D9E75', longo: '#EF9F27' }

const TAREFAS_SUGERIDAS = [
  { titulo: 'Tomar remédio', xp: 10, moedas: 2 },
  { titulo: 'Beber água', xp: 5, moedas: 1 },
  { titulo: 'Revisar agenda do dia', xp: 15, moedas: 3 },
  { titulo: 'Fazer exercício', xp: 30, moedas: 8 },
  { titulo: 'Meditar 10 minutos', xp: 20, moedas: 5 },
  { titulo: 'Organizar tarefas', xp: 10, moedas: 2 },
]

export default function ConfiguracaoScreen({ onConcluir }) {
  const { alterarNome, adicionarObjetivo, adicionarTarefa, concluirOnboarding } = useAppStore()

  const [etapa, setEtapa] = useState(1) // 1: nome, 2: objetivo, 3: tarefas
  const [nome, setNome] = useState('')
  const [objetivo, setObjetivo] = useState({ titulo: '', prazo: 'curto' })
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState([])
  const [tarefaCustom, setTarefaCustom] = useState('')

  function toggleTarefa(tarefa) {
    const jaSelecionada = tarefasSelecionadas.find(t => t.titulo === tarefa.titulo)
    if (jaSelecionada) {
      setTarefasSelecionadas(tarefasSelecionadas.filter(t => t.titulo !== tarefa.titulo))
    } else {
      setTarefasSelecionadas([...tarefasSelecionadas, tarefa])
    }
  }

  function adicionarTarefaCustom() {
    if (!tarefaCustom.trim()) return
    const nova = { titulo: tarefaCustom.trim(), xp: 20, moedas: 5 }
    setTarefasSelecionadas([...tarefasSelecionadas, nova])
    setTarefaCustom('')
  }

  function proximaEtapa() {
    if (etapa === 1) {
      if (!nome.trim()) {
        Alert.alert('Nome obrigatório', 'Por favor, insira seu nome para continuar.')
        return
      }
      alterarNome(nome.trim())
      setEtapa(2)
    } else if (etapa === 2) {
      if (objetivo.titulo.trim()) {
        adicionarObjetivo({
          titulo: objetivo.titulo.trim(),
          prazo: objetivo.prazo,
          cor: COR_PRAZO[objetivo.prazo],
        })
      }
      setEtapa(3)
    } else {
      tarefasSelecionadas.forEach(tarefa => {
        adicionarTarefa({
          ...tarefa,
          repetitiva: false,
          frequencia: null,
          dias: [],
          prazoData: null,
          prazoHorario: null,
          lembrete: false,
          lembreteMinutos: 30,
        })
      })
      concluirOnboarding()
      onConcluir()
    }
  }

  function pularEtapa() {
    if (etapa === 2) setEtapa(3)
    else if (etapa === 3) {
      concluirOnboarding()
      onConcluir()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* PROGRESSO */}
        <View style={styles.progressoContainer}>
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={[styles.progressoPasso, i <= etapa && styles.progressoPassoAtivo]}
            />
          ))}
        </View>

        {/* ===== ETAPA 1 — NOME ===== */}
        {etapa === 1 && (
          <View style={styles.etapa}>
            <Text style={styles.etapaEmoji}>👤</Text>
            <Text style={styles.etapaTitulo}>Como posso te chamar?</Text>
            <Text style={styles.etapaDescricao}>
              Seu Sidekick vai usar seu nome para criar uma experiência personalizada.
            </Text>
            <TextInput
              style={styles.inputNome}
              placeholder="Seu nome"
              placeholderTextColor={colors.textMuted}
              value={nome}
              onChangeText={setNome}
              autoFocus
              maxLength={20}
            />
          </View>
        )}

        {/* ===== ETAPA 2 — OBJETIVO ===== */}
        {etapa === 2 && (
          <View style={styles.etapa}>
            <Text style={styles.etapaEmoji}>🎯</Text>
            <Text style={styles.etapaTitulo}>Qual seu primeiro objetivo?</Text>
            <Text style={styles.etapaDescricao}>
              Pode ser algo que você quer conquistar essa semana, esse mês ou esse ano.
            </Text>

            <TextInput
              style={styles.inputNome}
              placeholder="Ex: Aprender a programar"
              placeholderTextColor={colors.textMuted}
              value={objetivo.titulo}
              onChangeText={t => setObjetivo({ ...objetivo, titulo: t })}
              autoFocus
            />

            <Text style={styles.prazoLabel}>Qual o prazo?</Text>
            <View style={styles.prazoRow}>
              {[
                { valor: 'curto', label: '⚡ Curto prazo', desc: 'Semanas' },
                { valor: 'medio', label: '📅 Médio prazo', desc: 'Meses' },
                { valor: 'longo', label: '🌟 Longo prazo', desc: 'Anos' },
              ].map(p => (
                <TouchableOpacity
                  key={p.valor}
                  style={[
                    styles.prazoOpcao,
                    objetivo.prazo === p.valor && { borderColor: COR_PRAZO[p.valor], backgroundColor: COR_PRAZO[p.valor] + '22' }
                  ]}
                  onPress={() => setObjetivo({ ...objetivo, prazo: p.valor })}
                >
                  <Text style={styles.prazoOpcaoLabel}>{p.label}</Text>
                  <Text style={styles.prazoOpcaoDesc}>{p.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ===== ETAPA 3 — TAREFAS ===== */}
        {etapa === 3 && (
          <View style={styles.etapa}>
            <Text style={styles.etapaEmoji}>📋</Text>
            <Text style={styles.etapaTitulo}>Primeiras tarefas</Text>
            <Text style={styles.etapaDescricao}>
              Selecione algumas tarefas para começar. Você pode adicionar mais depois.
            </Text>

            <View style={styles.tarefasLista}>
              {TAREFAS_SUGERIDAS.map(tarefa => {
                const selecionada = tarefasSelecionadas.find(t => t.titulo === tarefa.titulo)
                return (
                  <TouchableOpacity
                    key={tarefa.titulo}
                    style={[styles.tarefaOpcao, selecionada && styles.tarefaOpcaoAtiva]}
                    onPress={() => toggleTarefa(tarefa)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.tarefaCheck, selecionada && styles.tarefaCheckAtivo]}>
                      {selecionada && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.tarefaOpcaoInfo}>
                      <Text style={[styles.tarefaOpcaoTitulo, selecionada && { color: colors.primaryDark }]}>
                        {tarefa.titulo}
                      </Text>
                      <Text style={styles.tarefaOpcaoXP}>+{tarefa.xp} XP · 🪙{tarefa.moedas}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Tarefa customizada */}
            <View style={styles.tarefaCustomRow}>
              <TextInput
                style={styles.tarefaCustomInput}
                placeholder="Adicionar outra tarefa..."
                placeholderTextColor={colors.textMuted}
                value={tarefaCustom}
                onChangeText={setTarefaCustom}
                onSubmitEditing={adicionarTarefaCustom}
              />
              <TouchableOpacity
                style={styles.tarefaCustomBtn}
                onPress={adicionarTarefaCustom}
              >
                <Text style={styles.tarefaCustomBtnTexto}>+</Text>
              </TouchableOpacity>
            </View>

            {tarefasSelecionadas.filter(t => !TAREFAS_SUGERIDAS.find(s => s.titulo === t.titulo)).map(t => (
              <View key={t.titulo} style={[styles.tarefaOpcao, styles.tarefaOpcaoAtiva]}>
                <View style={[styles.tarefaCheck, styles.tarefaCheckAtivo]}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Text style={[styles.tarefaOpcaoTitulo, { color: colors.primaryDark }]}>{t.titulo}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* RODAPÉ COM BOTÕES */}
      <View style={styles.rodape}>
        {etapa > 1 && (
          <TouchableOpacity style={styles.pularBtn} onPress={pularEtapa}>
            <Text style={styles.pularTexto}>
              {etapa === 3 ? 'Pular e entrar' : 'Pular'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.botaoProximo} onPress={proximaEtapa}>
          <Text style={styles.botaoProximoTexto}>
            {etapa === 1 ? `Olá, ${nome || '...'} 👋` : etapa === 3 ? 'Entrar no app 🚀' : 'Próximo →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 120 },

  progressoContainer: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxl },
  progressoPasso: { flex: 1, height: 4, borderRadius: radii.full, backgroundColor: colors.border },
  progressoPassoAtivo: { backgroundColor: colors.primary },

  etapa: { alignItems: 'center' },
  etapaEmoji: { fontSize: 64, marginBottom: spacing.lg },
  etapaTitulo: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  etapaDescricao: { ...typography.body, textAlign: 'center', color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.xl },

  inputNome: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.md,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  prazoLabel: { ...typography.label, alignSelf: 'flex-start', marginBottom: spacing.sm },
  prazoRow: { width: '100%', gap: spacing.sm },
  prazoOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  prazoOpcaoLabel: { ...typography.body, fontWeight: '600' },
  prazoOpcaoDesc: { ...typography.caption },

  tarefasLista: { width: '100%', gap: spacing.sm, marginBottom: spacing.md },
  tarefaOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    width: '100%',
  },
  tarefaOpcaoAtiva: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  tarefaCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tarefaCheckAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: 'white', fontSize: 13, fontWeight: '700' },
  tarefaOpcaoInfo: { flex: 1 },
  tarefaOpcaoTitulo: { ...typography.body, fontWeight: '500' },
  tarefaOpcaoXP: { ...typography.caption, marginTop: 2, color: colors.primary },

  tarefaCustomRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.sm,
  },
  tarefaCustomInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  tarefaCustomBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarefaCustomBtnTexto: { color: 'white', fontSize: 24, fontWeight: '300' },

  rodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  pularBtn: { alignItems: 'center', padding: spacing.sm },
  pularTexto: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
  botaoProximo: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  botaoProximoTexto: { color: 'white', fontSize: 17, fontWeight: '700' },
})