import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Switch, Alert } from 'react-native'
import { useState, useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppStore } from '../../store/useAppStore'
import { spacing, radii, typography } from '../../theme'
import { useThemeColors, useTint, useTints } from '../../theme/ThemeContext'
import Icon from '../../components/ui/Icon'
import GradientView from '../../components/ui/GradientView'
import { tintForIndex } from '../../utils/visuals'

const TIPOS = [
  { valor: 'comprimido', label: '💊 Comprimido' },
  { valor: 'capsula', label: '💉 Cápsula' },
  { valor: 'liquido', label: '🧪 Líquido' },
  { valor: 'topico', label: '🧴 Tópico' },
]

const FREQUENCIAS_MED = [
  { valor: 'diaria', label: '📅 Diária' },
  { valor: 'semanal', label: '📆 Semanal' },
  { valor: 'quando_necessario', label: '⚡ Quando necessário' },
]

const DIAS_SEMANA = [
  { valor: 'dom', label: 'D' }, { valor: 'seg', label: 'S' }, { valor: 'ter', label: 'T' },
  { valor: 'qua', label: 'Q' }, { valor: 'qui', label: 'Q' }, { valor: 'sex', label: 'S' }, { valor: 'sab', label: 'S' },
]

const HORARIOS_SUGERIDOS = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00']

// Humor
const MOODS = [
  { emoji: '😄', label: 'Ótimo', valor: 5, color: '#1D9E75', tint: '#E1F5EE' },
  { emoji: '🙂', label: 'Bem', valor: 4, color: '#6FA53B', tint: '#EAF3DD' },
  { emoji: '😐', label: 'Neutro', valor: 3, color: '#C98A1E', tint: '#FAEEDA' },
  { emoji: '😔', label: 'Pra baixo', valor: 2, color: '#D2733E', tint: '#FBEADD' },
  { emoji: '😣', label: 'Difícil', valor: 1, color: '#C13E68', tint: '#FBEAF0' },
]
const FOCUS_LABELS = ['—', 'Muito disperso', 'Disperso', 'Equilibrado', 'Focado', 'Muito focado']
const ENERGY_LABELS = ['—', 'Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta']

function moodByValor(v) { return MOODS.find(m => m.valor === v) || MOODS[2] }

function estadoInicialMed() {
  return {
    nome: '', tipo: 'comprimido', dosagem: '', frequencia: 'diaria',
    dias: ['seg', 'ter', 'qua', 'qui', 'sex'], horarios: ['08:00'],
    duracao: 'continuo', dataInicio: new Date().toISOString().split('T')[0],
    dataTermino: null, quantidade: '30', avisarReposicao: true, quantidadeAviso: '10',
  }
}

const SEGMENTOS = [
  { id: 'habitos', label: 'Hábitos' },
  { id: 'humor', label: 'Humor' },
  { id: 'medicamentos', label: 'Remédios' },
]

