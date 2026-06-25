import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Alert, Switch } from 'react-native'
import { useState, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppStore } from '../../store/useAppStore'
import { spacing, radii, typography, gradients, shadows } from '../../theme'
import { useThemeColors, useTint, useTheme } from '../../theme/ThemeContext'
import Icon from '../../components/ui/Icon'
import GradientView from '../../components/ui/GradientView'
import { nivelNome, proximoNivelNome } from '../../utils/visuals'

const CONQUISTAS = [
  { id: 'c1', icon: 'sprout', titulo: 'Primeira semente', desc: 'Conclua sua primeira tarefa' },
  { id: 'c2', icon: 'flame', titulo: 'Semana de fogo', desc: '7 dias consecutivos', streakNecessario: 7 },
  { id: 'c3', icon: 'star', titulo: 'Dedicado', desc: 'Alcance 500 XP', xpNecessario: 500 },
  { id: 'c4', icon: 'trophy', titulo: 'Campeão', desc: 'Alcance o nível 10', nivelNecessario: 10 },
]

const MOOD_META = {
  5: { emoji: '😄', label: 'Ótimo', color: '#1D9E75' },
  4: { emoji: '🙂', label: 'Bem', color: '#6FA53B' },
  3: { emoji: '😐', label: 'Neutro', color: '#C98A1E' },
  2: { emoji: '😔', label: 'Pra baixo', color: '#D2733E' },
  1: { emoji: '😣', label: 'Difícil', color: '#C13E68' },
}

const HEAT_COLORS = ['#EAEEEA', '#BFE7D5', '#5DCAA5', '#0F6E56']
const HEAT_DARK = ['#1A231E', '#1E5240', '#2E8A66', '#17E375']

function diaStr(offsetFromToday) {
  const d = new Date()
  d.setDate(d.getDate() - offsetFromToday)
  return d.toISOString().split('T')[0]
}

