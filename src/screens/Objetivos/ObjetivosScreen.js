import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'

const perfil = useAppStore.getState().perfil

function dataFormatada() {
  const agora = new Date()
  return agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}   

const PRAZOS = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'curto', label: 'Curto prazo' },
  { valor: 'medio', label: 'Médio prazo' },
  { valor: 'longo', label: 'Longo prazo' },
]

const COR_PRAZO = { curto: '#7F77DD', medio: '#1D9E75', longo: '#EF9F27' }
const LABEL_PRAZO = { curto: 'Curto prazo', medio: 'Médio prazo', longo: 'Longo prazo' }

export default function ObjetivosScreen({ navigation }) {
  const { objetivos, adicionarObjetivo, editarObjetivo, deletarObjetivo, adicionarTarefaObjetivo, concluirTarefaObjetivo } = useAppStore()
  const [filtro, setFiltro] = useState('todos')
  const [objetivoAberto, setObjetivoAberto] = useState(null)
  const [objetivoEditando, setObjetivoEditando] = useState(null)
  const [modalNovoObjetivo, setModalNovoObjetivo] = useState(false)
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false)
  const [novoObjetivo, setNovoObjetivo] = useState({ titulo: '', prazo: 'curto' })
  const [novaTarefa, setNovaTarefa] = useState('')

  const objetivosFiltrados = filtro === 'todos' ? objetivos : objetivos.filter(o => o.prazo === filtro)

  function progresso(objetivo) {
    if (!objetivo.tarefas.length) return 0
    return Math.round((objetivo.tarefas.filter(t => t.concluida).length / objetivo.tarefas.length) * 100)
  }

  function abrirEditar(objetivo) {
    setObjetivoEditando(objetivo)
    setNovoObjetivo({ titulo: objetivo.titulo, prazo: objetivo.prazo })
    setModalNovoObjetivo(true)
  }

  function onLongPress(objetivo) {
    Alert.alert(objetivo.titulo, 'O que deseja fazer?', [
      { text: 'Editar', onPress: () => abrirEditar(objetivo) },
      {
        text: 'Deletar', style: 'destructive', onPress: () =>
          Alert.alert('Deletar objetivo?', 'Todas as tarefas vinculadas serão removidas.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Deletar', style: 'destructive', onPress: () => deletarObjetivo(objetivo.id) },
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

  function salvarTarefa() {
    if (!novaTarefa.trim() || !objetivoAberto) return
    adicionarTarefaObjetivo(objetivoAberto.id, novaTarefa)
    setNovaTarefa('')
    setModalNovaTarefa(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.saudacao}>Olá, {perfil.nome}! 👋</Text>
          <Text style={styles.data}>{dataFormatada()}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{perfil.nome.substring(0, 2).toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Objetivos</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros}>
          {PRAZOS.map(p => (
            <TouchableOpacity key={p.valor} style={[styles.filtroPilula, filtro === p.valor && styles.filtroPilulaAtivo]} onPress={() => setFiltro(p.valor)}>
              <Text style={[styles.filtroTexto, filtro === p.valor && styles.filtroTextoAtivo]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {objetivosFiltrados.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum objetivo ainda</Text>
            <Text style={styles.vazioDica}>Toque em + para criar seu primeiro objetivo</Text>
          </View>
        ) : (
          objetivosFiltrados.map(objetivo => {
            const pct = progresso(objetivo)
            const aberto = objetivoAberto?.id === objetivo.id
            return (
              <View key={objetivo.id} style={styles.cardObjetivo}>
                <TouchableOpacity
                  style={styles.cardObjetivoHeader}
                  onPress={() => navigation.navigate('ObjetivoDetalhe', { objetivoId: objetivo.id })}
                  onLongPress={() => onLongPress(objetivo)}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <View style={[styles.prazoTag, { backgroundColor: objetivo.cor + '22' }]}>
                    <Text style={[styles.prazoTexto, { color: objetivo.cor }]}>{LABEL_PRAZO[objetivo.prazo]}</Text>
                  </View>
                  <Text style={styles.cardObjetivoTitulo}>{objetivo.titulo}</Text>
                  <View style={styles.progressoRow}>
                    <View style={styles.progressoFundo}>
                      <View style={[styles.progressoPreenchido, { width: `${pct}%`, backgroundColor: objetivo.cor }]} />
                    </View>
                    <Text style={styles.progressoPct}>{pct}%</Text>
                  </View>
                  <Text style={styles.progressoLegenda}>{objetivo.tarefas.filter(t => t.concluida).length} / {objetivo.tarefas.length} tarefas</Text>
                </TouchableOpacity>

                {aberto && (
                  <View style={styles.tarefasContainer}>
                    <View style={styles.tarefasDivisor} />
                    {objetivo.tarefas.length === 0 ? (
                      <Text style={styles.semTarefas}>Nenhuma tarefa ainda</Text>
                    ) : (
                      objetivo.tarefas.map(tarefa => (
                        <TouchableOpacity key={tarefa.id} style={styles.tarefaRow} onPress={() => concluirTarefaObjetivo(objetivo.id, tarefa.id)}>
                          <View style={[styles.checkbox, tarefa.concluida && { backgroundColor: objetivo.cor, borderColor: objetivo.cor }]}>
                            {tarefa.concluida && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <Text style={[styles.tarefaTexto, tarefa.concluida && styles.tarefaConcluida]}>{tarefa.titulo}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                    <TouchableOpacity style={styles.botaoNovaTarefa} onPress={() => { setObjetivoAberto(objetivo); setModalNovaTarefa(true) }}>
                      <Text style={styles.botaoNovaTarefaTexto}>+ Nova tarefa</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fabChat} onPress={() => setChatVisivel(true)}>
              <Text style={styles.fabChatTexto}>✨</Text>
            </TouchableOpacity>

      <Modal visible={modalNovoObjetivo} transparent animationType="slide" onRequestClose={() => setModalNovoObjetivo(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalFundo}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitulo}>{objetivoEditando ? 'Editar objetivo' : 'Novo objetivo'}</Text>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput style={styles.input} placeholder="Ex: Aprender a tocar guitarra" placeholderTextColor={colors.textMuted} value={novoObjetivo.titulo} onChangeText={t => setNovoObjetivo({ ...novoObjetivo, titulo: t })} autoFocus />
              <Text style={styles.inputLabel}>Prazo</Text>
              <View style={styles.prazoSelector}>
                {['curto', 'medio', 'longo'].map(p => (
                  <TouchableOpacity key={p} style={[styles.prazoOpcao, novoObjetivo.prazo === p && { backgroundColor: COR_PRAZO[p], borderColor: COR_PRAZO[p] }]} onPress={() => setNovoObjetivo({ ...novoObjetivo, prazo: p })}>
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

      <Modal visible={modalNovaTarefa} transparent animationType="slide" onRequestClose={() => setModalNovaTarefa(false)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Nova tarefa</Text>
            {objetivoAberto && <Text style={styles.modalData}>{objetivoAberto.titulo}</Text>}
            <Text style={styles.inputLabel}>Título da tarefa</Text>
            <TextInput style={styles.input} placeholder="Ex: Pesquisar cursos online" placeholderTextColor={colors.textMuted} value={novaTarefa} onChangeText={setNovaTarefa} autoFocus />
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalNovaTarefa(false)}>
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSalvar} onPress={salvarTarefa}>
                <Text style={styles.botaoSalvarTexto}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  saudacao: { ...typography.h2 },
  data: { ...typography.caption, marginTop: 2, textTransform: 'capitalize' },
  avatar: { width: 44, height: 44, borderRadius: radii.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { fontSize: 15, fontWeight: '600', color: colors.primaryDark },
  scroll: { paddingBottom: 100 },
  titulo: { ...typography.h2, padding: spacing.md, paddingBottom: spacing.sm },
  filtros: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  filtroPilula: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  filtroPilulaAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  filtroTexto: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  filtroTextoAtivo: { color: 'white' },
  cardObjetivo: { backgroundColor: colors.surface, borderRadius: radii.lg, marginHorizontal: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardObjetivoHeader: { padding: spacing.md },
  prazoTag: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, marginBottom: spacing.xs },
  prazoTexto: { fontSize: 12, fontWeight: '600' },
  cardObjetivoTitulo: { ...typography.h3, marginBottom: spacing.sm },
  progressoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progressoFundo: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  progressoPreenchido: { height: 8, borderRadius: radii.full },
  progressoPct: { ...typography.caption, fontWeight: '600', minWidth: 32, textAlign: 'right' },
  progressoLegenda: { ...typography.caption, marginTop: 4 },
  tarefasContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  tarefasDivisor: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  semTarefas: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  tarefaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  checkmark: { color: 'white', fontSize: 12, fontWeight: '700' },
  tarefaTexto: { ...typography.body, flex: 1 },
  tarefaConcluida: { textDecorationLine: 'line-through', color: colors.textMuted },
  botaoNovaTarefa: { marginTop: spacing.xs },
  botaoNovaTarefaTexto: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  vazio: { alignItems: 'center', paddingVertical: spacing.xxl },
  vazioTexto: { ...typography.body, color: colors.textMuted },
  vazioDica: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 10, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabTexto: { color: 'white', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  fabChat: { position: 'absolute', bottom: 10, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabChatTexto: { fontSize: 24 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  modalTitulo: { ...typography.h3, marginBottom: 4 },
  modalData: { ...typography.caption, marginBottom: spacing.lg },
  inputLabel: { ...typography.label, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  prazoSelector: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  prazoOpcao: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  prazoOpcaoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  modalBotoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
  botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '600' },
})