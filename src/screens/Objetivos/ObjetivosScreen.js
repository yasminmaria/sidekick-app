import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native'
import { useState, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { useAppStore } from '../../store/useAppStore'
import { spacing, radii, typography, gradients, goalGradients, goalColorByPrazo } from '../../theme'
import { useThemeColors } from '../../theme/ThemeContext'
import Icon from '../../components/ui/Icon'
import GradientView from '../../components/ui/GradientView'

const LABEL_PRAZO = { curto: 'Curto prazo', medio: 'Médio prazo', longo: 'Longo prazo' }
const COR_PRAZO = { curto: '#EFA436', medio: '#0E1A16', longo: '#1D9E75' }

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    headerWrap: { paddingHorizontal: 22, paddingBottom: 8 },
    titulo: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 18 },

    donutCard: { borderRadius: radii.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
    donutWrap: { width: 120, height: 120 },
    donutCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    donutPct: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -1 },
    donutSub: { fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
    donutRightTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 4 },
    donutRightDesc: { fontSize: 12.5, fontWeight: '500', color: 'rgba(255,255,255,0.62)', lineHeight: 19 },

    body: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 0 },

    goalCard: { borderRadius: radii.xl, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
    goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    goalPrazo: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
    goalTitulo: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
    goalProgressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, marginBottom: 7 },
    goalProgressLabel: { fontSize: 12, fontWeight: '700' },
    goalProgressPct: { fontSize: 12, fontWeight: '800' },
    track: { height: 8, borderRadius: radii.full, overflow: 'hidden' },
    bar: { height: '100%', borderRadius: radii.full },

    steps: { marginTop: 16, gap: 3 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8 },
    stepBox: { width: 21, height: 21, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    stepText: { fontSize: 14, fontWeight: '600', flex: 1 },
    addStep: {
      marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
      borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 11,
    },
    addStepTexto: { fontSize: 13, fontWeight: '700' },

    novaMeta: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
      backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.dashedBorder, borderStyle: 'dashed',
      borderRadius: radii.xl, paddingVertical: 18, marginBottom: 14,
    },
    novaMetaTexto: { color: colors.primary, fontSize: 15, fontWeight: '800' },

    vazio: { alignItems: 'center', paddingVertical: spacing.xl },
    vazioTexto: { fontSize: 14, fontWeight: '700', color: colors.textStrong },
    vazioDica: { fontSize: 12.5, color: colors.textSecondary, marginTop: 3, textAlign: 'center' },

    modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
    modalTitulo: { ...typography.h3, marginBottom: spacing.md },
    inputLabel: { ...typography.label, marginBottom: spacing.xs },
    input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
    prazoSelector: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    prazoOpcao: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    prazoOpcaoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    modalBotoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
    botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
    botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '700' },
  })
}

