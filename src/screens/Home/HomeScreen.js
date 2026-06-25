import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Switch, Alert, Animated } from 'react-native'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated'

import { useAppStore } from '../../store/useAppStore'
import { spacing, radii, typography, gradients, shadows } from '../../theme'
import { useGlobalStyles } from '../../theme/globalStyles'
import { useThemeColors, useTint } from '../../theme/ThemeContext'
import ChatModal from '../../components/ChatModal'
import Icon from '../../components/ui/Icon'
import GradientView from '../../components/ui/GradientView'
import TaskTile from '../../components/ui/TaskTile'
import { iconForTitulo, tintForId, nivelNome } from '../../utils/visuals'
import { pedirPermissaoNotificacoes } from '../../utils/notifications'

const FREQUENCIAS = [
  { valor: 'diaria', label: '📅 Diária' },
  { valor: 'semanal', label: '📆 Semanal' },
  { valor: 'mensal', label: '🗓️ Mensal' },
  { valor: 'anual', label: '🔄 Anual' },
  { valor: 'unica', label: '⏳ Única' },
  { valor: 'personalizada', label: '⚙️ Personalizada' },
]

const DIAS_SEMANA = [
  { valor: 'dom', label: 'D' },
  { valor: 'seg', label: 'S' },
  { valor: 'ter', label: 'T' },
  { valor: 'qua', label: 'Q' },
  { valor: 'qui', label: 'Q' },
  { valor: 'sex', label: 'S' },
  { valor: 'sab', label: 'S' },
]

const MINUTOS_LEMBRETE = [
  { valor: 10, label: '10 min antes' },
  { valor: 30, label: '30 min antes' },
  { valor: 60, label: '1h antes' },
  { valor: 1440, label: '1 dia antes' },
]

function estadoInicial() {
  return {
    titulo: '',
    xp: '20',
    moedas: '5',
    repetitiva: false,
    frequencia: 'diaria',
    dias: ['seg', 'ter', 'qua', 'qui', 'sex'],
    prazoData: '',
    prazoHorario: '',
    lembrete: false,
    lembreteMinutos: 30,
  }
}

function hoje() {
  return new Date().toISOString().split('T')[0]
}

function classificarTarefa(tarefa) {
  if (!tarefa.prazoData) return 'semPrazo'
  const dataHoje = hoje()
  if (tarefa.prazoData < dataHoje) return 'atrasada'
  if (tarefa.prazoData === dataHoje) return 'hoje'
  return 'proximos'
}

function formatarPrazo(tarefa) {
  if (!tarefa.prazoData) return null
  const [ano, mes, dia] = tarefa.prazoData.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)
  const dataHoje = new Date()
  dataHoje.setHours(0, 0, 0, 0)
  const diffDias = Math.round((data - dataHoje) / (1000 * 60 * 60 * 24))
  let label = ''
  if (diffDias < 0) label = `Atrasada ${Math.abs(diffDias)}d`
  else if (diffDias === 0) label = 'Hoje'
  else if (diffDias === 1) label = 'Amanhã'
  else label = `Em ${diffDias} dias`
  return tarefa.prazoHorario ? `${label} · ${tarefa.prazoHorario}` : label
}

