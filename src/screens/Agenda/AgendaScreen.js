import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import { useState, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppStore } from '../../store/useAppStore'
import { spacing, radii, typography } from '../../theme'
import { useThemeColors, useTint } from '../../theme/ThemeContext'
import Icon from '../../components/ui/Icon'
import ChatModal from '../../components/ChatModal'

const DIAS_CURTO = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIAS_LONGO = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

function toDateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// minute-of-day from "HH:MM" / "10h00" / "14h30" — for sorting/now detection.
function timeToMinutes(str = '') {
  const m = str.match(/(\d{1,2})[:h](\d{2})/)
  if (!m) return 9999
  return parseInt(m[1]) * 60 + parseInt(m[2])
}

function normalizeTime(str = '') {
  const m = str.match(/(\d{1,2})[:h](\d{2})/)
  if (!m) return str
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

// pick a tint key + tag label for a timeline entry
function classify(titulo, isEvento) {
  if (/rem[eé]dio|ritalina|sertralina|comprimid|dose|medic/i.test(titulo)) return { tag: 'Remédio', key: 'teal' }
  if (/consulta|neuro|sa[uú]de|terapia|dentista|m[eé]dic/i.test(titulo)) return { tag: 'Saúde', key: 'pink' }
  if (/estud|ler|foco|curso|react/i.test(titulo)) return { tag: 'Foco', key: 'dark' }
  if (isEvento || /reuni|projeto|compromisso|call/i.test(titulo)) return { tag: 'Compromisso', key: 'amber' }
  return { tag: 'Tarefa', key: 'teal' }
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
      backgroundColor: colors.surface,
      paddingHorizontal: 22,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSofter,
    },
    headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 },
    weekday: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: colors.teal },
    date: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, textTransform: 'capitalize' },
    pendPill: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radii.full,
      overflow: 'hidden',
    },
    weekRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
    weekDay: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 7, borderRadius: 14 },
    weekDayLabel: { fontSize: 10.5, fontWeight: '700' },
    weekDayNum: { fontSize: 15, fontWeight: '800' },
    weekDot: { width: 5, height: 5, borderRadius: 3 },

    body: { paddingHorizontal: 18, paddingTop: 22 },

    row: { flexDirection: 'row', gap: 14 },
    timeCol: { width: 48, alignItems: 'flex-end', paddingTop: 1 },
    time: { fontSize: 13, fontWeight: '800' },
    railCol: { alignItems: 'center' },
    dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
    rail: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
    cardCol: { flex: 1, minWidth: 0, paddingBottom: 20 },
    card: { borderRadius: radii.lg, padding: 14, borderWidth: 1 },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    cardTitulo: { fontSize: 14.5, fontWeight: '800', letterSpacing: -0.2, flex: 1 },
    nowBadge: {
      fontSize: 9.5,
      fontWeight: '800',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: '#fff',
      backgroundColor: colors.brightGreen,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: radii.full,
      overflow: 'hidden',
    },
    cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
    chip: { fontSize: 10.5, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, overflow: 'hidden' },
    doneLabel: { fontSize: 11, fontWeight: '700' },

    vazio: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
    vazioEmoji: { fontSize: 30, marginBottom: 8 },
    vazioTexto: { fontSize: 14, fontWeight: '700', color: colors.textStrong },
    vazioDica: { fontSize: 12.5, color: colors.textSecondary, marginTop: 3, textAlign: 'center' },
    addBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      marginTop: 4,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.dashedBorder,
      borderStyle: 'dashed',
      borderRadius: radii.lg,
      paddingVertical: 16,
    },
    addBtnTexto: { color: colors.primary, fontSize: 14, fontWeight: '800' },

    fabChat: {
      position: 'absolute', right: spacing.lg,
      width: 54, height: 54, borderRadius: radii.full,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
      elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
    },

    modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
    modalTitulo: { ...typography.h3, marginBottom: 4 },
    modalData: { ...typography.caption, textTransform: 'capitalize', marginBottom: spacing.lg },
    inputLabel: { ...typography.label, marginBottom: spacing.xs },
    input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
    modalBotoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
    botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
    botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '700' },
  })
}

