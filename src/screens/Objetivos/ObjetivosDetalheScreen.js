import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'
import { sugerirTarefas } from '../../utils/api'
import { segmentarTarefa } from '../../utils/api'
import TarefaObjetivoCard from '../../components/TarefaObjetivoCard'

const LABEL_PRAZO = { curto: 'Curto prazo', medio: 'Médio prazo', longo: 'Longo prazo' }

export default function ObjetivoDetalheScreen({ route, navigation }) {
  const { objetivoId } = route.params
  const { objetivos, concluirTarefaObjetivo, adicionarTarefaObjetivo, deletarObjetivo } = useAppStore()

  const objetivo = objetivos.find(o => o.id === objetivoId)

  const [modalTarefa, setModalTarefa] = useState(false)
  const [modalIA, setModalIA] = useState(false)
  const [novaTarefa, setNovaTarefa] = useState('')
  const [sugestoes, setSugestoes] = useState([])
  const [selecionadas, setSelecionadas] = useState([])
  const [carregandoIA, setCarregandoIA] = useState(false)
  const [erroIA, setErroIA] = useState(null)
  const [modalSegmentacao, setModalSegmentacao] = useState(false)
  const [tarefaSegmentando, setTarefaSegmentando] = useState(null)
  const [subtarefas, setSubtarefas] = useState([])
  const [subtarefasSelecionadas, setSubtarefasSelecionadas] = useState([])
  const [carregandoSegmentacao, setCarregandoSegmentacao] = useState(null)
  const [erroSegmentacao, setErroSegmentacao] = useState(null)

  if (!objetivo) {
    navigation.goBack()
    return null
  }

  const tarefasFeitas = objetivo.tarefas.filter(t => t.concluida).length
  const porcentagem = objetivo.tarefas.length > 0
    ? Math.round((tarefasFeitas / objetivo.tarefas.length) * 100)
    : 0
  const xpGanho = tarefasFeitas * 15

  function salvarTarefa() {
    if (!novaTarefa.trim()) return
    adicionarTarefaObjetivo(objetivo.id, novaTarefa.trim())
    setNovaTarefa('')
    setModalTarefa(false)
  }

  function confirmarDeletar() {
    Alert.alert(
      'Deletar objetivo?',
      'Todas as tarefas vinculadas serão removidas permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Deletar', style: 'destructive', onPress: () => { deletarObjetivo(objetivo.id); navigation.goBack() } },
      ]
    )
  }

  // IA — busca sugestões
  async function pedirSugestoes() {
    setCarregandoIA(true)
    setErroIA(null)
    setSugestoes([])
    setSelecionadas([])
    setModalIA(true)

    try {
      const resultado = await sugerirTarefas(objetivo.titulo, objetivo.tarefas)
      setSugestoes(resultado)
      // Seleciona todas por padrão
      setSelecionadas(resultado)
    } catch (erro) {
      setErroIA('Não foi possível conectar com a IA. Verifique sua conexão e tente novamente.')
    } finally {
      setCarregandoIA(false)
    }
  }

  function toggleSugestao(tarefa) {
    const jaSelecionada = selecionadas.includes(tarefa)
    setSelecionadas(jaSelecionada
      ? selecionadas.filter(s => s !== tarefa)
      : [...selecionadas, tarefa]
    )
  }

  function adicionarSelecionadas() {
    selecionadas.forEach(titulo => {
      adicionarTarefaObjetivo(objetivo.id, titulo)
    })
    setModalIA(false)
    setSugestoes([])
    setSelecionadas([])
  }

  async function iniciarSegmentacao(tarefa) {
    setTarefaSegmentando(tarefa)
    setCarregandoSegmentacao(tarefa.id)
    setErroSegmentacao(null)
    setSubtarefas([])
    setSubtarefasSelecionadas([])
    setModalSegmentacao(true)

    try {
      const resultado = await segmentarTarefa(tarefa.titulo, objetivo.titulo)
      setSubtarefas(resultado)
      setSubtarefasSelecionadas(resultado)
    } catch (erro) {
      setErroSegmentacao('Não foi possível segmentar a tarefa. Tente novamente.')
    } finally {
      setCarregandoSegmentacao(null)
    }
  }

  function toggleSubtarefa(subtarefa) {
    const jaSelecionada = subtarefasSelecionadas.includes(subtarefa)
    setSubtarefasSelecionadas(jaSelecionada
      ? subtarefasSelecionadas.filter(s => s !== subtarefa)
      : [...subtarefasSelecionadas, subtarefa]
    )
  }

  function adicionarSubtarefas() {
    subtarefasSelecionadas.forEach(titulo => {
      adicionarTarefaObjetivo(objetivo.id, titulo)
    })
    setModalSegmentacao(false)
    setTarefaSegmentando(null)
    setSubtarefas([])
    setSubtarefasSelecionadas([])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.voltarTexto}>‹ Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmarDeletar}>
            <Text style={styles.deletarTexto}>Deletar</Text>
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <View style={[styles.cardInfo, { borderLeftColor: objetivo.cor }]}>
          <View style={[styles.prazoTag, { backgroundColor: objetivo.cor + '22' }]}>
            <Text style={[styles.prazoTexto, { color: objetivo.cor }]}>{LABEL_PRAZO[objetivo.prazo]}</Text>
          </View>
          <Text style={styles.titulo}>{objetivo.titulo}</Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{porcentagem}%</Text>
            <Text style={styles.statLabel}>Concluído</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{tarefasFeitas}</Text>
            <Text style={styles.statLabel}>Feitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{objetivo.tarefas.length - tarefasFeitas}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValor, { color: colors.primary }]}>+{xpGanho}</Text>
            <Text style={styles.statLabel}>XP ganho</Text>
          </View>
        </View>

        {/* BARRA DE PROGRESSO */}
        <View style={styles.progressoContainer}>
          <View style={styles.progressoFundo}>
            <View style={[styles.progressoPreenchido, { width: `${porcentagem}%`, backgroundColor: objetivo.cor }]} />
          </View>
          <Text style={styles.progressoTexto}>{porcentagem}% concluído</Text>
        </View>

        {/* BOTÃO DE IA */}
        <TouchableOpacity style={styles.botaoIA} onPress={pedirSugestoes}>
          <Text style={styles.botaoIATexto}>✨ Sugerir tarefas com IA</Text>
          <Text style={styles.botaoIADesc}>Claude vai sugerir 5 tarefas baseadas no seu objetivo</Text>
        </TouchableOpacity>

        {/* TAREFAS */}
        <View style={styles.secaoHeader}>
          <Text style={styles.secaoTitulo}>Tarefas</Text>
          <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalTarefa(true)}>
            <Text style={styles.botaoAdicionarTexto}>+ Nova</Text>
          </TouchableOpacity>
        </View>

        {objetivo.tarefas.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhuma tarefa ainda</Text>
            <Text style={styles.vazioDica}>Use a IA para sugerir tarefas ou crie manualmente</Text>
          </View>
        ) : (
          <>
            {objetivo.tarefas.filter(t => !t.concluida).map(tarefa => (
              <TouchableOpacity
                key={tarefa.id}
                style={styles.cardTarefa}
                onPress={() => concluirTarefaObjetivo(objetivo.id, tarefa.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, { borderColor: objetivo.cor }]} />
                <View style={styles.tarefaInfo}>
                  <Text style={styles.tarefaTexto}>{tarefa.titulo}</Text>
                  <Text style={styles.tarefaXP}>+15 XP ao concluir</Text>
                </View>
              </TouchableOpacity>
            ))}

            {objetivo.tarefas.filter(t => t.concluida).length > 0 && (
              <>
                <Text style={styles.separador}>Concluídas</Text>
                {objetivo.tarefas.filter(t => t.concluida).map(tarefa => (
                  <TouchableOpacity
                    key={tarefa.id}
                    style={[styles.cardTarefa, styles.cardTarefaConcluida]}
                    onPress={() => concluirTarefaObjetivo(objetivo.id, tarefa.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, styles.checkboxMarcado, { backgroundColor: objetivo.cor, borderColor: objetivo.cor }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                    <View style={styles.tarefaInfo}>
                      <Text style={[styles.tarefaTexto, styles.tarefaConcluida]}>{tarefa.titulo}</Text>
                      <Text style={styles.tarefaXPGanho}>+15 XP ganhos ⚡</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: objetivo.cor }]} onPress={() => setModalTarefa(true)}>
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>

      {/* MODAL — NOVA TAREFA */}
      <Modal visible={modalTarefa} transparent animationType="slide" onRequestClose={() => setModalTarefa(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalFundo}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>Nova tarefa</Text>
              <Text style={styles.modalSubtitulo}>{objetivo.titulo}</Text>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Pesquisar cursos online"
                placeholderTextColor={colors.textMuted}
                value={novaTarefa}
                onChangeText={setNovaTarefa}
                autoFocus
              />
              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalTarefa(false)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botaoSalvar, { backgroundColor: objetivo.cor }, !novaTarefa.trim() && styles.botaoDesabilitado]}
                  onPress={salvarTarefa}
                >
                  <Text style={styles.botaoSalvarTexto}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL — SEGMENTAÇÃO */}
      <Modal visible={modalSegmentacao} transparent animationType="slide" onRequestClose={() => setModalSegmentacao(false)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainerIA}>

            <View style={styles.iaHeader}>
              <Text style={styles.modalTitulo}>✨ Segmentar tarefa</Text>
              <Text style={styles.modalSubtitulo} numberOfLines={2}>
                {tarefaSegmentando?.titulo}
              </Text>
            </View>

            {/* Carregando */}
            {carregandoSegmentacao && (
              <View style={styles.iaCarregando}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.iaCarregandoTexto}>Quebrando em partes menores...</Text>
                <Text style={styles.iaCarregandoDesc}>Claude está criando subtarefas para facilitar seu foco</Text>
              </View>
            )}

            {/* Erro */}
            {erroSegmentacao && !carregandoSegmentacao && (
              <View style={styles.iaErro}>
                <Text style={styles.iaErroTexto}>⚠️ {erroSegmentacao}</Text>
                <TouchableOpacity
                  style={styles.botaoTentarNovamente}
                  onPress={() => tarefaSegmentando && iniciarSegmentacao(tarefaSegmentando)}
                >
                  <Text style={styles.botaoTentarNovamenteTexto}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Subtarefas */}
            {!carregandoSegmentacao && !erroSegmentacao && subtarefas.length > 0 && (
              <>
                <Text style={styles.iaInstrucao}>Selecione as subtarefas que deseja adicionar:</Text>
                <ScrollView style={styles.iaSugestoesList}>
                  {subtarefas.map((subtarefa, index) => {
                    const selecionada = subtarefasSelecionadas.includes(subtarefa)
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.sugestaoCard, selecionada && styles.sugestaoCardAtiva]}
                        onPress={() => toggleSubtarefa(subtarefa)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.sugestaoCheck, selecionada && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                          {selecionada && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={[styles.sugestaoTexto, selecionada && { color: colors.textPrimary }]}>
                          {subtarefa}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>

                <Text style={styles.iaSelecionadas}>
                  {subtarefasSelecionadas.length} de {subtarefas.length} selecionadas
                </Text>

                <View style={styles.modalBotoes}>
                  <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalSegmentacao(false)}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botaoSalvar, subtarefasSelecionadas.length === 0 && styles.botaoDesabilitado]}
                    onPress={adicionarSubtarefas}
                  >
                    <Text style={styles.botaoSalvarTexto}>
                      Adicionar {subtarefasSelecionadas.length > 0 ? `(${subtarefasSelecionadas.length})` : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL — SUGESTÕES DA IA */}
      <Modal visible={modalIA} transparent animationType="slide" onRequestClose={() => setModalIA(false)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainerIA}>

            {/* Header */}
            <View style={styles.iaHeader}>
              <Text style={styles.modalTitulo}>✨ Sugestões da IA</Text>
              <Text style={styles.modalSubtitulo}>{objetivo.titulo}</Text>
            </View>

            {/* Carregando */}
            {carregandoIA && (
              <View style={styles.iaCarregando}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.iaCarregandoTexto}>Claude está pensando...</Text>
                <Text style={styles.iaCarregandoDesc}>Analisando seu objetivo e criando sugestões personalizadas</Text>
              </View>
            )}

            {/* Erro */}
            {erroIA && !carregandoIA && (
              <View style={styles.iaErro}>
                <Text style={styles.iaErroTexto}>⚠️ {erroIA}</Text>
                <TouchableOpacity style={styles.botaoTentarNovamente} onPress={pedirSugestoes}>
                  <Text style={styles.botaoTentarNovamenteTexto}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Sugestões */}
            {!carregandoIA && !erroIA && sugestoes.length > 0 && (
              <>
                <Text style={styles.iaInstrucao}>Selecione as tarefas que deseja adicionar:</Text>
                <ScrollView style={styles.iaSugestoesList}>
                  {sugestoes.map((tarefa, index) => {
                    const selecionada = selecionadas.includes(tarefa)
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.sugestaoCard, selecionada && styles.sugestaoCardAtiva]}
                        onPress={() => toggleSugestao(tarefa)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.sugestaoCheck, selecionada && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                          {selecionada && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={[styles.sugestaoTexto, selecionada && { color: colors.textPrimary }]}>
                          {tarefa}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>

                <Text style={styles.iaSelecionadas}>
                  {selecionadas.length} de {sugestoes.length} selecionadas
                </Text>

                <View style={styles.modalBotoes}>
                  <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalIA(false)}>
                    <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botaoSalvar, selecionadas.length === 0 && styles.botaoDesabilitado]}
                    onPress={adicionarSelecionadas}
                  >
                    <Text style={styles.botaoSalvarTexto}>
                      Adicionar {selecionadas.length > 0 ? `(${selecionadas.length})` : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  voltarBtn: { padding: spacing.xs },
  voltarTexto: { fontSize: 17, color: colors.primary, fontWeight: '500' },
  deletarTexto: { fontSize: 15, color: colors.coral, fontWeight: '500' },
  cardInfo: { marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4 },
  prazoTag: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, marginBottom: spacing.sm },
  prazoTexto: { fontSize: 12, fontWeight: '600' },
  titulo: { ...typography.h2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValor: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  progressoContainer: { marginHorizontal: spacing.md, marginBottom: spacing.lg },
  progressoFundo: { height: 10, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden', marginBottom: spacing.xs },
  progressoPreenchido: { height: 10, borderRadius: radii.full },
  progressoTexto: { ...typography.caption, textAlign: 'right' },

  // Botão IA
  botaoIA: { marginHorizontal: spacing.md, marginBottom: spacing.lg, padding: spacing.md, backgroundColor: colors.primaryLight, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed' },
  botaoIATexto: { fontSize: 15, fontWeight: '700', color: colors.primaryDark, marginBottom: 4 },
  botaoIADesc: { fontSize: 12, color: colors.primaryDark, opacity: 0.7 },

  secaoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  secaoTitulo: { ...typography.h3 },
  botaoAdicionar: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full },
  botaoAdicionarTexto: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  cardTarefa: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, marginHorizontal: spacing.md, marginBottom: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTarefaConcluida: { backgroundColor: colors.background, opacity: 0.7 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  checkboxMarcado: {},
  checkmark: { color: 'white', fontSize: 13, fontWeight: '700' },
  tarefaInfo: { flex: 1 },
  tarefaTexto: { ...typography.body },
  tarefaConcluida: { textDecorationLine: 'line-through', color: colors.textMuted },
  tarefaXP: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  tarefaXPGanho: { fontSize: 11, color: colors.primary, marginTop: 2 },
  separador: { ...typography.label, paddingHorizontal: spacing.md, marginTop: spacing.sm, marginBottom: spacing.xs, color: colors.textMuted },
  vazio: { alignItems: 'center', paddingVertical: spacing.xxl },
  vazioTexto: { ...typography.body, color: colors.textMuted },
  vazioDica: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.lg },
  fab: { position: 'absolute', bottom: 30, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabTexto: { color: 'white', fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // Modais
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  modalContainerIA: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl, maxHeight: '80%' },
  iaHeader: { marginBottom: spacing.md },
  modalTitulo: { ...typography.h3, marginBottom: 4 },
  modalSubtitulo: { ...typography.caption, marginBottom: spacing.xs },

  // IA estados
  iaCarregando: { alignItems: 'center', paddingVertical: spacing.xxl },
  iaCarregandoTexto: { ...typography.h3, marginTop: spacing.md, color: colors.primary },
  iaCarregandoDesc: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
  iaErro: { alignItems: 'center', paddingVertical: spacing.xl },
  iaErroTexto: { ...typography.body, color: colors.coral, textAlign: 'center', marginBottom: spacing.md },
  botaoTentarNovamente: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.full },
  botaoTentarNovamenteTexto: { color: colors.primaryDark, fontWeight: '600' },
  iaInstrucao: { ...typography.label, marginBottom: spacing.sm },
  iaSugestoesList: { maxHeight: 280 },
  sugestaoCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, backgroundColor: colors.background },
  sugestaoCardAtiva: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  sugestaoCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, backgroundColor: 'white' },
  sugestaoTexto: { flex: 1, ...typography.body, color: colors.textSecondary },
  iaSelecionadas: { ...typography.caption, textAlign: 'center', marginVertical: spacing.sm, color: colors.primary, fontWeight: '600' },
  inputLabel: { ...typography.label, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  modalBotoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
  botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  botaoDesabilitado: { opacity: 0.4 },
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '600' },
})