function saudacaoPorHora() {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function validarData(str) {
  if (!str) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false
  const [ano, mes, dia] = str.split('-').map(Number)
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false
  const d = new Date(ano, mes - 1, dia)
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia
}

function validarHorario(str) {
  if (!str) return true
  if (!/^\d{2}:\d{2}$/.test(str)) return false
  const [hh, mm] = str.split(':').map(Number)
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59
}

// tag + meta line shown under a task title.
function tagMeta(t) {
  if (t.repetitiva) return { tag: 'Hábito', meta: 'todos os dias' }
  if (t.prazoHorario) return { tag: 'Compromisso', meta: t.prazoHorario }
  const dif = t.xp >= 40 ? 'Difícil' : t.xp >= 20 ? 'Média' : 'Fácil'
  return { tag: 'Tarefa', meta: dif }
}

function makeStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },

    // ---- Header (green gradient) ----
    header: {
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      paddingHorizontal: 22,
      paddingBottom: 22,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    greeting: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.78)' },
    nome: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginTop: 1 },
    headerPills: { flexDirection: 'row', gap: 8 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: 'rgba(255,255,255,0.16)',
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: radii.full,
    },
    pillTexto: { color: '#fff', fontSize: 13, fontWeight: '700' },

    levelCard: {
      backgroundColor: 'rgba(255,255,255,0.13)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.14)',
      borderRadius: radii.lg,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    levelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 9,
    },
    levelLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    levelBadge: {
      width: 22,
      height: 22,
      borderRadius: 7,
      backgroundColor: colors.brightGreen,
      alignItems: 'center',
      justifyContent: 'center',
    },
    levelBadgeTexto: { color: '#0E1A16', fontSize: 12, fontWeight: '800' },
    levelName: { color: '#fff', fontSize: 13, fontWeight: '700' },
    levelXp: { color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: '600' },
    xpTrack: { height: 9, borderRadius: radii.full, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
    xpFill: { height: '100%', borderRadius: radii.full },

    // ---- Body ----
    body: { paddingHorizontal: 18, paddingTop: 20 },

    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10, paddingLeft: 2 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.primary,
    },

    // Foco card
    focusCard: { borderRadius: radii.xl, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', ...shadows.raised },
    focusTop: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 16 },
    focusIconTile: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    focusTitulo: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
    focusMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: '500', marginTop: 3 },
    focusXpChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(23,227,117,0.18)',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: radii.full,
    },
    focusXpTexto: { color: '#5DE39B', fontSize: 12, fontWeight: '800' },
    focusBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.brightGreen,
      borderRadius: 14,
      paddingVertical: 14,
    },
    focusBtnTexto: { color: '#0E1A16', fontSize: 15, fontWeight: '800' },

    // Para hoje
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    sectionTitulo: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
    countPill: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radii.full,
      overflow: 'hidden',
    },


    doneToggle: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6, marginBottom: 2, paddingHorizontal: 2 },
    doneToggleTexto: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
    doneTile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 8,
      opacity: 0.75,
    },
    doneIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    doneTitulo: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textSecondary, textDecorationLine: 'line-through' },
    doneCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

    // Hábitos de hoje
    habitsCard: {
      marginTop: 26,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    habitsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    habitsTitulo: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.2 },
    habitsCount: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    habitsRow: { flexDirection: 'row', gap: 10 },
    habitMini: { flex: 1, height: 54, borderRadius: 14, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },

    emptyCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radii.lg,
      paddingVertical: 28,
      paddingHorizontal: 18,
      alignItems: 'center',
    },
    emptyEmoji: { fontSize: 30, marginBottom: 6 },
    emptyTitulo: { fontSize: 14, fontWeight: '700', color: colors.textStrong },
    emptyDica: { fontSize: 12.5, color: colors.textSecondary, marginTop: 3, textAlign: 'center' },

    // FAB + toast
    fabWrap: { position: 'absolute', right: spacing.lg },
    fabChat: {
      width: 54,
      height: 54,
      borderRadius: radii.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
    },
    levelUpToast: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.lg,
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      ...shadows.raised,
    },
    levelUpEmoji: { fontSize: 26 },
    levelUpTextos: { flex: 1 },
    levelUpTitulo: { fontSize: 15, fontWeight: '800', color: 'white' },
    levelUpDesc: { fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 1 },

    // modal bits
    recompensasRow: { flexDirection: 'row', gap: spacing.sm },
    recompensaCampo: { flex: 1 },
    sugestoesRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    sugestao: { flex: 1, paddingHorizontal: spacing.sm, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
    sugestaoAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
    sugestaoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    sugestaoTextoAtivo: { color: '#FFFFFF' },
    frequenciaContainer: { marginBottom: spacing.md },
    prazoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    prazoInputCampo: { flex: 1 },
    prazoInputLabel: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
    lembreteOpcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
    lembreteOpcao: { paddingHorizontal: spacing.md, minHeight: 44, justifyContent: 'center', borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
    lembreteOpcaoAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
    lembreteOpcaoTexto: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
    lembreteOpcaoTextoAtivo: { color: 'white' },
    inputComErro: { borderColor: colors.coral },
    inputErro: { fontSize: 11, color: colors.coralText, marginTop: spacing.xs, marginBottom: spacing.sm },
  })
}

