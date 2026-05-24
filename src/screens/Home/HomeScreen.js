<<<<<<< HEAD
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'
=======
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Switch, Alert } from 'react-native'
import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'
import { globalStyles } from '../../theme/globalStyles'
import ChatModal from '../../components/ChatModal'
import { Header } from '../../components/ui/Header'
import { XPBar } from '../../components/ui/XPBar'
import { EmptyState } from '../../components/ui/EmptyState'
import { BadgeXP, BadgeMoeda, BadgeRepeticao } from '../../components/ui/Badge'
import { pedirPermissaoNotificacoes } from '../../utils/notifications'
import PerfilScreen from '../Perfil/PerfilScreen'
>>>>>>> ajustes-ui

const FREQUENCIAS = [
  { valor: 'diaria', label: '📅 Diária' },
  { valor: 'semanal', label: '📆 Semanal' },
  { valor: 'mensal', label: '🗓️ Mensal' },
<<<<<<< HEAD
=======
  { valor: 'anual', label: '📅 Anual' },
  { valor: 'unica', label: '⏳ Única' },
  { valor: 'personalizada', label: '⚙️ Personalizada' },

>>>>>>> ajustes-ui
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

<<<<<<< HEAD
function estadoInicial() {
  return { titulo: '', xp: '20', moedas: '5', repetitiva: false, frequencia: 'diaria', dias: ['seg', 'ter', 'qua', 'qui', 'sex'] }
=======
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
>>>>>>> ajustes-ui
}

export default function HomeScreen() {
  const { perfil, tarefas, concluirTarefa, adicionarTarefa, editarTarefa, deletarTarefa } = useAppStore()
  const [modalVisivel, setModalVisivel] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [form, setForm] = useState(estadoInicial())
<<<<<<< HEAD

  const porcentagemXP = Math.round((perfil.xpAtual / perfil.xpProximoNivel) * 100)
=======
  const [chatVisivel, setChatVisivel] = useState(false)
  const [perfilVisivel, setPerfilVisivel] = useState(false)
  const [tarefasCarregando, setTarefasCarregando] = useState(true)
  const [perfilCarregando, setPerfilCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [atualizando, setAtualizando] = useState(false)
  const [atualizandoPerfil, setAtualizandoPerfil] = useState(false)
  const [atualizandoTarefas, setAtualizandoTarefas] = useState(false)
  const [filtro, setFiltro] = useState('todos')
  
  // Pede permissão de notificação ao abrir o app
  useEffect(() => {
    pedirPermissaoNotificacoes()
  }, [])

  // Agrupa e ordena as tarefas
  const tarefasAgrupadas = (() => {
    const nConcluidas = tarefas.filter(t => !t.concluida)

    const atrasadas = nConcluidas
      .filter(t => classificarTarefa(t) === 'atrasada')
      .sort((a, b) => a.prazoData.localeCompare(b.prazoData))

    const hojeT = nConcluidas
      .filter(t => classificarTarefa(t) === 'hoje')
      .sort((a, b) => (a.prazoHorario || '99:99').localeCompare(b.prazoHorario || '99:99'))

    const proximos = nConcluidas
      .filter(t => classificarTarefa(t) === 'proximos')
      .sort((a, b) => a.prazoData.localeCompare(b.prazoData))

    const semPrazo = nConcluidas.filter(t => classificarTarefa(t) === 'semPrazo')

    const concluidas = tarefas.filter(t => t.concluida)

    return { atrasadas, hoje: hojeT, proximos, semPrazo, concluidas }
  })()
>>>>>>> ajustes-ui

  function abrirCriar() {
    setTarefaEditando(null)
    setForm(estadoInicial())
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
<<<<<<< HEAD
=======
      prazoData: tarefa.prazoData || '',
      prazoHorario: tarefa.prazoHorario || '',
      lembrete: tarefa.lembrete || false,
      lembreteMinutos: tarefa.lembreteMinutos || 30,
>>>>>>> ajustes-ui
    })
    setModalVisivel(true)
  }

  function onLongPress(tarefa) {
    Alert.alert(tarefa.titulo, 'O que deseja fazer?', [
      { text: 'Editar', onPress: () => abrirEditar(tarefa) },
<<<<<<< HEAD
      { text: 'Deletar', style: 'destructive', onPress: () =>
        Alert.alert('Deletar tarefa?', `"${tarefa.titulo}" será removida.`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', style: 'destructive', onPress: () => deletarTarefa(tarefa.id) },
        ])
=======
      {
        text: 'Deletar', style: 'destructive', onPress: () =>
          Alert.alert('Deletar tarefa?', `"${tarefa.titulo}" será removida.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Deletar', style: 'destructive', onPress: () => deletarTarefa(tarefa.id) },
          ])
>>>>>>> ajustes-ui
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

<<<<<<< HEAD
  function salvar() {
=======
  async function salvar() {
>>>>>>> ajustes-ui
    if (!form.titulo.trim()) return
    const dados = {
      titulo: form.titulo.trim(),
      xp: parseInt(form.xp) || 20,
      moedas: parseInt(form.moedas) || 5,
      repetitiva: form.repetitiva,
      frequencia: form.repetitiva ? form.frequencia : null,
      dias: form.repetitiva && form.frequencia === 'diaria' ? form.dias : [],
<<<<<<< HEAD
    }
    if (tarefaEditando) {
      editarTarefa(tarefaEditando.id, dados)
    } else {
      adicionarTarefa(dados)
=======
      prazoData: form.prazoData || null,
      prazoHorario: form.prazoHorario || null,
      lembrete: form.lembrete,
      lembreteMinutos: form.lembreteMinutos,
    }
    if (tarefaEditando) {
      await editarTarefa(tarefaEditando.id, dados)
    } else {
      await adicionarTarefa(dados)
>>>>>>> ajustes-ui
    }
    setModalVisivel(false)
  }

  function toggleDia(dia) {
    const jaSelecionado = form.dias.includes(dia)
    setForm({ ...form, dias: jaSelecionado ? form.dias.filter(d => d !== dia) : [...form.dias, dia] })
  }

  function labelDias(tarefa) {
    if (!tarefa.repetitiva) return null
    if (tarefa.frequencia !== 'diaria') return FREQUENCIAS.find(f => f.valor === tarefa.frequencia)?.label.split(' ')[1]
    if (!tarefa.dias || tarefa.dias.length === 0) return 'Diária'
    if (tarefa.dias.length === 7) return 'Todos os dias'
    return tarefa.dias.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
  }

<<<<<<< HEAD
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá, {perfil.nome}! 👋</Text>
            <Text style={styles.data}>{dataFormatada()}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{perfil.nome.substring(0, 2).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardXP}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>⚡ Nível {perfil.nivel}</Text>
            <Text style={styles.xpNumeros}>{perfil.xpAtual} / {perfil.xpProximoNivel} XP</Text>
          </View>
          <View style={styles.xpBarraFundo}>
            <View style={[styles.xpBarraPreenchida, { width: `${porcentagemXP}%` }]} />
          </View>
          <View style={styles.xpRodape}>
            <Text style={styles.xpDica}>{porcentagemXP}% para o próximo nível</Text>
            <Text style={styles.moedas}>🪙 {perfil.moedas}</Text>
          </View>
        </View>
=======
  function renderTarefa(tarefa, grupo) {
    const prazoLabel = formatarPrazo(tarefa)
    const atrasada = grupo === 'atrasada'

    return (
      <TouchableOpacity
        key={tarefa.id}
        style={[
          styles.cardTarefa,
          atrasada && styles.cardTarefaAtrasada,
        ]}
        onPress={() => concluirTarefa(tarefa.id)}
        onLongPress={() => onLongPress(tarefa)}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, tarefa.concluida && styles.checkboxMarcado]}>
          {tarefa.concluida && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.tarefaInfo}>
          <Text style={[styles.tarefaTexto, tarefa.concluida && styles.tarefaTextoConcluida]}>
            {tarefa.titulo}
          </Text>
          <View style={styles.tarefaMeta}>
            {prazoLabel && (
              <Text style={[styles.prazoLabel, atrasada && styles.prazoLabelAtrasado]}>
                {atrasada ? '⚠️' : '🕐'} {prazoLabel}
              </Text>
            )}
            {tarefa.repetitiva && <BadgeRepeticao label={labelDias(tarefa)} />}
            {tarefa.lembrete && <Text style={styles.lembreteIcon}>🔔</Text>}
          </View>
        </View>
        <View style={styles.tarefaRecompensas}>
          <BadgeXP xp={tarefa.xp} opaco={tarefa.concluida} />
          <BadgeMoeda moedas={tarefa.moedas} opaco={tarefa.concluida} />
        </View>
      </TouchableOpacity>
    )
  }

  const totalPendentes = tarefas.filter(t => !t.concluida).length
  const totalFeitas = tarefas.filter(t => t.concluida).length

  return (
    <View style={globalStyles.screen}>
      <Header onAvatarPress={() => setPerfilVisivel(true)} />

      <ScrollView contentContainerStyle={globalStyles.scroll}>

        <XPBar
          nivel={perfil.nivel}
          xpAtual={perfil.xpAtual}
          xpProximoNivel={perfil.xpProximoNivel}
          moedas={perfil.moedas}
        />
>>>>>>> ajustes-ui

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{perfil.streak}</Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
          </View>
          <View style={styles.statCard}>
<<<<<<< HEAD
            <Text style={styles.statValor}>{tarefas.filter(t => t.concluida).length}</Text>
            <Text style={styles.statLabel}>✅ Feitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{tarefas.filter(t => !t.concluida).length}</Text>
=======
            <Text style={styles.statValor}>{totalFeitas}</Text>
            <Text style={styles.statLabel}>✅ Feitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{totalPendentes}</Text>
>>>>>>> ajustes-ui
            <Text style={styles.statLabel}>📋 Pendentes</Text>
          </View>
        </View>

<<<<<<< HEAD
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoTitulo}>Tarefas de hoje</Text>
          <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirCriar}>
            <Text style={styles.botaoAdicionarTexto}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        {tarefas.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhuma tarefa ainda</Text>
            <Text style={styles.vazioDica}>Toque em + Nova para começar</Text>
          </View>
        ) : (
          tarefas.map(tarefa => (
            <TouchableOpacity
              key={tarefa.id}
              style={[styles.cardTarefa, tarefa.concluida && styles.cardTarefaConcluida]}
              onPress={() => concluirTarefa(tarefa.id)}
              onLongPress={() => onLongPress(tarefa)}
              delayLongPress={400}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, tarefa.concluida && styles.checkboxMarcado]}>
                {tarefa.concluida && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.tarefaInfo}>
                <Text style={[styles.tarefaTexto, tarefa.concluida && styles.tarefaTextoConcluida]}>
                  {tarefa.titulo}
                </Text>
                {tarefa.repetitiva && (
                  <Text style={styles.repetitivaBadge}>🔁 {labelDias(tarefa)}</Text>
                )}
              </View>
              <View style={styles.tarefaRecompensas}>
                <Text style={[styles.xpTag, tarefa.concluida && { opacity: 0.3 }]}>+{tarefa.xp}xp</Text>
                <Text style={[styles.moedaTag, tarefa.concluida && { opacity: 0.3 }]}>🪙{tarefa.moedas}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={abrirCriar}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalFundo}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>{tarefaEditando ? 'Editar tarefa' : 'Nova tarefa'}</Text>

              <Text style={styles.inputLabel}>Título</Text>
              <TextInput style={styles.input} placeholder="Ex: Estudar por 30 minutos" placeholderTextColor={colors.textMuted} value={form.titulo} onChangeText={t => setForm({ ...form, titulo: t })} autoFocus />

              <View style={styles.recompensasRow}>
                <View style={styles.recompensaCampo}>
                  <Text style={styles.inputLabel}>⚡ XP</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.xp} onChangeText={t => setForm({ ...form, xp: t })} />
                </View>
                <View style={styles.recompensaCampo}>
                  <Text style={styles.inputLabel}>🪙 Moedas</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.moedas} onChangeText={t => setForm({ ...form, moedas: t })} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Dificuldade rápida</Text>
              <View style={styles.sugestoesRow}>
                {[{ label: '😌 Fácil', xp: '10', moedas: '2' }, { label: '💪 Média', xp: '20', moedas: '5' }, { label: '🔥 Difícil', xp: '40', moedas: '10' }].map(s => (
                  <TouchableOpacity key={s.label} style={[styles.sugestao, form.xp === s.xp && styles.sugestaoAtiva]} onPress={() => setForm({ ...form, xp: s.xp, moedas: s.moedas })}>
=======
        {/* ATRASADAS */}
        {tarefasAgrupadas.atrasadas.length > 0 && (
          <View>
            <View style={styles.grupoHeader}>
              <Text style={styles.grupoTitulo}>⚠️ Atrasadas</Text>
              <View style={styles.grupoBadge}>
                <Text style={styles.grupoBadgeTexto}>{tarefasAgrupadas.atrasadas.length}</Text>
              </View>
            </View>
            {tarefasAgrupadas.atrasadas.map(t => renderTarefa(t, 'atrasada'))}
          </View>
        )}

        {/* HOJE */}
        <View style={styles.grupoHeader}>
          <Text style={styles.grupoTitulo}>📅 Hoje</Text>
          <TouchableOpacity style={globalStyles.botaoAdicionar} onPress={abrirCriar}>
            <Text style={globalStyles.botaoAdicionarTexto}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        {tarefasAgrupadas.hoje.length === 0 && tarefasAgrupadas.semPrazo.length === 0 && tarefasAgrupadas.atrasadas.length === 0 ? (
          <EmptyState titulo="Nenhuma tarefa pendente" dica="Toque em + Nova para começar" />
        ) : (
          <>
            {tarefasAgrupadas.hoje.map(t => renderTarefa(t, 'hoje'))}
            {tarefasAgrupadas.semPrazo.map(t => renderTarefa(t, 'semPrazo'))}
          </>
        )}

        {/* PRÓXIMOS DIAS */}
        {tarefasAgrupadas.proximos.length > 0 && (
          <View>
            <View style={styles.grupoHeader}>
              <Text style={styles.grupoTitulo}>🗓️ Próximos dias</Text>
            </View>
            {tarefasAgrupadas.proximos.map(t => renderTarefa(t, 'proximos'))}
          </View>
        )}

        {/* CONCLUÍDAS */}
        {tarefasAgrupadas.concluidas.length > 0 && (
          <View>
            <View style={styles.grupoHeader}>
              <Text style={styles.grupoTitulo}>✅ Concluídas</Text>
            </View>
            {tarefasAgrupadas.concluidas.map(t => renderTarefa(t, 'concluida'))}
          </View>
        )}

      </ScrollView>

      {/* FAB CHAT */}
      <TouchableOpacity style={styles.fabChat} onPress={() => setChatVisivel(true)}>
        <Text style={styles.fabChatTexto}>✨</Text>
      </TouchableOpacity>

      <ChatModal visivel={chatVisivel} onFechar={() => setChatVisivel(false)} />

      <Modal
        visible={perfilVisivel}
        animationType="slide"
        onRequestClose={() => setPerfilVisivel(false)}
      >
        <PerfilScreen onFechar={() => setPerfilVisivel(false)} />
      </Modal>

      {/* MODAL — CRIAR / EDITAR TAREFA */}
      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <View style={globalStyles.modalFundo}>
          <ScrollView contentContainerStyle={globalStyles.scrollModal}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitulo}>
                {tarefaEditando ? 'Editar tarefa' : 'Nova tarefa'}
              </Text>

              {/* TÍTULO */}
              <Text style={globalStyles.inputLabel}>Título</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Ex: Estudar por 30 minutos"
                placeholderTextColor={colors.textMuted}
                value={form.titulo}
                onChangeText={t => setForm({ ...form, titulo: t })}
                autoFocus
              />

              {/* XP E MOEDAS */}
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

              {/* DIFICULDADE */}
              <Text style={globalStyles.inputLabel}>Dificuldade rápida</Text>
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
>>>>>>> ajustes-ui
                    <Text style={[styles.sugestaoTexto, form.xp === s.xp && styles.sugestaoTextoAtivo]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

<<<<<<< HEAD
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Tarefa repetitiva</Text>
                  <Text style={styles.toggleDesc}>Reseta automaticamente no período</Text>
                </View>
                <Switch value={form.repetitiva} onValueChange={v => setForm({ ...form, repetitiva: v })} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="white" />
=======
              {/* PRAZO */}
              <Text style={globalStyles.inputLabel}>📅 Prazo (opcional)</Text>
              <View style={styles.prazoRow}>
                <View style={styles.prazoInputCampo}>
                  <Text style={styles.prazoInputLabel}>Data</Text>
                  <TextInput
                    style={[globalStyles.input, { marginBottom: 0 }]}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    value={form.prazoData}
                    onChangeText={t => setForm({ ...form, prazoData: t })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.prazoInputCampo}>
                  <Text style={styles.prazoInputLabel}>Horário</Text>
                  <TextInput
                    style={[globalStyles.input, { marginBottom: 0 }]}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textMuted}
                    value={form.prazoHorario}
                    onChangeText={t => setForm({ ...form, prazoHorario: t })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* LEMBRETE */}
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

              {/* REPETIÇÃO */}
              <View style={globalStyles.toggleRow}>
                <View>
                  <Text style={globalStyles.toggleLabel}>Tarefa repetitiva</Text>
                  <Text style={globalStyles.toggleDesc}>Reseta automaticamente no período</Text>
                </View>
                <Switch
                  value={form.repetitiva}
                  onValueChange={v => setForm({ ...form, repetitiva: v })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="white"
                />
>>>>>>> ajustes-ui
              </View>

              {form.repetitiva && (
                <View style={styles.frequenciaContainer}>
<<<<<<< HEAD
                  <Text style={styles.inputLabel}>Frequência</Text>
                  <View style={styles.frequenciaRow}>
                    {FREQUENCIAS.map(f => (
                      <TouchableOpacity key={f.valor} style={[styles.frequenciaOpcao, form.frequencia === f.valor && styles.frequenciaAtiva]} onPress={() => setForm({ ...form, frequencia: f.valor })}>
                        <Text style={[styles.frequenciaTexto, form.frequencia === f.valor && styles.frequenciaTextoAtivo]}>{f.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {form.frequencia === 'diaria' && (
                    <View style={styles.diasContainer}>
                      <Text style={styles.inputLabel}>Dias da semana</Text>
                      <View style={styles.diasRow}>
                        {DIAS_SEMANA.map(dia => {
                          const selecionado = form.dias.includes(dia.valor)
                          return (
                            <TouchableOpacity key={dia.valor} style={[styles.diaBtn, selecionado && styles.diaBtnAtivo]} onPress={() => toggleDia(dia.valor)}>
                              <Text style={[styles.diaBtnTexto, selecionado && styles.diaBtnTextoAtivo]}>{dia.label}</Text>
=======
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
>>>>>>> ajustes-ui
                            </TouchableOpacity>
                          )
                        })}
                      </View>
<<<<<<< HEAD
                      <View style={styles.atalhoRow}>
                        <TouchableOpacity style={styles.atalho} onPress={() => setForm({ ...form, dias: ['seg', 'ter', 'qua', 'qui', 'sex'] })}>
                          <Text style={styles.atalhoTexto}>Dias úteis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.atalho} onPress={() => setForm({ ...form, dias: ['dom', 'sab'] })}>
                          <Text style={styles.atalhoTexto}>Fim de semana</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.atalho} onPress={() => setForm({ ...form, dias: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] })}>
                          <Text style={styles.atalhoTexto}>Todos</Text>
=======
                      <View style={globalStyles.atalhoRow}>
                        <TouchableOpacity style={globalStyles.atalho} onPress={() => setForm({ ...form, dias: ['seg', 'ter', 'qua', 'qui', 'sex'] })}>
                          <Text style={globalStyles.atalhoTexto}>Dias úteis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.atalho} onPress={() => setForm({ ...form, dias: ['dom', 'sab'] })}>
                          <Text style={globalStyles.atalhoTexto}>Fim de semana</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.atalho} onPress={() => setForm({ ...form, dias: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] })}>
                          <Text style={globalStyles.atalhoTexto}>Todos</Text>
>>>>>>> ajustes-ui
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

<<<<<<< HEAD
              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.botaoSalvar, !form.titulo.trim() && styles.botaoSalvarDesabilitado]} onPress={salvar}>
                  <Text style={styles.botaoSalvarTexto}>{tarefaEditando ? 'Salvar alterações' : 'Criar tarefa'}</Text>
                </TouchableOpacity>
              </View>
=======
              <View style={globalStyles.modalBotoes}>
                <TouchableOpacity style={globalStyles.botaoSecundario} onPress={() => setModalVisivel(false)}>
                  <Text style={globalStyles.botaoSecundarioTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[globalStyles.botaoPrimario, !form.titulo.trim() && globalStyles.botaoDesabilitado]}
                  onPress={salvar}
                >
                  <Text style={globalStyles.botaoPrimarioTexto}>
                    {tarefaEditando ? 'Salvar alterações' : 'Criar tarefa'}
                  </Text>
                </TouchableOpacity>
              </View>

>>>>>>> ajustes-ui
            </View>
          </ScrollView>
        </View>
      </Modal>
<<<<<<< HEAD
    </SafeAreaView>
  )
}

function dataFormatada() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  saudacao: { ...typography.h2 },
  data: { ...typography.caption, marginTop: 2, textTransform: 'capitalize' },
  avatar: { width: 44, height: 44, borderRadius: radii.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontSize: 15, fontWeight: '600', color: colors.primaryDark },
  cardXP: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  xpLabel: { ...typography.label, color: colors.primaryDark, fontWeight: '600' },
  xpNumeros: { ...typography.label },
  xpBarraFundo: { height: 10, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  xpBarraPreenchida: { height: 10, backgroundColor: colors.primary, borderRadius: radii.full },
  xpRodape: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  xpDica: { ...typography.caption },
  moedas: { ...typography.caption, fontWeight: '600', color: colors.amber },
=======

    </View>
  )
}

const styles = StyleSheet.create({
>>>>>>> ajustes-ui
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValor: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.caption, marginTop: 2, textAlign: 'center' },
<<<<<<< HEAD
  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  secaoTitulo: { ...typography.h3 },
  botaoAdicionar: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full },
  botaoAdicionarTexto: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  vazio: { alignItems: 'center', paddingVertical: spacing.xxl },
  vazioTexto: { ...typography.body, color: colors.textMuted },
  vazioDica: { ...typography.caption, marginTop: spacing.xs },
  cardTarefa: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTarefaConcluida: { backgroundColor: colors.background, opacity: 0.6 },
=======

  // Grupos
  grupoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.xs },
  grupoTitulo: { ...typography.h3 },
  grupoBadge: { backgroundColor: colors.coral, borderRadius: radii.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  grupoBadgeTexto: { color: 'white', fontSize: 12, fontWeight: '700' },

  // Cards de tarefa
  cardTarefa: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTarefaAtrasada: { borderColor: colors.coral, borderLeftWidth: 4 },
>>>>>>> ajustes-ui
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  checkboxMarcado: { backgroundColor: colors.success, borderColor: colors.success },
  checkmark: { color: 'white', fontSize: 13, fontWeight: '700' },
  tarefaInfo: { flex: 1 },
  tarefaTexto: { ...typography.body },
  tarefaTextoConcluida: { textDecorationLine: 'line-through', color: colors.textMuted },
<<<<<<< HEAD
  repetitivaBadge: { fontSize: 11, color: colors.primary, marginTop: 2, fontWeight: '500' },
  tarefaRecompensas: { alignItems: 'flex-end', gap: 2 },
  xpTag: { fontSize: 12, fontWeight: '600', color: colors.primary },
  moedaTag: { fontSize: 11, color: colors.amber },
  fab: { position: 'absolute', bottom: 90, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabTexto: { color: 'white', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalScroll: { justifyContent: 'flex-end', flexGrow: 1 },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  modalTitulo: { ...typography.h3, marginBottom: spacing.md },
  inputLabel: { ...typography.label, marginBottom: spacing.xs, marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
=======
  tarefaMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  prazoLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  prazoLabelAtrasado: { color: colors.coral, fontWeight: '600' },
  lembreteIcon: { fontSize: 11 },
  tarefaRecompensas: { alignItems: 'flex-end', gap: 2 },

  // FAB
  fabChat: { position: 'absolute', bottom: 10, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabChatTexto: { fontSize: 24 },

  // Modal
>>>>>>> ajustes-ui
  recompensasRow: { flexDirection: 'row', gap: spacing.sm },
  recompensaCampo: { flex: 1 },
  sugestoesRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  sugestao: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  sugestaoAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  sugestaoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  sugestaoTextoAtivo: { color: 'white' },
<<<<<<< HEAD
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  toggleLabel: { ...typography.body, fontWeight: '600' },
  toggleDesc: { ...typography.caption, marginTop: 2 },
  frequenciaContainer: { marginBottom: spacing.md },
  frequenciaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  frequenciaOpcao: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  frequenciaAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  frequenciaTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  frequenciaTextoAtivo: { color: 'white' },
  diasContainer: { marginTop: spacing.xs },
  diasRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  diaBtn: { flex: 1, aspectRatio: 1, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  diaBtnAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  diaBtnTexto: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  diaBtnTextoAtivo: { color: 'white' },
  atalhoRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  atalho: { flex: 1, padding: spacing.xs + 2, borderRadius: radii.md, backgroundColor: colors.primaryLight, alignItems: 'center' },
  atalhoTexto: { fontSize: 11, fontWeight: '600', color: colors.primaryDark },
  modalBotoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
  botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  botaoSalvarDesabilitado: { opacity: 0.4 },
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '600' },
=======
  frequenciaContainer: { marginBottom: spacing.md },

  // Prazo
  prazoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  prazoInputCampo: { flex: 1 },
  prazoInputLabel: { ...typography.caption, marginBottom: spacing.xs, color: colors.textMuted },

  // Lembrete
  lembreteOpcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  lembreteOpcao: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2, borderRadius: radii.full, borderWidth: 1, borderColor: colors.border },
  lembreteOpcaoAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  lembreteOpcaoTexto: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  lembreteOpcaoTextoAtivo: { color: 'white' },
>>>>>>> ajustes-ui
})