export default function CuidadosScreen() {
  const colors = useThemeColors()
  const tint = useTint()
  const tints = useTints()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const {
    habitos, adicionarHabito, concluirHabito, incrementarHabito,
    medicamentos, adicionarMedicamento, editarMedicamento, deletarMedicamento, registrarDose,
    registrosHumor, registrarHumor, deletarRegistroHumor,
  } = useAppStore()

  const [aba, setAba] = useState('habitos')
  const [modalHabito, setModalHabito] = useState(false)
  const [modalMedicamento, setModalMedicamento] = useState(false)
  const [novoHabito, setNovoHabito] = useState({ titulo: '', emoji: '⭐', tipo: 'simples', meta: '8', unidade: 'vezes' })
  const [novoMed, setNovoMed] = useState(estadoInicialMed())
  const [medEditando, setMedEditando] = useState(null)
  const [novoHorario, setNovoHorario] = useState('')

  // Humor check-in state
  const [moodSel, setMoodSel] = useState(null)
  const [focusSel, setFocusSel] = useState(0)
  const [energySel, setEnergySel] = useState(0)

  const habitosFeitos = habitos.filter(h => h.tipo === 'contador' ? h.progresso >= h.meta : h.concluidoHoje).length
  const streakMax = habitos.length ? Math.max(...habitos.map(h => h.streak)) : 0

  const hoje = new Date().toISOString().split('T')[0]
  const checkinsHoje = useMemo(() => registrosHumor.filter(r => r.data === hoje), [registrosHumor, hoje])
  const canSave = moodSel !== null && focusSel > 0 && energySel > 0

  function salvarHabito() {
    if (!novoHabito.titulo.trim()) return
    adicionarHabito({
      titulo: novoHabito.titulo,
      emoji: novoHabito.emoji,
      tipo: novoHabito.tipo,
      meta: novoHabito.tipo === 'contador' ? parseInt(novoHabito.meta) || 1 : null,
      unidade: novoHabito.tipo === 'contador' ? novoHabito.unidade : null,
    })
    setNovoHabito({ titulo: '', emoji: '⭐', tipo: 'simples', meta: '8', unidade: 'vezes' })
    setModalHabito(false)
  }

  function abrirEditarMed(med) {
    setMedEditando(med)
    setNovoMed({
      nome: med.nome, tipo: med.tipo, dosagem: med.dosagem,
      frequencia: med.frequencia, dias: med.dias || [],
      horarios: med.horarios || [], duracao: med.duracao,
      dataInicio: med.dataInicio, dataTermino: med.dataTermino,
      quantidade: String(med.quantidade), avisarReposicao: med.avisarReposicao,
      quantidadeAviso: String(med.quantidadeAviso),
    })
    setModalMedicamento(true)
  }

  function onLongPressMed(med) {
    Alert.alert(med.nome, 'O que você quer fazer?', [
      { text: 'Editar', onPress: () => abrirEditarMed(med) },
      {
        text: 'Apagar', style: 'destructive', onPress: () =>
          Alert.alert('Apagar medicamento?', `"${med.nome}" será apagado permanentemente.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Apagar medicamento', style: 'destructive', onPress: () => deletarMedicamento(med.id) },
          ])
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  function salvarMedicamento() {
    if (!novoMed.nome.trim()) return
    const dados = {
      ...novoMed,
      quantidade: parseInt(novoMed.quantidade) || 30,
      quantidadeAviso: parseInt(novoMed.quantidadeAviso) || 10,
      dataTermino: novoMed.duracao === 'continuo' ? null : novoMed.dataTermino,
    }
    if (medEditando) { editarMedicamento(medEditando.id, dados); setMedEditando(null) }
    else adicionarMedicamento(dados)
    setNovoMed(estadoInicialMed())
    setModalMedicamento(false)
  }

  function toggleDiaMed(dia) {
    const ja = novoMed.dias.includes(dia)
    setNovoMed({ ...novoMed, dias: ja ? novoMed.dias.filter(d => d !== dia) : [...novoMed.dias, dia] })
  }
  function toggleHorario(h) {
    const ja = novoMed.horarios.includes(h)
    setNovoMed({ ...novoMed, horarios: ja ? novoMed.horarios.filter(x => x !== h) : [...novoMed.horarios, h].sort() })
  }
  function adicionarHorarioCustom() {
    if (!novoHorario.match(/^\d{2}:\d{2}$/) || novoMed.horarios.includes(novoHorario)) return
    setNovoMed({ ...novoMed, horarios: [...novoMed.horarios, novoHorario].sort() })
    setNovoHorario('')
  }

  function salvarCheckin() {
    if (!canSave) return
    const m = MOODS[moodSel]
    registrarHumor(m.emoji, m.valor, '', focusSel, energySel)
    setMoodSel(null); setFocusSel(0); setEnergySel(0)
  }

  function confirmarDeletarCheckin(id, emoji) {
    Alert.alert('Remover check-in?', `O registro ${emoji} será removido.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deletarRegistroHumor(id) },
    ])
  }

  // ----- Renders -----
  function renderHabitos() {
    return (
      <View style={styles.body}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statBig}>{habitosFeitos}<Text style={styles.statBigFaint}>/{habitos.length}</Text></Text>
            <Text style={styles.statLabel}>hábitos hoje</Text>
          </View>
          <GradientView colors={['#EFA436', '#D98A12']} style={styles.statCardGrad}>
            <View style={styles.statStreakRow}>
              <Icon name="flame" size={22} color="#fff" strokeWidth={2.4} />
              <Text style={styles.statBigWhite}>{streakMax}</Text>
            </View>
            <Text style={styles.statLabelWhite}>maior streak</Text>
          </GradientView>
        </View>

        {habitos.map((h, i) => {
          const tt = tint(tintForIndex(i))
          const isCount = h.tipo === 'contador'
          const done = isCount ? h.progresso >= h.meta : h.concluidoHoje
          const pct = isCount && h.meta ? Math.min(Math.round((h.progresso / h.meta) * 100), 100) : (done ? 100 : 0)
          return (
            <View key={h.id} style={[styles.habitCard, { borderColor: done ? '#BFE9D7' : colors.border }]}>
              <View style={styles.habitTop}>
                <View style={[styles.habitTile, { backgroundColor: tt.bg }]}>
                  <Text style={{ fontSize: 22 }}>{h.emoji}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.habitTitulo}>{h.titulo}</Text>
                  <View style={styles.habitSubRow}>
                    {h.streak > 0 && <Icon name="flame" size={12} color={colors.amber} strokeWidth={2.4} />}
                    <Text style={styles.habitSub}>
                      {isCount ? `${h.progresso}/${h.meta} ${h.unidade}` : (h.streak > 0 ? `${h.streak} dias seguidos` : 'Todos os dias')}
                    </Text>
                  </View>
                </View>
                {isCount ? (
                  <View style={styles.countRow}>
                    <TouchableOpacity
                      style={styles.countBtn}
                      onPress={() => !done && incrementarHabito(h.id, -1)}
                      disabled={done}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: done }}
                      accessibilityLabel={`Diminuir ${h.titulo}, ${h.progresso} de ${h.meta} ${h.unidade}`}
                    >
                      <Icon name="minus" size={16} color={colors.textSecondary} strokeWidth={2.6} />
                    </TouchableOpacity>
                    <Text style={styles.countValor}>{h.progresso}</Text>
                    <TouchableOpacity
                      style={styles.countBtnPlus}
                      onPress={() => !done && incrementarHabito(h.id, 1)}
                      disabled={done}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: done }}
                      accessibilityLabel={`Aumentar ${h.titulo}, ${h.progresso} de ${h.meta} ${h.unidade}`}
                    >
                      <Icon name="plus" size={16} color="#fff" strokeWidth={2.8} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.checkBtn, { borderColor: done ? colors.primary : colors.checkBorder, backgroundColor: done ? colors.primary : colors.surface }]}
                    onPress={() => concluirHabito(h.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                    accessibilityLabel={`${h.titulo}, hábito de hoje`}
                  >
                    {done && <Icon name="check" size={17} color="#fff" strokeWidth={3} />}
                  </TouchableOpacity>
                )}
              </View>
              {isCount && (
                <View style={styles.habitTrack}>
                  <View style={[styles.habitBar, { width: `${pct}%`, backgroundColor: tt.fg }]} />
                </View>
              )}
            </View>
          )
        })}

        <TouchableOpacity style={styles.dashedBtn} activeOpacity={0.85} onPress={() => setModalHabito(true)} accessibilityRole="button" accessibilityLabel="Novo hábito">
          <Icon name="plus" size={18} color={colors.primary} strokeWidth={2.6} />
          <Text style={styles.dashedBtnTexto}>Novo hábito</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function renderMeds() {
    return (
      <View style={styles.body}>
        {medicamentos.map(med => {
          const low = med.avisarReposicao && med.quantidade <= med.quantidadeAviso
          const tt = tints.teal
          return (
            <TouchableOpacity
              key={med.id}
              activeOpacity={1}
              onLongPress={() => onLongPressMed(med)}
              delayLongPress={400}
              style={styles.medCard}
              accessibilityLabel={`${med.nome}, ${med.quantidade} restam${low ? ', acabando' : ''}`}
              accessibilityHint="Mantenha pressionado para editar ou apagar"
            >
              <View style={styles.medHeader}>
                <View style={[styles.medTile, { backgroundColor: tt.bg }]}>
                  <Icon name="pill" size={22} color={tt.fg} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.medNome}>{med.nome}</Text>
                  <Text style={styles.medForma}>{TIPOS.find(t => t.valor === med.tipo)?.label.split(' ')[1] || 'Remédio'}{med.dosagem ? ` · ${med.dosagem}` : ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.medRestam, { color: low ? colors.pink : colors.teal }]}>{med.quantidade}</Text>
                  <Text style={styles.medRestamLabel}>restam</Text>
                </View>
              </View>

              {low && (
                <View style={styles.medAlert}>
                  <Icon name="alert" size={16} color={colors.pinkDark} strokeWidth={2.2} />
                  <Text style={styles.medAlertTexto}>Acabando — peça reposição</Text>
                </View>
              )}

              <View style={styles.doseRow}>
                {(med.horarios || []).map(h => {
                  const taken = (med.tomadosHoje || []).includes(h)
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.dose, { borderColor: taken ? colors.tealAccent : colors.dividerGreen, backgroundColor: taken ? colors.primaryLight : colors.surface }]}
                      onPress={() => registrarDose(med.id, h)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: taken }}
                      accessibilityLabel={`${med.nome} ${h}, ${taken ? 'tomado' : 'não tomado'}`}
                    >
                      <Text style={[styles.doseTime, { color: taken ? colors.primary : colors.textStrong }]}>{h}</Text>
                      <View style={[styles.dosePill, { backgroundColor: taken ? colors.primary : colors.surface, borderColor: taken ? colors.primary : colors.checkBorder }]}>
                        {taken && <Icon name="check" size={13} color="#fff" strokeWidth={3} />}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </TouchableOpacity>
          )
        })}

        <TouchableOpacity style={styles.dashedBtn} activeOpacity={0.85} onPress={() => { setMedEditando(null); setNovoMed(estadoInicialMed()); setModalMedicamento(true) }} accessibilityRole="button" accessibilityLabel="Adicionar medicamento">
          <Icon name="plus" size={18} color={colors.primary} strokeWidth={2.6} />
          <Text style={styles.dashedBtnTexto}>Adicionar medicamento</Text>
        </TouchableOpacity>
      </View>
    )
  }

  function renderHumor() {
    return (
      <View style={styles.body}>
        <View style={styles.humorCard}>
          <Text style={styles.humorTitulo}>Como você está agora?</Text>
          <Text style={styles.humorSub}>Registre seu humor ao longo do dia</Text>

          <View style={styles.moodRow}>
            {MOODS.map((m, i) => {
              const on = moodSel === i
              return (
                <TouchableOpacity
                  key={m.valor}
                  style={[styles.moodBtn, { borderColor: on ? m.color : colors.dividerGreen, backgroundColor: on ? m.tint : colors.surfaceAlt }]}
                  onPress={() => setMoodSel(on ? null : i)}
                  activeOpacity={0.8}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`Humor: ${m.label}`}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, { color: on ? m.color : colors.textSecondary }]}>{m.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Foco */}
          <View style={{ marginTop: 22 }}>
            <View style={styles.scaleHeader}>
              <View style={styles.scaleHeaderLeft}>
                <Icon name="target" size={16} color={colors.primary} />
                <Text style={styles.scaleTitulo}>Foco</Text>
              </View>
              <Text style={[styles.scaleValor, { color: focusSel ? colors.primary : colors.textMuted }]}>{FOCUS_LABELS[focusSel]}</Text>
            </View>
            <View style={styles.scaleRow} accessibilityRole="adjustable" accessibilityLabel={`Foco: ${FOCUS_LABELS[focusSel]}`}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.scaleSeg, { backgroundColor: n <= focusSel ? colors.primary : colors.surfaceAlt }]}
                  onPress={() => setFocusSel(focusSel === n ? 0 : n)}
                  hitSlop={{ top: 8, bottom: 8 }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: n <= focusSel }}
                  accessibilityLabel={`Foco nível ${n} de 5`}
                />
              ))}
            </View>
            <View style={styles.scaleEnds}><Text style={styles.scaleEnd}>Disperso</Text><Text style={styles.scaleEnd}>Focado</Text></View>
          </View>

          {/* Energia */}
          <View style={{ marginTop: 19 }}>
            <View style={styles.scaleHeader}>
              <View style={styles.scaleHeaderLeft}>
                <Icon name="flame" size={16} color={colors.amber} strokeWidth={2.2} />
                <Text style={styles.scaleTitulo}>Energia</Text>
              </View>
              <Text style={[styles.scaleValor, { color: energySel ? '#C98A1E' : colors.textMuted }]}>{ENERGY_LABELS[energySel]}</Text>
            </View>
            <View style={styles.scaleRow} accessibilityRole="adjustable" accessibilityLabel={`Energia: ${ENERGY_LABELS[energySel]}`}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.scaleSeg, { backgroundColor: n <= energySel ? colors.amber : colors.surfaceAlt }]}
                  onPress={() => setEnergySel(energySel === n ? 0 : n)}
                  hitSlop={{ top: 8, bottom: 8 }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: n <= energySel }}
                  accessibilityLabel={`Energia nível ${n} de 5`}
                />
              ))}
            </View>
            <View style={styles.scaleEnds}><Text style={styles.scaleEnd}>Baixa</Text><Text style={styles.scaleEnd}>Alta</Text></View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: canSave ? colors.primary : colors.surfaceAlt }]}
            onPress={salvarCheckin}
            disabled={!canSave}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            accessibilityLabel={canSave ? 'Registrar check-in' : 'Selecione humor, foco e energia para registrar'}
          >
            {canSave && <Icon name="check" size={18} color="#fff" strokeWidth={3} />}
            <Text style={[styles.saveBtnTexto, { color: canSave ? '#fff' : colors.textSecondary }]}>
              {canSave ? 'Registrar check-in' : 'Selecione humor, foco e energia'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.todayHeader}>
          <Text style={styles.todayTitulo}>Hoje</Text>
          <Text style={styles.todayCount}>{checkinsHoje.length} check-ins</Text>
        </View>

        {checkinsHoje.length === 0 ? (
          <View style={styles.noCheckins}>
            <Text style={{ fontSize: 30, marginBottom: 6 }}>🌤️</Text>
            <Text style={styles.noCheckinsTitulo}>Nenhum check-in ainda hoje</Text>
            <Text style={styles.noCheckinsDica}>Registre como você está se sentindo acima.</Text>
          </View>
        ) : (
          checkinsHoje.map(c => {
            const m = moodByValor(c.valor)
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.8}
                onLongPress={() => confirmarDeletarCheckin(c.id, c.emoji)}
                delayLongPress={400}
                style={styles.checkinRow}
                accessibilityLabel={`${m.label} às ${c.time}${c.foco ? `, foco ${FOCUS_LABELS[c.foco]?.toLowerCase()}` : ''}${c.energia ? `, energia ${ENERGY_LABELS[c.energia]?.toLowerCase()}` : ''}`}
                accessibilityHint="Mantenha pressionado para remover"
              >
                <View style={[styles.checkinEmoji, { backgroundColor: m.tint }]}>
                  <Text style={{ fontSize: 23 }}>{c.emoji}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.checkinLabel}>{m.label}</Text>
                  {(c.foco || c.energia) && (
                    <View style={styles.checkinChips}>
                      {c.foco ? <Text style={styles.chipFoco}>Foco {FOCUS_LABELS[c.foco]?.toLowerCase()}</Text> : null}
                      {c.energia ? <Text style={styles.chipEnergia}>Energia {ENERGY_LABELS[c.energia]?.toLowerCase()}</Text> : null}
                    </View>
                  )}
                  {c.nota ? <Text style={styles.checkinNota}>{c.nota}</Text> : null}
                </View>
                <Text style={styles.checkinHora}>{c.hora}</Text>
              </TouchableOpacity>
            )
          })
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* Sticky header with segmented control */}
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <Text style={styles.titulo}>Cuidados</Text>
          <View style={styles.segmented}>
            {SEGMENTOS.map(s => {
              const active = aba === s.id
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.seg, active && styles.segActive]}
                  onPress={() => setAba(s.id)}
                  activeOpacity={0.8}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={s.label}
                >
                  <Text style={[styles.segTexto, { color: active ? colors.primary : colors.textSecondary }]}>{s.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {aba === 'habitos' && renderHabitos()}
        {aba === 'humor' && renderHumor()}
        {aba === 'medicamentos' && renderMeds()}
      </ScrollView>

      {/* MODAL HÁBITO */}
      <Modal visible={modalHabito} transparent animationType="slide" onRequestClose={() => setModalHabito(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalFundo}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitulo}>Novo hábito</Text>

                <Text style={styles.inputLabel}>Emoji</Text>
                <View style={styles.emojiRow}>
                  {['💧', '🏃', '🧘', '📚', '🥗', '😴', '💊', '✍️', '🏋️', '🚴'].map(e => (
                    <TouchableOpacity key={e} style={[styles.emojiOpcao, novoHabito.emoji === e && styles.emojiSelecionado]} onPress={() => setNovoHabito({ ...novoHabito, emoji: e })}>
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Nome do hábito</Text>
                <TextInput style={styles.input} placeholder="Ex: Beber água" placeholderTextColor={colors.textMuted} value={novoHabito.titulo} onChangeText={t => setNovoHabito({ ...novoHabito, titulo: t })} autoFocus />

                <Text style={styles.inputLabel}>Tipo</Text>
                <View style={styles.tipoHabitoRow}>
                  <TouchableOpacity style={[styles.tipoHabitoOpcao, novoHabito.tipo === 'simples' && styles.tipoHabitoAtivo]} onPress={() => setNovoHabito({ ...novoHabito, tipo: 'simples' })}>
                    <Text style={styles.tipoHabitoIcone}>✅</Text>
                    <Text style={[styles.tipoHabitoTexto, novoHabito.tipo === 'simples' && styles.tipoHabitoTextoAtivo]}>Simples</Text>
                    <Text style={styles.tipoHabitoDesc}>Feito ou não feito</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tipoHabitoOpcao, novoHabito.tipo === 'contador' && styles.tipoHabitoAtivo]} onPress={() => setNovoHabito({ ...novoHabito, tipo: 'contador' })}>
                    <Text style={styles.tipoHabitoIcone}>🔢</Text>
                    <Text style={[styles.tipoHabitoTexto, novoHabito.tipo === 'contador' && styles.tipoHabitoTextoAtivo]}>Contador</Text>
                    <Text style={styles.tipoHabitoDesc}>Acompanha quantidade</Text>
                  </TouchableOpacity>
                </View>

                {novoHabito.tipo === 'contador' && (
                  <View style={styles.contadorCampos}>
                    <View style={styles.contadorRow}>
                      <View style={styles.contadorCampo}>
                        <Text style={styles.inputLabel}>Meta diária</Text>
                        <TextInput style={styles.input} keyboardType="numeric" placeholder="Ex: 8" placeholderTextColor={colors.textMuted} value={novoHabito.meta} onChangeText={t => setNovoHabito({ ...novoHabito, meta: t })} />
                      </View>
                      <View style={styles.contadorCampo}>
                        <Text style={styles.inputLabel}>Unidade</Text>
                        <TextInput style={styles.input} placeholder="Ex: copos" placeholderTextColor={colors.textMuted} value={novoHabito.unidade} onChangeText={t => setNovoHabito({ ...novoHabito, unidade: t })} />
                      </View>
                    </View>
                    <View style={styles.unidadesSugeridas}>
                      {['copos', 'km', 'min', 'horas', 'páginas', 'vezes'].map(u => (
                        <TouchableOpacity key={u} style={[styles.unidadePilula, novoHabito.unidade === u && styles.unidadePilulaAtiva]} onPress={() => setNovoHabito({ ...novoHabito, unidade: u })}>
                          <Text style={[styles.unidadeTexto, novoHabito.unidade === u && styles.unidadeTextoAtivo]}>{u}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.modalBotoes}>
                  <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalHabito(false)}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.botaoSalvar} onPress={salvarHabito}>
                    <Text style={styles.botaoSalvarTexto}>Criar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL MEDICAMENTO */}
      <Modal visible={modalMedicamento} transparent animationType="slide" onRequestClose={() => setModalMedicamento(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalFundo}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitulo}>{medEditando ? 'Editar medicamento' : 'Novo medicamento'}</Text>

                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput style={styles.input} placeholder="Ex: Ritalina, Venvanse..." placeholderTextColor={colors.textMuted} value={novoMed.nome} onChangeText={t => setNovoMed({ ...novoMed, nome: t })} autoFocus />

                <Text style={styles.inputLabel}>Tipo</Text>
                <View style={styles.tipoRow}>
                  {TIPOS.map(t => (
                    <TouchableOpacity key={t.valor} style={[styles.tipoOpcao, novoMed.tipo === t.valor && styles.tipoAtivo]} onPress={() => setNovoMed({ ...novoMed, tipo: t.valor })}>
                      <Text style={[styles.tipoTexto, novoMed.tipo === t.valor && styles.tipoTextoAtivo]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Dosagem</Text>
                <TextInput style={styles.input} placeholder="Ex: 18mg, 10ml" placeholderTextColor={colors.textMuted} value={novoMed.dosagem} onChangeText={t => setNovoMed({ ...novoMed, dosagem: t })} />

                <Text style={styles.inputLabel}>Frequência</Text>
                <View style={styles.frequenciaRow}>
                  {FREQUENCIAS_MED.map(f => (
                    <TouchableOpacity key={f.valor} style={[styles.frequenciaOpcao, novoMed.frequencia === f.valor && styles.frequenciaAtiva]} onPress={() => setNovoMed({ ...novoMed, frequencia: f.valor })}>
                      <Text style={[styles.frequenciaTexto, novoMed.frequencia === f.valor && styles.frequenciaTextoAtivo]}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {novoMed.frequencia === 'semanal' && (
                  <View style={styles.diasContainer}>
                    <Text style={styles.inputLabel}>Dias da semana</Text>
                    <View style={styles.diasRow}>
                      {DIAS_SEMANA.map(dia => {
                        const sel = novoMed.dias.includes(dia.valor)
                        return (
                          <TouchableOpacity key={dia.valor} style={[styles.diaBtn, sel && styles.diaBtnAtivo]} onPress={() => toggleDiaMed(dia.valor)}>
                            <Text style={[styles.diaBtnTexto, sel && styles.diaBtnTextoAtivo]}>{dia.label}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>
                )}

                {novoMed.frequencia !== 'quando_necessario' && (
                  <View>
                    <Text style={styles.inputLabel}>Horários</Text>
                    <View style={styles.horariosSugeridos}>
                      {HORARIOS_SUGERIDOS.map(h => {
                        const sel = novoMed.horarios.includes(h)
                        return (
                          <TouchableOpacity key={h} style={[styles.horarioSugerido, sel && styles.horarioSugeridoAtivo]} onPress={() => toggleHorario(h)}>
                            <Text style={[styles.horarioSugeridoTexto, sel && styles.horarioSugeridoTextoAtivo]}>{h}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    <View style={styles.horarioCustomRow}>
                      <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Outro horário (ex: 07:30)" placeholderTextColor={colors.textMuted} value={novoHorario} onChangeText={setNovoHorario} keyboardType="numeric" />
                      <TouchableOpacity style={styles.horarioCustomBtn} onPress={adicionarHorarioCustom}>
                        <Icon name="plus" size={22} color="#fff" strokeWidth={2.6} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Text style={styles.inputLabel}>Duração do tratamento</Text>
                <View style={styles.duracaoRow}>
                  {[{ valor: 'continuo', label: '♾️ Uso contínuo' }, { valor: 'com_termino', label: '📅 Com término' }].map(d => (
                    <TouchableOpacity key={d.valor} style={[styles.duracaoOpcao, novoMed.duracao === d.valor && styles.duracaoAtiva]} onPress={() => setNovoMed({ ...novoMed, duracao: d.valor })}>
                      <Text style={[styles.duracaoTexto, novoMed.duracao === d.valor && styles.duracaoTextoAtivo]}>{d.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {novoMed.duracao === 'com_termino' && (
                  <View>
                    <Text style={styles.inputLabel}>Data de término</Text>
                    <TextInput style={styles.input} placeholder="2025-06-30" placeholderTextColor={colors.textMuted} value={novoMed.dataTermino || ''} onChangeText={t => setNovoMed({ ...novoMed, dataTermino: t })} />
                  </View>
                )}

                <Text style={styles.inputLabel}>Quantidade em estoque</Text>
                <TextInput style={styles.input} placeholder="Ex: 30" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={novoMed.quantidade} onChangeText={t => setNovoMed({ ...novoMed, quantidade: t })} />

                <View style={styles.toggleRow}>
                  <View>
                    <Text style={styles.toggleLabel}>Avisar reposição</Text>
                    <Text style={styles.toggleDesc}>Alerta quando o estoque estiver baixo</Text>
                  </View>
                  <Switch value={novoMed.avisarReposicao} onValueChange={v => setNovoMed({ ...novoMed, avisarReposicao: v })} trackColor={{ false: colors.border, true: colors.teal }} thumbColor="white" />
                </View>

                {novoMed.avisarReposicao && (
                  <View>
                    <Text style={styles.inputLabel}>Avisar quando restar</Text>
                    <TextInput style={styles.input} placeholder="Ex: 10" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={novoMed.quantidadeAviso} onChangeText={t => setNovoMed({ ...novoMed, quantidadeAviso: t })} />
                  </View>
                )}

                <View style={styles.modalBotoes}>
                  <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalMedicamento(false)}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.botaoSalvar, !novoMed.nome.trim() && styles.botaoSalvarDesabilitado]} onPress={salvarMedicamento}>
                    <Text style={styles.botaoSalvarTexto}>{medEditando ? 'Salvar alterações' : 'Salvar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { backgroundColor: colors.surface, paddingHorizontal: 22, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.borderSofter },
  titulo: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5, marginBottom: 16 },
  segmented: { flexDirection: 'row', gap: 4, backgroundColor: colors.surfaceAlt, padding: 4, borderRadius: 14 },
  seg: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  segActive: { backgroundColor: colors.surface, shadowColor: '#0E1A16', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  segTexto: { fontSize: 13, fontWeight: '800' },

  body: { paddingHorizontal: 18, paddingTop: 18 },

  // habit stats
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: 15, paddingVertical: 14 },
  statCardGrad: { flex: 1, borderRadius: radii.lg, paddingHorizontal: 15, paddingVertical: 14 },
  statBig: { fontSize: 26, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  statBigFaint: { fontSize: 15, color: colors.textFaint, fontWeight: '800' },
  statBigWhite: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  statStreakRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { fontSize: 11.5, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  statLabelWhite: { fontSize: 11.5, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // habit card
  habitCard: { backgroundColor: colors.surface, borderWidth: 1, borderRadius: radii.xl, paddingHorizontal: 16, paddingVertical: 15, marginBottom: 11 },
  habitTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  habitTile: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  habitTitulo: { fontSize: 15, fontWeight: '800', color: colors.textStrong, letterSpacing: -0.2 },
  habitSubRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  habitSub: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  checkBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBtn: { width: 32, height: 32, borderRadius: 10, borderWidth: 1.5, borderColor: colors.checkBorder, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  countBtnPlus: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  countValor: { fontSize: 16, fontWeight: '800', color: colors.textStrong, minWidth: 18, textAlign: 'center' },
  habitTrack: { height: 7, borderRadius: radii.full, backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginTop: 13 },
  habitBar: { height: '100%', borderRadius: radii.full },

  // meds
  medCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 17, marginBottom: 13 },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 15 },
  medTile: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  medNome: { fontSize: 16, fontWeight: '800', color: colors.textStrong, letterSpacing: -0.2 },
  medForma: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginTop: 2 },
  medRestam: { fontSize: 17, fontWeight: '800' },
  medRestamLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  medAlert: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.pinkTint, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 13 },
  medAlertTexto: { fontSize: 12, fontWeight: '700', color: colors.pinkDark },
  doseRow: { flexDirection: 'row', gap: 8 },
  dose: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 11, borderRadius: 14, borderWidth: 1.5 },
  doseTime: { fontSize: 13, fontWeight: '800' },
  dosePill: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

  // humor
  humorCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.xl, padding: 19 },
  humorTitulo: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 },
  humorSub: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '500', marginTop: 3, marginBottom: 17 },
  moodRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  moodBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 11, paddingHorizontal: 2, borderRadius: 16, borderWidth: 2 },
  moodEmoji: { fontSize: 25, lineHeight: 30 },
  moodLabel: { fontSize: 9.5, fontWeight: '700', textAlign: 'center' },
  scaleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  scaleHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  scaleTitulo: { fontSize: 13.5, fontWeight: '800', color: colors.textStrong },
  scaleValor: { fontSize: 12, fontWeight: '800' },
  scaleRow: { flexDirection: 'row', gap: 6 },
  scaleSeg: { flex: 1, height: 32, borderRadius: 9 },
  scaleEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  scaleEnd: { fontSize: 10, fontWeight: '600', color: colors.textMuted },
  saveBtn: { marginTop: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
  saveBtnTexto: { fontSize: 15, fontWeight: '800' },
  todayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12, paddingHorizontal: 4 },
  todayTitulo: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.2 },
  todayCount: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  noCheckins: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#D3DAD4', borderStyle: 'dashed', borderRadius: radii.lg, paddingVertical: 26, paddingHorizontal: 18, alignItems: 'center' },
  noCheckinsTitulo: { fontSize: 13.5, fontWeight: '700', color: colors.textSecondary },
  noCheckinsDica: { fontSize: 12, fontWeight: '500', color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  checkinRow: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, paddingHorizontal: 15, paddingVertical: 13, marginBottom: 10 },
  checkinEmoji: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  checkinLabel: { fontSize: 14.5, fontWeight: '800', color: colors.textStrong, letterSpacing: -0.2 },
  checkinChips: { flexDirection: 'row', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  chipFoco: { fontSize: 10.5, fontWeight: '700', color: colors.primary, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 7, overflow: 'hidden' },
  chipEnergia: { fontSize: 10.5, fontWeight: '700', color: '#9A6312', backgroundColor: colors.amberLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 7, overflow: 'hidden' },
  checkinNota: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 },
  checkinHora: { fontSize: 12, fontWeight: '700', color: colors.textMuted },

  // shared dashed add button
  dashedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.dashedBorder, borderStyle: 'dashed', borderRadius: radii.lg, paddingVertical: 15, marginTop: 4 },
  dashedBtnTexto: { color: colors.primary, fontSize: 14, fontWeight: '800' },

  // modals
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalScroll: { justifyContent: 'flex-end', flexGrow: 1 },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  modalTitulo: { ...typography.h3, marginBottom: spacing.md },
  inputLabel: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  tipoHabitoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tipoHabitoOpcao: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: spacing.xs },
  tipoHabitoAtivo: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  tipoHabitoIcone: { fontSize: 24 },
  tipoHabitoTexto: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tipoHabitoTextoAtivo: { color: colors.primaryDark },
  tipoHabitoDesc: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  contadorCampos: { marginBottom: spacing.sm },
  contadorRow: { flexDirection: 'row', gap: spacing.sm },
  contadorCampo: { flex: 1 },
  unidadesSugeridas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  unidadePilula: { paddingHorizontal: spacing.sm, paddingVertical: 13, minHeight: 44, justifyContent: 'center', borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  unidadePilulaAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  unidadeTexto: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  unidadeTextoAtivo: { color: 'white' },
  tipoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  tipoOpcao: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  tipoAtivo: { backgroundColor: colors.teal, borderColor: colors.teal },
  tipoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tipoTextoAtivo: { color: 'white' },
  frequenciaRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  frequenciaOpcao: { flex: 1, padding: spacing.xs + 2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  frequenciaAtiva: { backgroundColor: colors.teal, borderColor: colors.teal },
  frequenciaTexto: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  frequenciaTextoAtivo: { color: 'white' },
  diasContainer: { marginBottom: spacing.md },
  diasRow: { flexDirection: 'row', gap: spacing.xs },
  diaBtn: { flex: 1, aspectRatio: 1, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  diaBtnAtivo: { backgroundColor: colors.teal, borderColor: colors.teal },
  diaBtnTexto: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  diaBtnTextoAtivo: { color: 'white' },
  horariosSugeridos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  horarioSugerido: { paddingHorizontal: spacing.sm, paddingVertical: 13, minHeight: 44, justifyContent: 'center', borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  horarioSugeridoAtivo: { backgroundColor: colors.teal, borderColor: colors.teal },
  horarioSugeridoTexto: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  horarioSugeridoTextoAtivo: { color: 'white' },
  horarioCustomRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, alignItems: 'center' },
  horarioCustomBtn: { width: 48, height: 48, borderRadius: radii.md, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  duracaoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  duracaoOpcao: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  duracaoAtiva: { backgroundColor: colors.teal, borderColor: colors.teal },
  duracaoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  duracaoTextoAtivo: { color: 'white' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  toggleLabel: { ...typography.body, fontWeight: '600' },
  toggleDesc: { ...typography.caption, marginTop: 2 },
  modalBotoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
  botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  botaoSalvarDesabilitado: { opacity: 0.4 },
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '700' },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  emojiOpcao: { width: 48, height: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  emojiSelecionado: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  })
}