export default function HomeScreen() {
  const colors = useThemeColors()
  const tint = useTint()
  const globalStyles = useGlobalStyles()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const { perfil, tarefas, habitos, concluirTarefa, adicionarTarefa, editarTarefa, deletarTarefa } = useAppStore()

  const pendentes = useMemo(() => tarefas.filter(t => !t.concluida), [tarefas])
  const concluidas = useMemo(() => tarefas.filter(t => t.concluida), [tarefas])
  const focus = pendentes[0] || null
  const xpPorcentagem = perfil.xpProximoNivel > 0 ? (perfil.xpAtual / perfil.xpProximoNivel) : 0

  const habitsMini = useMemo(
    () => habitos.map(h => ({
      id: h.id,
      icon: iconForTitulo(h.titulo),
      done: h.tipo === 'contador' ? h.progresso >= h.meta : h.concluidoHoje,
    })),
    [habitos]
  )
  const habitsDone = habitsMini.filter(h => h.done).length

  const [modalVisivel, setModalVisivel] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [form, setForm] = useState(estadoInicial())
  const [chatVisivel, setChatVisivel] = useState(false)
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false)
  const [erroData, setErroData] = useState(null)
  const [erroHorario, setErroHorario] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [levelUpNivel, setLevelUpNivel] = useState(null)
  const nivelAnterior = useRef(perfil.nivel)

  const xpBarAnim = useRef(new Animated.Value(0)).current
  const fabScale = useSharedValue(1)
  const focoScale = useSharedValue(1)
  const toastY = useSharedValue(-120)
  const toastOpacity = useSharedValue(0)

  useEffect(() => {
    pedirPermissaoNotificacoes()
    fabScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1700, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.System }),
        withTiming(1.0, { duration: 1700, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.System })
      ),
      -1,
      false
    )
  }, [])

  useEffect(() => {
    Animated.spring(xpBarAnim, {
      toValue: Math.min(xpPorcentagem, 1),
      useNativeDriver: false,
      tension: 70,
      friction: 14,
    }).start()
  }, [xpPorcentagem])

  const fabAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }))
  const focoAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: focoScale.value }] }))
  const toastAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: toastY.value }],
    opacity: toastOpacity.value,
  }))

  useEffect(() => {
    if (perfil.nivel > nivelAnterior.current) {
      setLevelUpNivel(perfil.nivel)
      toastY.value = withSpring(0, { damping: 18, stiffness: 220 })
      toastOpacity.value = withTiming(1, { duration: 220 })
      const timer = setTimeout(() => {
        toastY.value = withTiming(-120, { duration: 380, easing: Easing.in(Easing.quad) })
        toastOpacity.value = withTiming(0, { duration: 300 })
        setTimeout(() => setLevelUpNivel(null), 400)
      }, 2800)
      return () => clearTimeout(timer)
    }
    nivelAnterior.current = perfil.nivel
  }, [perfil.nivel])

  function abrirCriar() {
    setTarefaEditando(null)
    setForm(estadoInicial())
    setErroData(null)
    setErroHorario(null)
    setModalVisivel(true)
  }

  function abrirEditar(tarefa) {
    setTarefaEditando(tarefa)
    setForm({
      titulo: tarefa.titulo,
      xp: String(tarefa.xp),
      moedas: String(tarefa.moedas),
      repetitiva: tarefa.repetitiva || false,
      frequencia: tarefa.frequencia || 'diaria',
      dias: tarefa.dias || [],
      prazoData: tarefa.prazoData || '',
      prazoHorario: tarefa.prazoHorario || '',
      lembrete: tarefa.lembrete || false,
      lembreteMinutos: tarefa.lembreteMinutos || 30,
    })
    setErroData(null)
    setErroHorario(null)
    setModalVisivel(true)
  }

  function onBlurData() {
    if (!validarData(form.prazoData)) setErroData('Use o formato AAAA-MM-DD, ex: 2025-06-30')
  }
  function onBlurHorario() {
    if (!validarHorario(form.prazoHorario)) setErroHorario('Use o formato HH:MM, ex: 09:00')
  }

  function onLongPress(tarefa) {
    Alert.alert(tarefa.titulo, 'O que você quer fazer?', [
      { text: 'Editar', onPress: () => abrirEditar(tarefa) },
      {
        text: 'Apagar', style: 'destructive', onPress: () =>
          Alert.alert('Apagar tarefa?', `"${tarefa.titulo}" será apagada permanentemente. Isso não pode ser desfeito.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Apagar tarefa', style: 'destructive', onPress: () => deletarTarefa(tarefa.id) },
          ])
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  async function salvar() {
    if (!form.titulo.trim()) return
    if (!validarData(form.prazoData)) { setErroData('Use o formato AAAA-MM-DD, ex: 2025-06-30'); return }
    if (!validarHorario(form.prazoHorario)) { setErroHorario('Use o formato HH:MM, ex: 09:00'); return }
    if (salvando) return
    setSalvando(true)
    try {
      const dados = {
        titulo: form.titulo.trim(),
        xp: parseInt(form.xp) || 20,
        moedas: parseInt(form.moedas) || 5,
        repetitiva: form.repetitiva,
        frequencia: form.repetitiva ? form.frequencia : null,
        dias: form.repetitiva && form.frequencia === 'diaria' ? form.dias : [],
        prazoData: form.prazoData || null,
        prazoHorario: form.prazoHorario || null,
        lembrete: form.lembrete,
        lembreteMinutos: form.lembreteMinutos,
      }
      if (tarefaEditando) await editarTarefa(tarefaEditando.id, dados)
      else await adicionarTarefa(dados)
      setModalVisivel(false)
    } finally {
      setSalvando(false)
    }
  }

  function toggleDia(dia) {
    const jaSelecionado = form.dias.includes(dia)
    setForm({ ...form, dias: jaSelecionado ? form.dias.filter(d => d !== dia) : [...form.dias, dia] })
  }

  // ---------- RENDERS ----------

  function renderTaskTile(t) {
    const tt = tint(tintForId(t.id))
    const { tag, meta } = tagMeta(t)
    return (
      <TaskTile
        key={t.id}
        tarefa={t}
        tintBg={tt.bg}
        tintFg={tt.fg}
        icon={iconForTitulo(t.titulo)}
        tag={tag}
        meta={meta}
        onComplete={() => concluirTarefa(t.id)}
        onLongPress={() => onLongPress(t)}
      />
    )
  }

  function renderDoneTile(t) {
    return (
      <TouchableOpacity
        key={t.id}
        style={styles.doneTile}
        activeOpacity={0.8}
        onPress={() => concluirTarefa(t.id)}
        onLongPress={() => onLongPress(t)}
        delayLongPress={400}
      >
        <View style={styles.doneIcon}>
          <Icon name={iconForTitulo(t.titulo)} size={18} color={colors.textMuted} />
        </View>
        <Text style={styles.doneTitulo} numberOfLines={1}>{t.titulo}</Text>
        <View style={styles.doneCheck}>
          <Icon name="check" size={13} color="#fff" strokeWidth={3} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <GradientView colors={gradients.header} direction="vertical" style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{saudacaoPorHora()},</Text>
              <Text style={styles.nome} numberOfLines={1}>{perfil.nome} 🌱</Text>
            </View>
            <View style={styles.headerPills}>
              <View style={styles.pill}>
                <Icon name="flame" size={15} color="#FFC56B" strokeWidth={2.2} />
                <Text style={styles.pillTexto}>{perfil.streak}</Text>
              </View>
              <View style={styles.pill}>
                <Icon name="star" size={15} color="#FFD66B" strokeWidth={2.2} />
                <Text style={styles.pillTexto}>{perfil.moedas || 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <View style={styles.levelLeft}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeTexto}>{perfil.nivel}</Text>
                </View>
                <Text style={styles.levelName}>{nivelNome(perfil.nivel)}</Text>
              </View>
              <Text style={styles.levelXp}>{perfil.xpAtual}/{perfil.xpProximoNivel} XP</Text>
            </View>
            <View style={styles.xpTrack}>
              <Animated.View style={[styles.xpFill, { width: xpBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}>
                <GradientView colors={gradients.xpBar} direction="horizontal" style={{ flex: 1, borderRadius: radii.full }} />
              </Animated.View>
            </View>
          </View>
        </GradientView>

        <View style={styles.body}>

          {/* Foco agora */}
          {focus && (
            <View style={{ marginBottom: 22 }}>
              <View style={styles.sectionLabelRow}>
                <Icon name="sparkle" size={15} color={colors.primary} />
                <Text style={styles.sectionLabel}>Foco agora</Text>
              </View>
              <GradientView colors={gradients.focus} style={styles.focusCard}>
                <View style={styles.focusTop}>
                  <View style={styles.focusIconTile}>
                    <Icon name={iconForTitulo(focus.titulo)} size={22} color="#fff" strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.focusTitulo} numberOfLines={1}>{focus.titulo}</Text>
                    <Text style={styles.focusMeta} numberOfLines={1}>
                      {tagMeta(focus).tag} · {tagMeta(focus).meta}
                    </Text>
                  </View>
                  <View style={styles.focusXpChip}>
                    <Text style={styles.focusXpTexto}>+{focus.xp}</Text>
                  </View>
                </View>
                <Reanimated.View style={focoAnimStyle}>
                  <TouchableOpacity
                    style={styles.focusBtn}
                    activeOpacity={0.9}
                    onPressIn={() => { focoScale.value = withTiming(0.97, { duration: 90, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System }) }}
                    onPressOut={() => { focoScale.value = withSpring(1, { damping: 13, stiffness: 320, mass: 0.5, reduceMotion: ReduceMotion.System }) }}
                    onPress={() => concluirTarefa(focus.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Concluir ${focus.titulo}, ganhar ${focus.xp} XP`}
                  >
                    <Icon name="check" size={18} color="#0E1A16" strokeWidth={3} />
                    <Text style={styles.focusBtnTexto}>Concluir agora</Text>
                  </TouchableOpacity>
                </Reanimated.View>
              </GradientView>
            </View>
          )}

          {/* Para hoje */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitulo}>Para hoje</Text>
            {pendentes.length > 0
              ? <Text style={styles.countPill}>{pendentes.length} restantes</Text>
              : (
                <TouchableOpacity onPress={abrirCriar}><Text style={styles.countPill}>+ Nova</Text></TouchableOpacity>
              )}
          </View>

          {pendentes.length === 0 ? (
            <TouchableOpacity style={styles.emptyCard} activeOpacity={0.85} onPress={abrirCriar}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitulo}>Tudo em dia por aqui</Text>
              <Text style={styles.emptyDica}>Toque para adicionar uma tarefa</Text>
            </TouchableOpacity>
          ) : (
            pendentes.map(renderTaskTile)
          )}

          {/* Concluídas hoje */}
          {concluidas.length > 0 && (
            <>
              <TouchableOpacity style={styles.doneToggle} activeOpacity={0.7} onPress={() => setMostrarConcluidas(v => !v)}>
                <Icon name={mostrarConcluidas ? 'chevronDown' : 'chevronRight'} size={16} color={colors.textSecondary} strokeWidth={2.4} />
                <Text style={styles.doneToggleTexto}>{concluidas.length} concluídas hoje</Text>
              </TouchableOpacity>
              {mostrarConcluidas && <View style={{ marginTop: 8 }}>{concluidas.map(renderDoneTile)}</View>}
            </>
          )}

          {/* Hábitos de hoje */}
          {habitos.length > 0 && (
            <View style={styles.habitsCard}>
              <View style={styles.habitsHeader}>
                <Text style={styles.habitsTitulo}>Hábitos de hoje</Text>
                <Text style={styles.habitsCount}>{habitsDone}/{habitsMini.length}</Text>
              </View>
              <View style={styles.habitsRow}>
                {habitsMini.map(h => (
                  <View key={h.id} style={styles.habitMini}>
                    <Icon name={h.icon} size={18} color={h.done ? colors.primary : colors.textMuted} strokeWidth={2.2} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB Chat */}
      <Reanimated.View style={[styles.fabWrap, { bottom: insets.bottom + 12 }, fabAnimStyle]} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fabChat}
          onPress={() => setChatVisivel(true)}
          accessibilityLabel="Abrir assistente IA"
          accessibilityRole="button"
        >
          <Icon name="sparkle" size={24} color="#fff" strokeWidth={2.2} />
        </TouchableOpacity>
      </Reanimated.View>

      {levelUpNivel && (
        <Reanimated.View style={[styles.levelUpToast, { top: insets.top + 12 }, toastAnimStyle]} pointerEvents="none">
          <Text style={styles.levelUpEmoji}>⭐</Text>
          <View style={styles.levelUpTextos}>
            <Text style={styles.levelUpTitulo}>Nível {levelUpNivel}!</Text>
            <Text style={styles.levelUpDesc}>Você subiu de nível. Continue assim.</Text>
          </View>
        </Reanimated.View>
      )}

      <ChatModal visivel={chatVisivel} onFechar={() => setChatVisivel(false)} />

      {/* Modal criar/editar tarefa */}
      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <View style={globalStyles.modalFundo}>
          <ScrollView contentContainerStyle={globalStyles.scrollModal}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitulo}>{tarefaEditando ? 'Editar tarefa' : 'Nova tarefa'}</Text>

              <Text style={globalStyles.inputLabel}>Título</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Ex: Estudar por 30 minutos"
                placeholderTextColor={colors.textMuted}
                value={form.titulo}
                onChangeText={t => setForm({ ...form, titulo: t })}
                autoFocus
              />

              <View style={styles.recompensasRow}>
                <View style={styles.recompensaCampo}>
                  <Text style={globalStyles.inputLabel}>⚡ XP</Text>
                  <TextInput style={globalStyles.input} keyboardType="numeric" value={form.xp} onChangeText={t => setForm({ ...form, xp: t })} />
                </View>
                <View style={styles.recompensaCampo}>
                  <Text style={globalStyles.inputLabel}>🪙 Moedas</Text>
                  <TextInput style={globalStyles.input} keyboardType="numeric" value={form.moedas} onChangeText={t => setForm({ ...form, moedas: t })} />
                </View>
              </View>

              <Text style={globalStyles.inputLabel}>Dificuldade</Text>
              <View style={styles.sugestoesRow}>
                {[
                  { label: '😌 Fácil', xp: '10', moedas: '2' },
                  { label: '💪 Média', xp: '20', moedas: '5' },
                  { label: '🔥 Difícil', xp: '40', moedas: '10' },
                ].map(s => (
                  <TouchableOpacity
                    key={s.label}
                    style={[styles.sugestao, form.xp === s.xp && styles.sugestaoAtiva]}
                    onPress={() => setForm({ ...form, xp: s.xp, moedas: s.moedas })}
                  >
                    <Text style={[styles.sugestaoTexto, form.xp === s.xp && styles.sugestaoTextoAtivo]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={globalStyles.inputLabel}>📅 Prazo (opcional)</Text>
              <View style={styles.prazoRow}>
                <View style={styles.prazoInputCampo}>
                  <Text style={styles.prazoInputLabel}>Data</Text>
                  <TextInput
                    style={[globalStyles.input, { marginBottom: 0 }, erroData && styles.inputComErro]}
                    placeholder="2025-06-30"
                    placeholderTextColor={colors.textMuted}
                    value={form.prazoData}
                    onChangeText={t => { setForm({ ...form, prazoData: t }); setErroData(null) }}
                    onBlur={onBlurData}
                    keyboardType="numeric"
                  />
                  {erroData && <Text style={styles.inputErro}>{erroData}</Text>}
                </View>
                <View style={styles.prazoInputCampo}>
                  <Text style={styles.prazoInputLabel}>Horário</Text>
                  <TextInput
                    style={[globalStyles.input, { marginBottom: 0 }, erroHorario && styles.inputComErro]}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textMuted}
                    value={form.prazoHorario}
                    onChangeText={t => { setForm({ ...form, prazoHorario: t }); setErroHorario(null) }}
                    onBlur={onBlurHorario}
                    keyboardType="numeric"
                  />
                  {erroHorario && <Text style={styles.inputErro}>{erroHorario}</Text>}
                </View>
              </View>

              {form.prazoData ? (
                <View>
                  <View style={globalStyles.toggleRow}>
                    <View>
                      <Text style={globalStyles.toggleLabel}>🔔 Lembrete</Text>
                      <Text style={globalStyles.toggleDesc}>Notificação antes do prazo</Text>
                    </View>
                    <Switch
                      value={form.lembrete}
                      onValueChange={v => setForm({ ...form, lembrete: v })}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="white"
                    />
                  </View>

                  {form.lembrete && (
                    <View style={styles.lembreteOpcoes}>
                      {MINUTOS_LEMBRETE.map(op => (
                        <TouchableOpacity
                          key={op.valor}
                          style={[styles.lembreteOpcao, form.lembreteMinutos === op.valor && styles.lembreteOpcaoAtiva]}
                          onPress={() => setForm({ ...form, lembreteMinutos: op.valor })}
                        >
                          <Text style={[styles.lembreteOpcaoTexto, form.lembreteMinutos === op.valor && styles.lembreteOpcaoTextoAtivo]}>
                            {op.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : null}

              <View style={globalStyles.toggleRow}>
                <View>
                  <Text style={globalStyles.toggleLabel}>Tarefa repetitiva</Text>
                  <Text style={globalStyles.toggleDesc}>Aparece novamente no próximo período</Text>
                </View>
                <Switch
                  value={form.repetitiva}
                  onValueChange={v => setForm({ ...form, repetitiva: v })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="white"
                />
              </View>

              {form.repetitiva && (
                <View style={styles.frequenciaContainer}>
                  <Text style={globalStyles.inputLabel}>Frequência</Text>
                  <View style={globalStyles.frequenciaRow}>
                    {FREQUENCIAS.map(f => (
                      <TouchableOpacity
                        key={f.valor}
                        style={[globalStyles.frequenciaOpcao, form.frequencia === f.valor && globalStyles.frequenciaAtiva]}
                        onPress={() => setForm({ ...form, frequencia: f.valor })}
                      >
                        <Text style={[globalStyles.frequenciaTexto, form.frequencia === f.valor && globalStyles.frequenciaTextoAtivo]}>
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {form.frequencia === 'diaria' && (
                    <View>
                      <Text style={globalStyles.inputLabel}>Dias da semana</Text>
                      <View style={globalStyles.diasRow}>
                        {DIAS_SEMANA.map(dia => {
                          const selecionado = form.dias.includes(dia.valor)
                          return (
                            <TouchableOpacity
                              key={dia.valor}
                              style={[globalStyles.diaBtn, selecionado && globalStyles.diaBtnAtivo]}
                              onPress={() => toggleDia(dia.valor)}
                            >
                              <Text style={[globalStyles.diaBtnTexto, selecionado && globalStyles.diaBtnTextoAtivo]}>
                                {dia.label}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                      <View style={globalStyles.atalhoRow}>
                        <TouchableOpacity style={globalStyles.atalho} onPress={() => setForm({ ...form, dias: ['seg', 'ter', 'qua', 'qui', 'sex'] })}>
                          <Text style={globalStyles.atalhoTexto}>Dias úteis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.atalho} onPress={() => setForm({ ...form, dias: ['dom', 'sab'] })}>
                          <Text style={globalStyles.atalhoTexto}>Fim de semana</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.atalho} onPress={() => setForm({ ...form, dias: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] })}>
                          <Text style={globalStyles.atalhoTexto}>Todos</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              <View style={globalStyles.modalBotoes}>
                <TouchableOpacity style={globalStyles.botaoSecundario} onPress={() => setModalVisivel(false)}>
                  <Text style={globalStyles.botaoSecundarioTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.botaoPrimario, (!form.titulo.trim() || !!erroData || !!erroHorario || salvando) && globalStyles.botaoDesabilitado]}
                  onPress={salvar}
                  disabled={!form.titulo.trim() || !!erroData || !!erroHorario || salvando}
                >
                  <Text style={globalStyles.botaoPrimarioTexto}>
                    {salvando ? 'Salvando...' : tarefaEditando ? 'Salvar alterações' : 'Criar tarefa'}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