export default function PerfilScreen() {
  const colors = useThemeColors()
  const tint = useTint()
  const { isDark } = useTheme()
  const heat = isDark ? HEAT_DARK : HEAT_COLORS
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const { perfil, tarefas, habitos, objetivos, registrosHumor, alterarNome, resetarTudo, temaEscuro, alternarTema } = useAppStore()
  const [modalNome, setModalNome] = useState(false)
  const [novoNome, setNovoNome] = useState(perfil.nome)

  const porcentagemXP = Math.round((perfil.xpAtual / perfil.xpProximoNivel) * 100)
  const tarefasFeitas = tarefas.filter(t => t.concluida).length
  const inicial = perfil.nome.substring(0, 2).toUpperCase()

  const journey = [
    { n: perfil.streak, label: 'dias seguidos', icon: 'flame', key: 'amber' },
    { n: tarefasFeitas, label: 'tarefas feitas', icon: 'check', key: 'teal' },
    { n: registrosHumor.length, label: 'check-ins humor', icon: 'smile', key: 'pink' },
    { n: objetivos.length, label: 'metas ativas', icon: 'target', key: 'dark' },
  ]

  // Consistência — últimos 14 dias, intensidade = nº de check-ins de humor no dia
  const consistency = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const ds = diaStr(13 - i)
      const n = registrosHumor.filter(r => r.data === ds).length
      const lv = n >= 3 ? 3 : n === 2 ? 2 : n === 1 ? 1 : 0
      return { lv, n }
    })
  }, [registrosHumor])
  const consistencyDays = consistency.filter(c => c.n > 0).length

  // Humor da semana — últimos 7 dias agregados por humor
  const moodWeek = useMemo(() => {
    const setDias = new Set(Array.from({ length: 7 }, (_, i) => diaStr(i)))
    const counts = {}
    registrosHumor.filter(r => setDias.has(r.data)).forEach(r => { counts[r.valor] = (counts[r.valor] || 0) + 1 })
    const arr = Object.keys(counts).map(v => ({ valor: Number(v), n: counts[v], ...MOOD_META[v] }))
    arr.sort((a, b) => b.n - a.n)
    const max = arr.length ? Math.max(...arr.map(m => m.n)) : 1
    return { arr: arr.slice(0, 4), max, top: arr[0] }
  }, [registrosHumor])

  function salvarNome() {
    if (!novoNome.trim()) return
    alterarNome(novoNome.trim())
    setModalNome(false)
  }

  function confirmarReset() {
    Alert.alert('Resetar tudo?', 'Isso apagará todos os seus dados. O app será reiniciado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Resetar', style: 'destructive',
        onPress: async () => {
          await resetarTudo()
          Alert.alert('Dados apagados', 'Feche e abra o app novamente para aplicar as alterações.')
        },
      },
    ])
  }

  function conquistaDesbloqueada(c) {
    if (c.nivelNecessario) return perfil.nivel >= c.nivelNecessario
    if (c.streakNecessario) return perfil.streak >= c.streakNecessario
    if (c.xpNecessario) return perfil.xpAtual >= c.xpNecessario
    return tarefasFeitas > 0
  }
  const achDone = CONQUISTAS.filter(conquistaDesbloqueada).length

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>

        {/* Gradient header */}
        <GradientView colors={['#0F6E56', '#14805F']} direction="vertical" style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <TouchableOpacity style={styles.gear} onPress={() => { setNovoNome(perfil.nome); setModalNome(true) }} accessibilityLabel="Editar nome">
            <Icon name="pencil" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <GradientView colors={gradients.avatar} style={styles.avatar}>
              <Text style={styles.avatarTexto}>{inicial}</Text>
            </GradientView>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.nome} numberOfLines={1}>{perfil.nome}</Text>
              <View style={styles.levelPill}>
                <Icon name="sprout" size={15} color={colors.mint} strokeWidth={2.2} />
                <Text style={styles.levelPillTexto}>Nível {perfil.nivel} · {nivelNome(perfil.nivel)}</Text>
              </View>
            </View>
          </View>
        </GradientView>

        <View style={styles.body}>
          {/* Progress card overlapping header */}
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <Text style={styles.progressLabel}>Progresso para <Text style={{ color: colors.primary }}>{proximoNivelNome(perfil.nivel)}</Text></Text>
              <Text style={styles.progressXp}>{perfil.xpAtual}/{perfil.xpProximoNivel}</Text>
            </View>
            <View style={styles.track}>
              <GradientView colors={gradients.progress} direction="horizontal" style={[styles.bar, { width: `${porcentagemXP}%` }]} />
            </View>
          </View>

          {/* Journey */}
          <Text style={styles.secaoTitulo}>Sua jornada</Text>
          <View style={styles.journeyGrid}>
            {journey.map(j => {
              const tt = tint(j.key)
              return (
                <View key={j.label} style={styles.journeyCard} accessible accessibilityLabel={`${j.n} ${j.label}`}>
                  <View style={[styles.journeyTile, { backgroundColor: tt.bg }]}>
                    <Icon name={j.icon} size={19} color={tt.fg} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.journeyN}>{j.n}</Text>
                  <Text style={styles.journeyLabel}>{j.label}</Text>
                </View>
              )
            })}
          </View>

          {/* Consistency */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Icon name="flame" size={17} color={colors.amber} strokeWidth={2.4} />
                <Text style={styles.cardTitulo}>Consistência</Text>
              </View>
              <Text style={styles.streakPill}>{perfil.streak} dias seguidos</Text>
            </View>
            <View
              style={styles.heatRow}
              accessible
              accessibilityRole="image"
              accessibilityLabel={`Consistência dos últimos 14 dias: ${consistencyDays} ${consistencyDays === 1 ? 'dia' : 'dias'} com check-ins de humor.`}
            >
              {consistency.map((c, i) => <View key={i} style={[styles.heatCell, { backgroundColor: heat[c.lv] }]} />)}
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>Últimos 14 dias</Text>
              <View style={styles.legend}>
                <Text style={styles.cardFooterText}>menos</Text>
                {heat.map((c, i) => <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />)}
                <Text style={styles.cardFooterText}>mais</Text>
              </View>
            </View>
          </View>

          {/* Mood week */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>Humor da semana</Text>
              {moodWeek.top && (
                <View style={styles.cardHeaderLeft}>
                  <Text style={{ fontSize: 14 }}>{moodWeek.top.emoji}</Text>
                  <Text style={styles.moodTopLabel}>{moodWeek.top.label}</Text>
                </View>
              )}
            </View>
            {moodWeek.arr.length === 0 ? (
              <Text style={styles.empty}>Sem registros de humor esta semana.</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {moodWeek.arr.map(m => (
                  <View key={m.valor} style={styles.moodRow} accessible accessibilityLabel={`${m.label}: ${m.n} ${m.n === 1 ? 'registro' : 'registros'}`}>
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <View style={styles.moodTrack}>
                      <View style={[styles.moodBar, { width: `${Math.round((m.n / moodWeek.max) * 100)}%`, backgroundColor: m.color }]} />
                    </View>
                    <Text style={styles.moodN}>{m.n}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Goals in progress */}
          <View style={styles.secaoRow}>
            <Text style={styles.secaoTitulo}>Metas em andamento</Text>
            <Text style={styles.secaoLink}>{objetivos.length} ativas</Text>
          </View>
          <View style={{ gap: 10 }}>
            {objetivos.map(o => {
              const totalN = o.tarefas.length
              const doneN = o.tarefas.filter(t => t.concluida).length
              const pct = totalN ? Math.round((doneN / totalN) * 100) : 0
              return (
                <View key={o.id} style={styles.goalCard}>
                  <View style={styles.goalTop}>
                    <Text style={styles.goalTitulo} numberOfLines={1}>{o.titulo}</Text>
                    <Text style={styles.goalPct}>{pct}%</Text>
                  </View>
                  <View style={styles.goalTrack}>
                    <GradientView colors={gradients.progress} direction="horizontal" style={[styles.bar, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.goalMeta}>{doneN}/{totalN} passos</Text>
                </View>
              )
            })}
          </View>

          {/* Achievements */}
          <View style={styles.secaoRow}>
            <Text style={styles.secaoTitulo}>Conquistas</Text>
            <Text style={styles.secaoLink}>{achDone}/{CONQUISTAS.length}</Text>
          </View>
          <View style={{ gap: 10 }}>
            {CONQUISTAS.map(c => {
              const done = conquistaDesbloqueada(c)
              return (
                <View key={c.id} style={styles.achRow} accessible accessibilityLabel={`${c.titulo}. ${c.desc}. ${done ? 'Conquistada' : 'Bloqueada'}`}>
                  <View style={[styles.achTile, { backgroundColor: done ? colors.primaryLight : colors.surfaceAlt }]}>
                    <Icon name={c.icon} size={22} color={done ? colors.primary : '#B4B2A9'} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.achTitulo, { color: done ? colors.textStrong : colors.textMuted }]}>{c.titulo}</Text>
                    <Text style={styles.achDesc}>{c.desc}</Text>
                  </View>
                  {done && <Icon name="star" size={18} color={colors.amber} />}
                </View>
              )
            })}
          </View>

          {/* Settings */}
          <View style={styles.settings}>
            <TouchableOpacity style={styles.settingRow} onPress={() => { setNovoNome(perfil.nome); setModalNome(true) }} accessibilityRole="button" accessibilityLabel="Editar nome">
              <Icon name="pencil" size={20} color={colors.primary} />
              <Text style={styles.settingTexto}>Editar nome</Text>
              <Icon name="chevronRight" size={18} color="#C2CBC4" strokeWidth={2.4} />
            </TouchableOpacity>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <Icon name="moon" size={20} color={colors.primary} />
              <Text style={styles.settingTexto}>Tema escuro</Text>
              <Switch value={temaEscuro} onValueChange={alternarTema} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="white" accessibilityLabel="Tema escuro" />
            </View>
            <View style={styles.settingDivider} />
            <TouchableOpacity style={styles.settingRow} onPress={confirmarReset} accessibilityRole="button" accessibilityLabel="Resetar dados" accessibilityHint="Apaga todos os seus dados permanentemente">
              <Icon name="logOut" size={20} color={colors.pink} />
              <Text style={[styles.settingTexto, { color: colors.pink }]}>Resetar dados</Text>
              <Icon name="chevronRight" size={18} color="#C2CBC4" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalNome} transparent animationType="slide" onRequestClose={() => setModalNome(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalFundo}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Editar nome</Text>
              <TextInput style={styles.input} value={novoNome} onChangeText={setNovoNome} autoFocus maxLength={20} />
              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalNome(false)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarNome}>
                  <Text style={styles.botaoSalvarTexto}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: 22, paddingBottom: 56, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  gear: { position: 'absolute', top: 18, right: 22, zIndex: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 14 },
  avatar: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)' },
  avatarTexto: { fontSize: 25, fontWeight: '800', color: '#fff' },
  nome: { fontSize: 21, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  levelPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 11, paddingVertical: 5, borderRadius: radii.full, marginTop: 8 },
  levelPillTexto: { fontSize: 12, fontWeight: '700', color: '#fff' },

  body: { paddingHorizontal: 18, marginTop: -38 },

  progressCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 18, ...shadows.card },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: colors.textStrong },
  progressXp: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  track: { height: 10, borderRadius: radii.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: radii.full },

  secaoTitulo: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.2, marginTop: 24, marginBottom: 12, marginLeft: 4 },
  secaoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12, marginHorizontal: 4 },
  secaoLink: { fontSize: 12.5, fontWeight: '700', color: colors.primary },

  journeyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  journeyCard: { width: '47.8%', flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 15 },
  journeyTile: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  journeyN: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, marginTop: 11 },
  journeyLabel: { fontSize: 11.5, fontWeight: '600', color: colors.textSecondary, marginTop: 1 },

  card: { marginTop: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 17 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitulo: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.2 },
  streakPill: { fontSize: 12, fontWeight: '700', color: '#9A6312', backgroundColor: colors.amberLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full, overflow: 'hidden' },
  heatRow: { flexDirection: 'row', gap: 5 },
  heatCell: { flex: 1, height: 34, borderRadius: 7 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 },
  cardFooterText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendCell: { width: 11, height: 11, borderRadius: 3 },
  moodTopLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  moodEmoji: { fontSize: 20, width: 24, textAlign: 'center' },
  moodTrack: { flex: 1, height: 9, borderRadius: radii.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  moodBar: { height: '100%', borderRadius: radii.full },
  moodN: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, width: 16, textAlign: 'right' },
  empty: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '500' },

  goalCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: 16, paddingVertical: 15 },
  goalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  goalTitulo: { fontSize: 14.5, fontWeight: '800', color: colors.textStrong, letterSpacing: -0.2, flex: 1 },
  goalPct: { fontSize: 12, fontWeight: '800', color: colors.primary },
  goalTrack: { height: 8, borderRadius: radii.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  goalMeta: { fontSize: 11.5, fontWeight: '600', color: colors.textSecondary, marginTop: 8 },

  achRow: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 14 },
  achTile: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  achTitulo: { fontSize: 14.5, fontWeight: '800', letterSpacing: -0.2 },
  achDesc: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginTop: 2 },

  settings: { marginTop: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingVertical: 15 },
  settingTexto: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textStrong },
  settingDivider: { height: 1, backgroundColor: colors.borderSofter },

  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  modalTitulo: { ...typography.h3, marginBottom: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  modalBotoes: { flexDirection: 'row', gap: spacing.sm },
  botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
  botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '700' },
  })
}
