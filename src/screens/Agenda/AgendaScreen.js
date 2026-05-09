import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, KeyboardAvoidingViewComponent} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'
import { Header } from '../../components/ui/Header'
import PerfilScreen from '../Perfil/PerfilScreen'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const perfil = useAppStore.getState().perfil

function dataFormatada() {
  const agora = new Date()
  return agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function gerarDiasDoMes(ano, mes) {
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  const dias = []
  for (let i = 0; i < primeiroDia; i++) dias.push(null)
  for (let i = 1; i <= totalDias; i++) dias.push(i)
  return dias
}

function toDateString(ano, mes, dia) {
  const m = String(mes + 1).padStart(2, '0')
  const d = String(dia).padStart(2, '0')
  return `${ano}-${m}-${d}`
}

function formatarData(dateStr) {
  const [ano, mes, dia] = dateStr.split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function AgendaScreen() {
  const { eventos, adicionarEvento } = useAppStore()
  const agora = new Date()
  const [mes, setMes] = useState(agora.getMonth())
  const [ano, setAno] = useState(agora.getFullYear())
  const hoje = toDateString(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const [dataSelecionada, setDataSelecionada] = useState(hoje)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [novoEvento, setNovoEvento] = useState({ titulo: '', horario: '' })
  const [perfilVisivel, setPerfilVisivel] = useState(false)
  const [chatVisivel, setChatVisivel] = useState(false)
  const dias = gerarDiasDoMes(ano, mes)

  function mesAnterior() { if (mes === 0) { setMes(11); setAno(ano - 1) } else setMes(mes - 1) }
  function proximoMes() { if (mes === 11) { setMes(0); setAno(ano + 1) } else setMes(mes + 1) }

  function salvarEvento() {
    if (!novoEvento.titulo.trim()) return
    adicionarEvento(dataSelecionada, { titulo: novoEvento.titulo, horario: novoEvento.horario || 'Sem horário', cor: colors.teal })
    setNovoEvento({ titulo: '', horario: '' })
    setModalVisivel(false)
  }

  const eventosData = eventos[dataSelecionada] || []

  return (
    <SafeAreaView style={styles.container}>

         {/* HEADER GLOBAL */}
               <Header onAvatarPress={() => setPerfilVisivel(true)} />
         
               <Modal
                 visible={perfilVisivel}
                 animationType="slide"
                 onRequestClose={() => setPerfilVisivel(false)}
               >
                 <PerfilScreen onFechar={() => setPerfilVisivel(false)} />
               </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Agenda</Text>

        <View style={styles.calendario}>
          <View style={styles.mesNav}>
            <TouchableOpacity onPress={mesAnterior} style={styles.navBtn}>
              <Text style={styles.navBtnTexto}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.mesTitulo}>{MESES[mes]} {ano}</Text>
            <TouchableOpacity onPress={proximoMes} style={styles.navBtn}>
              <Text style={styles.navBtnTexto}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.semanaHeader}>
            {DIAS_SEMANA.map(d => <Text key={d} style={styles.diaSemana}>{d}</Text>)}
          </View>

          <View style={styles.grade}>
            {dias.map((dia, index) => {
              if (!dia) return <View key={`vazio-${index}`} style={styles.diaCell} />
              const dateStr = toDateString(ano, mes, dia)
              const selecionado = dateStr === dataSelecionada
              const ehHoje = dateStr === hoje
              const temEvento = !!(eventos[dateStr]?.length)
              return (
                <TouchableOpacity key={dateStr} style={styles.diaCell} onPress={() => setDataSelecionada(dateStr)}>
                  <View style={[styles.diaNumero, selecionado && styles.diaSelecionado, !selecionado && ehHoje && styles.diaHoje]}>
                    <Text style={[styles.diaTexto, selecionado && styles.diaTextoSelecionado, !selecionado && ehHoje && styles.diaTextoHoje]}>{dia}</Text>
                  </View>
                  {temEvento && <View style={[styles.ponto, selecionado && { backgroundColor: 'white' }]} />}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.eventosHeader}>
          <Text style={styles.secaoTitulo} numberOfLines={1}>{formatarData(dataSelecionada)}</Text>
          <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalVisivel(true)}>
            <Text style={styles.botaoAdicionarTexto}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {eventosData.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum evento neste dia</Text>
            <Text style={styles.vazioDica}>Toque em + Adicionar para criar um</Text>
          </View>
        ) : (
          eventosData.map(evento => (
            <View key={evento.id} style={styles.cardEvento}>
              <View style={[styles.eventoBarra, { backgroundColor: evento.cor }]} />
              <View style={styles.eventoConteudo}>
                <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
                <Text style={styles.eventoHorario}>{evento.horario}{evento.duracao ? ` · ${evento.duracao}` : ''}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB CHAT */}
            <TouchableOpacity style={styles.fabChat} onPress={() => setChatVisivel(true)}>
              <Text style={styles.fabChatTexto}>✨</Text>
            </TouchableOpacity>

      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Novo evento</Text>
            <Text style={styles.modalData}>{formatarData(dataSelecionada)}</Text>
            <Text style={styles.inputLabel}>Título</Text>
            <TextInput style={styles.input} placeholder="Ex: Consulta, Reunião..." placeholderTextColor={colors.textMuted} value={novoEvento.titulo} onChangeText={t => setNovoEvento({ ...novoEvento, titulo: t })} />
            <Text style={styles.inputLabel}>Horário</Text>
            <TextInput style={styles.input} placeholder="Ex: 14h30" placeholderTextColor={colors.textMuted} value={novoEvento.horario} onChangeText={t => setNovoEvento({ ...novoEvento, horario: t })} />
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
                <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoSalvar} onPress={salvarEvento}>
                <Text style={styles.botaoSalvarTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
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
  calendario: { backgroundColor: colors.surface, borderRadius: radii.lg, marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  mesNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  navBtn: { padding: spacing.sm },
  navBtnTexto: { fontSize: 22, color: colors.primary, fontWeight: '600' },
  mesTitulo: { ...typography.h3 },
  semanaHeader: { flexDirection: 'row', marginBottom: spacing.sm },
  diaSemana: { flex: 1, textAlign: 'center', ...typography.caption, fontWeight: '600', color: colors.textMuted },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  diaCell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
  diaNumero: { width: 34, height: 34, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  diaSelecionado: { backgroundColor: colors.primary },
  diaHoje: { backgroundColor: colors.primaryLight },
  diaTexto: { ...typography.body, fontSize: 14 },
  diaTextoSelecionado: { color: 'white', fontWeight: '600' },
  diaTextoHoje: { color: colors.primaryDark, fontWeight: '600' },
  ponto: { width: 5, height: 5, borderRadius: radii.full, backgroundColor: colors.primary, marginTop: 2 },
  eventosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  secaoTitulo: { ...typography.h3, textTransform: 'capitalize', flex: 1 },
  botaoAdicionar: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full },
  botaoAdicionarTexto: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  cardEvento: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radii.md, marginHorizontal: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  eventoBarra: { width: 4 },
  eventoConteudo: { padding: spacing.md, flex: 1 },
  eventoTitulo: { ...typography.body, fontWeight: '600' },
  eventoHorario: { ...typography.caption, marginTop: 2 },
  vazio: { alignItems: 'center', paddingVertical: spacing.xxl },
  vazioTexto: { ...typography.body, color: colors.textMuted },
  vazioDica: { ...typography.caption, marginTop: spacing.xs },
  fab: { position: 'absolute', bottom: 20, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabTexto: { color: 'white', fontSize: 28, fontWeight: '300', lineHeight: 32 },
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
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '600' },
})