import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'

const CONQUISTAS = [
  { id: 'c1', emoji: '🌱', titulo: 'Primeira tarefa', desc: 'Conclua sua primeira tarefa' },
  { id: 'c2', emoji: '⚡', titulo: 'Energia total', desc: 'Alcance o nível 5', nivelNecessario: 5 },
  { id: 'c3', emoji: '🔥', titulo: 'Em chamas', desc: 'Mantenha 7 dias de streak', streakNecessario: 7 },
  { id: 'c4', emoji: '🎯', titulo: 'Focado', desc: 'Crie seu primeiro objetivo' },
  { id: 'c5', emoji: '💎', titulo: 'Dedicado', desc: 'Alcance 500 XP', xpNecessario: 500 },
  { id: 'c6', emoji: '🏆', titulo: 'Campeão', desc: 'Alcance o nível 10', nivelNecessario: 10 },
]

export default function PerfilScreen() {
  const { perfil, tarefas, habitos, objetivos, alterarNome, resetarTudo } = useAppStore()
  const [modalNome, setModalNome] = useState(false)
  const [novoNome, setNovoNome] = useState(perfil.nome)

  const porcentagemXP = Math.round((perfil.xpAtual / perfil.xpProximoNivel) * 100)
  const tarefasFeitas = tarefas.filter(t => t.concluida).length
  const habitosFeitos = habitos.filter(h => h.concluidoHoje).length
  const objetivosConcluidos = objetivos.filter(o => o.tarefas.length > 0 && o.tarefas.every(t => t.concluida)).length

  function salvarNome() {
    if (!novoNome.trim()) return
    alterarNome(novoNome.trim())
    setModalNome(false)
  }

  function confirmarReset() {
    Alert.alert('Resetar tudo?', 'Isso apagará todos os seus dados. Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Resetar', style: 'destructive', onPress: () => resetarTudo() },
    ])
  }

  function conquistaDesbloqueada(c) {
    if (c.nivelNecessario) return perfil.nivel >= c.nivelNecessario
    if (c.streakNecessario) return perfil.streak >= c.streakNecessario
    if (c.xpNecessario) return perfil.xpAtual >= c.xpNecessario
    return tarefasFeitas > 0
  }
  function dataFormatada() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}

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

          <View style={styles.cardNivel}>
          <View style={styles.nivelRow}>
            <View>
              <Text style={styles.nivelLabel}>Nível atual</Text>
              <Text style={styles.nivelNumero}>{perfil.nivel}</Text>
            </View>
            <View style={styles.nivelStats}>
              <Text style={styles.nivelStatValor}>🪙 {perfil.moedas}</Text>
              <Text style={styles.nivelStatLabel}>moedas</Text>
            </View>
            <View style={styles.nivelStats}>
              <Text style={styles.nivelStatValor}>🔥 {perfil.streak}</Text>
              <Text style={styles.nivelStatLabel}>streak</Text>
            </View>
          </View>
          <View style={styles.xpBarraFundo}>
            <View style={[styles.xpBarraPreenchida, { width: `${porcentagemXP}%` }]} />
          </View>
          <Text style={styles.xpTexto}>{perfil.xpAtual} / {perfil.xpProximoNivel} XP · {porcentagemXP}% para o nível {perfil.nivel + 1}</Text>
        </View>

        <Text style={styles.secaoTitulo}>Estatísticas</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{tarefasFeitas}</Text>
            <Text style={styles.statLabel}>Tarefas feitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{habitosFeitos}</Text>
            <Text style={styles.statLabel}>Hábitos hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{objetivos.length}</Text>
            <Text style={styles.statLabel}>Objetivos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{objetivosConcluidos}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>

        <Text style={styles.secaoTitulo}>Conquistas</Text>
        <View style={styles.conquistasGrid}>
          {CONQUISTAS.map(c => {
            const desbloqueada = conquistaDesbloqueada(c)
            return (
              <View key={c.id} style={[styles.conquistaCard, !desbloqueada && styles.conquistaBloqueada]}>
                <Text style={[styles.conquistaEmoji, !desbloqueada && { opacity: 0.3 }]}>{c.emoji}</Text>
                <Text style={[styles.conquistaTitulo, !desbloqueada && { color: colors.textMuted }]}>{c.titulo}</Text>
                <Text style={styles.conquistaDesc}>{c.desc}</Text>
              </View>
            )
          })}
        </View>

        <Text style={styles.secaoTitulo}>Configurações</Text>
        <TouchableOpacity style={styles.opcaoItem} onPress={() => { setNovoNome(perfil.nome); setModalNome(true) }}>
          <Text style={styles.opcaoTexto}>✏️  Editar nome</Text>
          <Text style={styles.opcaoSeta}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.opcaoItem, styles.opcaoPerigo]} onPress={confirmarReset}>
          <Text style={[styles.opcaoTexto, { color: colors.coral }]}>🗑️  Resetar todos os dados</Text>
          <Text style={[styles.opcaoSeta, { color: colors.coral }]}>›</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal visible={modalNome} transparent animationType="slide" onRequestClose={() => setModalNome(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  perfilHeader: { alignItems: 'center', paddingVertical: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: radii.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarTexto: { fontSize: 28, fontWeight: '700', color: colors.primaryDark },
  nomeTexto: { ...typography.h2, textAlign: 'center' },
  nomeEditar: { ...typography.caption, textAlign: 'center', color: colors.primary, marginTop: 4 },
  cardNivel: { backgroundColor: colors.primaryDark, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.lg },
  nivelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  nivelLabel: { fontSize: 12, color: 'white', opacity: 0.7 },
  nivelNumero: { fontSize: 48, fontWeight: '800', color: 'white', lineHeight: 56 },
  nivelStats: { flex: 1, alignItems: 'center' },
  nivelStatValor: { fontSize: 18, fontWeight: '700', color: 'white' },
  nivelStatLabel: { fontSize: 11, color: 'white', opacity: 0.7 },
  xpBarraFundo: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.full, overflow: 'hidden', marginBottom: spacing.xs },
  xpBarraPreenchida: { height: 8, backgroundColor: 'white', borderRadius: radii.full },
  xpTexto: { fontSize: 12, color: 'white', opacity: 0.7 },
  secaoTitulo: { ...typography.h3, marginBottom: spacing.sm, marginTop: spacing.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { width: '47%', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  statValor: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.caption, marginTop: 4, textAlign: 'center' },
  conquistasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  conquistaCard: { width: '30%', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  conquistaBloqueada: { backgroundColor: colors.background },
  conquistaEmoji: { fontSize: 28, marginBottom: 4 },
  conquistaTitulo: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: colors.textPrimary },
  conquistaDesc: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  opcaoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  opcaoPerigo: { borderColor: colors.coral + '44' },
  opcaoTexto: { ...typography.body },
  opcaoSeta: { fontSize: 20, color: colors.textMuted },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.lg, paddingBottom: spacing.xxl },
  modalTitulo: { ...typography.h3, marginBottom: spacing.md },
  input: { backgroundColor: colors.background, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  modalBotoes: { flexDirection: 'row', gap: spacing.sm },
  botaoCancelar: { flex: 1, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  botaoCancelarTexto: { ...typography.body, color: colors.textSecondary },
  botaoSalvar: { flex: 1, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  botaoSalvarTexto: { ...typography.body, color: 'white', fontWeight: '600' },
})