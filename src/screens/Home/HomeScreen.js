import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Switch, Alert } from 'react-native'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'
import { globalStyles } from '../../theme/globalStyles'
import ChatModal from '../../components/ChatModal'
import { Header } from '../../components/ui/Header'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { XPBar } from '../../components/ui/XPBar'
import { EmptyState } from '../../components/ui/EmptyState'
import { BadgeXP, BadgeMoeda, BadgeRepeticao } from '../../components/ui/Badge'
import PerfilScreen from '../Perfil/PerfilScreen'

const FREQUENCIAS = [
  { valor: 'diaria', label: '📅 Diária' },
  { valor: 'semanal', label: '📆 Semanal' },
  { valor: 'mensal', label: '🗓️ Mensal' },
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



function estadoInicial() {
  return { titulo: '', xp: '20', moedas: '5', repetitiva: false, frequencia: 'diaria', dias: ['seg', 'ter', 'qua', 'qui', 'sex'] }
}

export default function HomeScreen({ navigation }) {
  const { perfil, tarefas, concluirTarefa, adicionarTarefa, editarTarefa, deletarTarefa } = useAppStore()
  const [modalVisivel, setModalVisivel] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [form, setForm] = useState(estadoInicial())
  const [chatVisivel, setChatVisivel] = useState(false)
  const [perfilVisivel, setPerfilVisivel] = useState(false)

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
    })
    setModalVisivel(true)
  }

  function onLongPress(tarefa) {
    Alert.alert(tarefa.titulo, 'O que deseja fazer?', [
      { text: 'Editar', onPress: () => abrirEditar(tarefa) },
      {
        text: 'Deletar', style: 'destructive', onPress: () =>
          Alert.alert('Deletar tarefa?', `"${tarefa.titulo}" será removida.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Deletar', style: 'destructive', onPress: () => deletarTarefa(tarefa.id) },
          ])
      },
      { text: 'Cancelar', style: 'cancel' },
    ])
  }

  function salvar() {
    if (!form.titulo.trim()) return
    const dados = {
      titulo: form.titulo.trim(),
      xp: parseInt(form.xp) || 20,
      moedas: parseInt(form.moedas) || 5,
      repetitiva: form.repetitiva,
      frequencia: form.repetitiva ? form.frequencia : null,
      dias: form.repetitiva && form.frequencia === 'diaria' ? form.dias : [],
    }
    if (tarefaEditando) {
      editarTarefa(tarefaEditando.id, dados)
    } else {
      adicionarTarefa(dados)
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

  return (
    <View style={globalStyles.screen}>

      {/* HEADER GLOBAL */}
      <Header onAvatarPress={() => setPerfilVisivel(true)} />

      <Modal
        visible={perfilVisivel}
        animationType="slide"
        onRequestClose={() => setPerfilVisivel(false)}
      >
        <PerfilScreen onFechar={() => setPerfilVisivel(false)} />
      </Modal>

      <ScrollView contentContainerStyle={globalStyles.scroll}>

        {/* XP */}
        <XPBar
          nivel={perfil.nivel}
          xpAtual={perfil.xpAtual}
          xpProximoNivel={perfil.xpProximoNivel}
          moedas={perfil.moedas}
        />

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{perfil.streak}</Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{tarefas.filter(t => t.concluida).length}</Text>
            <Text style={styles.statLabel}>✅ Feitas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValor}>{tarefas.filter(t => !t.concluida).length}</Text>
            <Text style={styles.statLabel}>📋 Pendentes</Text>
          </View>
        </View>

        {/* TAREFAS */}
        <SectionHeader titulo="Tarefas de hoje" labelBotao="+ Nova" onPress={abrirCriar} />

        {tarefas.length === 0 ? (
          <EmptyState titulo="Nenhuma tarefa ainda" dica="Toque em + Nova para começar" />
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
              <View style={[globalStyles.checkbox, tarefa.concluida && globalStyles.checkboxMarcado]}>
                {tarefa.concluida && <Text style={globalStyles.checkmark}>✓</Text>}
              </View>
              <View style={styles.tarefaInfo}>
                <Text style={[styles.tarefaTexto, tarefa.concluida && styles.tarefaTextoConcluida]}>
                  {tarefa.titulo}
                </Text>
                {tarefa.repetitiva && <BadgeRepeticao label={labelDias(tarefa)} />}
              </View>
              <View style={styles.tarefaRecompensas}>
                <BadgeXP xp={tarefa.xp} opaco={tarefa.concluida} />
                <BadgeMoeda moedas={tarefa.moedas} opaco={tarefa.concluida} />
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* FAB CHAT */}
      <TouchableOpacity style={styles.fabChat} onPress={() => setChatVisivel(true)}>
        <Text style={styles.fabChatTexto}>✨</Text>
      </TouchableOpacity>

      {/* CHAT */}
      <ChatModal visivel={chatVisivel} onFechar={() => setChatVisivel(false)} />

      {/* MODAL — TAREFA */}
      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <View style={globalStyles.modalFundo}>
          <ScrollView contentContainerStyle={globalStyles.scrollModal}>
            <View style={globalStyles.modalContainer}>
              <Text style={globalStyles.modalTitulo}>
                {tarefaEditando ? 'Editar tarefa' : 'Nova tarefa'}
              </Text>

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
                    <Text style={[styles.sugestaoTexto, form.xp === s.xp && styles.sugestaoTextoAtivo]}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

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
                  style={[globalStyles.botaoPrimario, !form.titulo.trim() && globalStyles.botaoDesabilitado]}
                  onPress={salvar}
                >
                  <Text style={globalStyles.botaoPrimarioTexto}>
                    {tarefaEditando ? 'Salvar alterações' : 'Criar tarefa'}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </View>
      </Modal>
      <Modal
        visible={perfilVisivel}
        animationType="slide"
        onRequestClose={() => setPerfilVisivel(false)}
      >
        <PerfilScreen onFechar={() => setPerfilVisivel(false)} />
      </Modal>
    </View>
  )
}

// Apenas estilos ÚNICOS desta tela
const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValor: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.caption, marginTop: 2, textAlign: 'center' },

  cardTarefa: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTarefaConcluida: { backgroundColor: colors.background, opacity: 0.6 },
  tarefaInfo: { flex: 1 },
  tarefaTexto: { ...typography.body },
  tarefaTextoConcluida: { textDecorationLine: 'line-through', color: colors.textMuted },
  tarefaRecompensas: { alignItems: 'flex-end', gap: 2 },

  fabChat: { position: 'absolute', bottom: 15, right: spacing.lg, width: 52, height: 52, borderRadius: radii.full, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabChatTexto: { fontSize: 24 },

  recompensasRow: { flexDirection: 'row', gap: spacing.sm },
  recompensaCampo: { flex: 1 },
  frequenciaContainer: { marginBottom: spacing.md },
  sugestoesRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  sugestao: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  sugestaoAtiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  sugestaoTexto: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  sugestaoTextoAtivo: { color: 'white' },
})