export default function AgendaScreen() {
  const colors = useThemeColors()
  const tint = useTint()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const { eventos, tarefas, adicionarEvento } = useAppStore()

  const hojeDate = new Date()
  const hojeStr = toDateString(hojeDate)
  const [dataSelecionada, setDataSelecionada] = useState(hojeStr)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [novoEvento, setNovoEvento] = useState({ titulo: '', horario: '' })
  const [chatVisivel, setChatVisivel] = useState(false)

  // Week (Sun..Sat) containing today
  const week = useMemo(() => {
    const start = new Date(hojeDate)
    start.setDate(hojeDate.getDate() - hojeDate.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const ds = toDateString(d)
      const temItem = (eventos[ds]?.length || 0) > 0 || tarefas.some(t => t.prazoData === ds && t.prazoHorario)
      return { ds, label: DIAS_CURTO[i], num: d.getDate(), temItem }
    })
  }, [eventos, tarefas])

  const timeline = useMemo(() => {
    const evs = (eventos[dataSelecionada] || []).map(e => ({
      id: e.id, titulo: e.titulo, time: normalizeTime(e.horario), min: timeToMinutes(e.horario), done: false, isEvento: true,
    }))
    const tks = tarefas
      .filter(t => t.prazoData === dataSelecionada && t.prazoHorario)
      .map(t => ({ id: t.id, titulo: t.titulo, time: normalizeTime(t.prazoHorario), min: timeToMinutes(t.prazoHorario), done: t.concluida, isEvento: false }))
    const items = [...evs, ...tks].sort((a, b) => a.min - b.min)

    const isToday = dataSelecionada === hojeStr
    const nowMin = hojeDate.getHours() * 60 + hojeDate.getMinutes()
    let nowMarked = false
    return items.map(it => {
      const c = classify(it.titulo, it.isEvento)
      let now = false
      if (isToday && !nowMarked && !it.done && it.min >= nowMin) { now = true; nowMarked = true }
      return { ...it, ...c }
    })
  }, [eventos, tarefas, dataSelecionada])

  const pendentesDoDia = timeline.filter(t => !t.done).length

  const headerWeekday = useMemo(() => {
    const [a, m, d] = dataSelecionada.split('-').map(Number)
    return DIAS_LONGO[new Date(a, m - 1, d).getDay()]
  }, [dataSelecionada])
  const headerDate = useMemo(() => {
    const [a, m, d] = dataSelecionada.split('-').map(Number)
    return `${d} de ${MESES[m - 1]}`
  }, [dataSelecionada])

  function salvarEvento() {
    if (!novoEvento.titulo.trim()) return
    adicionarEvento(dataSelecionada, { titulo: novoEvento.titulo, horario: novoEvento.horario || 'Sem horário', cor: colors.teal })
    setNovoEvento({ titulo: '', horario: '' })
    setModalVisivel(false)
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* Sticky header */}
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.weekday}>{headerWeekday}</Text>
              <Text style={styles.date}>{headerDate}</Text>
            </View>
            <Text style={styles.pendPill}>{pendentesDoDia} pendentes</Text>
          </View>
          <View style={styles.weekRow}>
            {week.map(d => {
              const active = d.ds === dataSelecionada
              return (
                <TouchableOpacity
                  key={d.ds}
                  style={[styles.weekDay, { backgroundColor: active ? colors.primary : 'transparent' }]}
                  onPress={() => setDataSelecionada(d.ds)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.weekDayLabel, { color: active ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>{d.label}</Text>
                  <Text style={[styles.weekDayNum, { color: active ? '#fff' : colors.textStrong }]}>{d.num}</Text>
                  <View style={[styles.weekDot, { backgroundColor: active ? colors.brightGreen : (d.temItem ? colors.dashedBorder : 'transparent') }]} />
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.body}>
          {timeline.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioEmoji}>🗓️</Text>
              <Text style={styles.vazioTexto}>Nenhum compromisso neste dia</Text>
              <Text style={styles.vazioDica}>Toque em adicionar para criar um evento</Text>
            </View>
          ) : (
            timeline.map((e, i) => {
              const tt = tint(e.key)
              const dotColor = e.key === 'dark' ? colors.teal : tt.fg
              const last = i === timeline.length - 1
              const cardBg = e.now ? colors.surface : (e.done ? colors.surfaceAlt : colors.surface)
              const cardBorder = e.now ? colors.brightGreen : colors.border
              return (
                <View key={e.id} style={styles.row}>
                  <View style={styles.timeCol}>
                    <Text style={[styles.time, { color: e.now ? colors.primary : (e.done ? colors.textMuted : colors.textStrong) }]}>{e.time}</Text>
                  </View>
                  <View style={styles.railCol}>
                    <View style={[styles.dot, { backgroundColor: e.done ? dotColor : colors.surface, borderColor: dotColor }]} />
                    {!last && <View style={styles.rail} />}
                  </View>
                  <View style={styles.cardCol}>
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder },
                      e.now && { shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.14, shadowRadius: 22, elevation: 4 }]}>
                      <View style={styles.cardTopRow}>
                        <Text style={[styles.cardTitulo, { color: e.done ? colors.textSecondary : colors.textStrong }]} numberOfLines={1}>{e.titulo}</Text>
                        {e.now && <Text style={styles.nowBadge}>Agora</Text>}
                      </View>
                      <View style={styles.cardMetaRow}>
                        <Text style={[styles.chip, { color: tt.fg, backgroundColor: tt.bg }]}>{e.tag}</Text>
                        {e.done && <Text style={[styles.doneLabel, { color: tt.fg }]}>✓ Concluído</Text>}
                      </View>
                    </View>
                  </View>
                </View>
              )
            })
          )}

          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => setModalVisivel(true)}>
            <Icon name="plus" size={18} color={colors.primary} strokeWidth={2.6} />
            <Text style={styles.addBtnTexto}>Adicionar ao dia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fabChat, { bottom: insets.bottom + 12 }]}
        onPress={() => setChatVisivel(true)}
        accessibilityLabel="Abrir assistente IA"
        accessibilityRole="button"
      >
        <Icon name="sparkle" size={24} color="#fff" strokeWidth={2.2} />
      </TouchableOpacity>

      <ChatModal visivel={chatVisivel} onFechar={() => setChatVisivel(false)} />

      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalFundo}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Novo evento</Text>
              <Text style={styles.modalData}>{headerWeekday}, {headerDate}</Text>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Consulta, Reunião..."
                placeholderTextColor={colors.textMuted}
                value={novoEvento.titulo}
                onChangeText={t => setNovoEvento({ ...novoEvento, titulo: t })}
                autoFocus
              />
              <Text style={styles.inputLabel}>Horário</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 14:30"
                placeholderTextColor={colors.textMuted}
                value={novoEvento.horario}
                onChangeText={t => setNovoEvento({ ...novoEvento, horario: t })}
              />
              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarEvento}>
                  <Text style={styles.botaoSalvarTexto}>Salvar evento</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}