export default function ObjetivosScreen() {
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const {
    objetivos, adicionarObjetivo, editarObjetivo, deletarObjetivo,
    adicionarTarefaObjetivo, concluirTarefaObjetivo,
  } = useAppStore()

  const [abertos, setAbertos] = useState({})
  const [objetivoEditando, setObjetivoEditando] = useState(null)
  const [modalNovoObjetivo, setModalNovoObjetivo] = useState(false)
  const [novoObjetivo, setNovoObjetivo] = useState({ titulo: '', prazo: 'curto' })
  const [stepModal, setStepModal] = useState(null) // { goalId }
  const [novoPasso, setNovoPasso] = useState('')

  const totais = useMemo(() => {
    let total = 0, feitas = 0
    objetivos.forEach(o => { total += o.tarefas.length; feitas += o.tarefas.filter(t => t.concluida).length })
    return { total, feitas, pct: total ? Math.round((feitas / total) * 100) : 0 }
  }, [objetivos])

  function toggleAberto(id) { setAbertos(a => ({ ...a, [id]: !a[id] })) }

  function onLongPress(objetivo) {
    Alert.alert(objetivo.titulo, 'O que você quer fazer?', [
      { text: 'Editar', onPress: () => { setObjetivoEditando(objetivo); setNovoObjetivo({ titulo: objetivo.titulo, prazo: objetivo.prazo }); setModalNovoObjetivo(true) } },
      {
        text: 'Apagar', style: 'destructive', onPress: () =>
          Alert.alert('Apagar meta?', 'Todos os passos vinculados também serão apagados. Isso não pode ser desfeito.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Apagar meta', style: 'destructive', onPress: () => deletarObjetivo(objetivo.id) },
          ])
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  function salvarObjetivo() {
    if (!novoObjetivo.titulo.trim()) return
    if (objetivoEditando) {
      editarObjetivo(objetivoEditando.id, { titulo: novoObjetivo.titulo, prazo: novoObjetivo.prazo, cor: COR_PRAZO[novoObjetivo.prazo] })
      setObjetivoEditando(null)
    } else {
      adicionarObjetivo({ ...novoObjetivo, cor: COR_PRAZO[novoObjetivo.prazo] })
    }
    setNovoObjetivo({ titulo: '', prazo: 'curto' })
    setModalNovoObjetivo(false)
  }

  function salvarPasso() {
    if (!novoPasso.trim() || !stepModal) return
    adicionarTarefaObjetivo(stepModal.goalId, novoPasso.trim())
    setNovoPasso('')
    setStepModal(null)
  }

  // Donut geometry
  const R = 54
  const C = 2 * Math.PI * R
  const donutOffset = C * (1 - totais.pct / 100)

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>

        <View style={[styles.headerWrap, { paddingTop: insets.top + 14 }]}>
          <Text style={styles.titulo}>Minhas metas</Text>
          <GradientView colors={gradients.focus} style={styles.donutCard}>
            <View style={styles.donutWrap}>
              <Svg width={120} height={120}>
                <Circle cx={60} cy={60} r={R} stroke="rgba(255,255,255,0.12)" strokeWidth={11} fill="none" />
                <Circle
                  cx={60} cy={60} r={R}
                  stroke={colors.brightGreen} strokeWidth={11} fill="none" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={donutOffset}
                  transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={styles.donutCenter}>
                <Text style={styles.donutPct}>{totais.pct}%</Text>
                <Text style={styles.donutSub}>concluído</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.donutRightTitle}>Você está indo bem 🌿</Text>
              <Text style={styles.donutRightDesc}>
                {totais.feitas} de {totais.total} passos concluídos em {objetivos.length} {objetivos.length === 1 ? 'meta ativa' : 'metas ativas'}.
              </Text>
            </View>
          </GradientView>
        </View>

        <View style={styles.body}>
          {objetivos.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioTexto}>Nenhuma meta ainda</Text>
              <Text style={styles.vazioDica}>Crie sua primeira meta abaixo</Text>
            </View>
          ) : (
            objetivos.map(o => {
              const key = goalColorByPrazo[o.prazo] || 'teal'
              const g = goalGradients[key]
              const totalN = o.tarefas.length
              const doneN = o.tarefas.filter(t => t.concluida).length
              const pct = totalN ? Math.round((doneN / totalN) * 100) : 0
              const aberto = !!abertos[o.id]
              return (
                <GradientView key={o.id} colors={g.colors} style={styles.goalCard}>
                  <TouchableOpacity
                    style={styles.goalHeader}
                    activeOpacity={0.8}
                    onPress={() => toggleAberto(o.id)}
                    onLongPress={() => onLongPress(o)}
                    delayLongPress={400}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: aberto }}
                    accessibilityLabel={`${o.titulo}, ${doneN} de ${totalN} passos, ${pct}%`}
                    accessibilityHint="Toque para ver os passos, mantenha pressionado para editar"
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.goalPrazo, { color: g.sub }]}>{LABEL_PRAZO[o.prazo]}</Text>
                      <Text style={[styles.goalTitulo, { color: g.fg }]}>{o.titulo}</Text>
                    </View>
                    <Icon name={aberto ? 'chevronDown' : 'chevronRight'} size={20} color={g.fg} strokeWidth={2.2} />
                  </TouchableOpacity>

                  <View style={styles.goalProgressRow}>
                    <Text style={[styles.goalProgressLabel, { color: g.sub }]}>{doneN}/{totalN} passos</Text>
                    <Text style={[styles.goalProgressPct, { color: g.fg }]}>{pct}%</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: g.track }]}>
                    <View style={[styles.bar, { width: `${pct}%`, backgroundColor: g.bar }]} />
                  </View>

                  {aberto && (
                    <View style={styles.steps}>
                      {o.tarefas.map(t => (
                        <TouchableOpacity
                          key={t.id}
                          style={styles.stepRow}
                          activeOpacity={0.7}
                          onPress={() => concluirTarefaObjetivo(o.id, t.id)}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: t.concluida }}
                          accessibilityLabel={t.titulo}
                        >
                          <View style={[styles.stepBox, { backgroundColor: t.concluida ? g.bar : 'transparent', borderColor: t.concluida ? g.bar : g.sub }]}>
                            {t.concluida && <Icon name="check" size={13} color={g.checkColor} strokeWidth={3.2} />}
                          </View>
                          <Text style={[styles.stepText, { color: t.concluida ? g.sub : g.fg, textDecorationLine: t.concluida ? 'line-through' : 'none' }]}>{t.titulo}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[styles.addStep, { backgroundColor: g.chip, borderColor: g.sub }]}
                        activeOpacity={0.8}
                        onPress={() => { setStepModal({ goalId: o.id }); setNovoPasso('') }}
                        accessibilityRole="button"
                        accessibilityLabel={`Adicionar passo em ${o.titulo}`}
                      >
                        <Icon name="plus" size={16} color={g.fg} strokeWidth={2.4} />
                        <Text style={[styles.addStepTexto, { color: g.fg }]}>Adicionar passo</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </GradientView>
              )
            })
          )}

          <TouchableOpacity style={styles.novaMeta} activeOpacity={0.85} onPress={() => { setObjetivoEditando(null); setNovoObjetivo({ titulo: '', prazo: 'curto' }); setModalNovoObjetivo(true) }} accessibilityRole="button" accessibilityLabel="Nova meta">

            <Icon name="plus" size={20} color={colors.primary} strokeWidth={2.6} />
            <Text style={styles.novaMetaTexto}>Nova meta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal nova/editar meta */}
      <Modal visible={modalNovoObjetivo} transparent animationType="slide" onRequestClose={() => setModalNovoObjetivo(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalFundo}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>{objetivoEditando ? 'Editar meta' : 'Nova meta'}</Text>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput style={styles.input} placeholder="Ex: Conquistar um novo objetivo" placeholderTextColor={colors.textMuted} value={novoObjetivo.titulo} onChangeText={t => setNovoObjetivo({ ...novoObjetivo, titulo: t })} autoFocus />
              <Text style={styles.inputLabel}>Prazo</Text>
              <View style={styles.prazoSelector}>
                {['curto', 'medio', 'longo'].map(p => (
                  <TouchableOpacity key={p} style={[styles.prazoOpcao, novoObjetivo.prazo === p && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setNovoObjetivo({ ...novoObjetivo, prazo: p })}>
                    <Text style={[styles.prazoOpcaoTexto, novoObjetivo.prazo === p && { color: 'white' }]}>{LABEL_PRAZO[p]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalNovoObjetivo(false)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarObjetivo}>
                  <Text style={styles.botaoSalvarTexto}>{objetivoEditando ? 'Salvar alterações' : 'Criar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal adicionar passo */}
      <Modal visible={!!stepModal} transparent animationType="slide" onRequestClose={() => setStepModal(null)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalFundo}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Novo passo</Text>
              <TextInput style={styles.input} placeholder="Ex: Pesquisar referências" placeholderTextColor={colors.textMuted} value={novoPasso} onChangeText={setNovoPasso} autoFocus />
              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setStepModal(null)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarPasso}>
                  <Text style={styles.botaoSalvarTexto}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}
