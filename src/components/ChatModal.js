import {
  View, Text, StyleSheet, Modal, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native'
import { useState, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { colors, spacing, radii, typography } from '../theme'
import { chatIA } from '../utils/api'

const COR_PRAZO = { curto: '#7F77DD', medio: '#1D9E75', longo: '#EF9F27' }

export default function ChatModal({ visivel, onFechar }) {
  const store = useAppStore()
  const {
    tarefas, objetivos, habitos, medicamentos, eventos, perfil,
    adicionarTarefa, adicionarObjetivo, adicionarHabito,
    adicionarMedicamento, adicionarEvento,
  } = store

  const [mensagens, setMensagens] = useState([
    {
      role: 'assistant',
      content: `Oi, ${perfil.nome}! 👋 Sou o Sidekick. Posso criar tarefas, objetivos, hábitos, medicamentos e eventos pra você — é só pedir! O que vamos fazer hoje?`,
      tipo: 'texto',
    }
  ])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const scrollRef = useRef(null)

  function montarContexto() {
    return {
      perfil: { nome: perfil.nome, nivel: perfil.nivel, xpAtual: perfil.xpAtual },
      tarefas: tarefas.map(t => ({ id: t.id, titulo: t.titulo, concluida: t.concluida })),
      objetivos: objetivos.map(o => ({ id: o.id, titulo: o.titulo, prazo: o.prazo, tarefas: o.tarefas.length })),
      habitos: habitos.map(h => ({ id: h.id, titulo: h.titulo, streak: h.streak, concluidoHoje: h.concluidoHoje })),
      medicamentos: medicamentos.map(m => ({ id: m.id, nome: m.nome, horarios: m.horarios })),
      hoje: new Date().toISOString().split('T')[0],
    }
  }

  function executarAcao(acao, dados) {
    if (!acao || !dados) return

    switch (acao) {
      case 'criar_tarefa':
        adicionarTarefa({
          titulo: dados.titulo,
          xp: dados.xp || 20,
          moedas: dados.moedas || 5,
          repetitiva: dados.repetitiva || false,
          frequencia: dados.frequencia || null,
          dias: dados.dias || [],
        })
        break

      case 'criar_objetivo':
        adicionarObjetivo({
          titulo: dados.titulo,
          prazo: dados.prazo || 'curto',
          cor: COR_PRAZO[dados.prazo] || '#7F77DD',
        })
        break

      case 'criar_habito':
        adicionarHabito({
          titulo: dados.titulo,
          emoji: dados.emoji || '⭐',
        })
        break

      case 'criar_evento':
        adicionarEvento(dados.data || new Date().toISOString().split('T')[0], {
          titulo: dados.titulo,
          horario: dados.horario || 'Sem horário',
          cor: dados.cor || '#1D9E75',
        })
        break

      case 'criar_medicamento':
        adicionarMedicamento({
          nome: dados.nome,
          tipo: dados.tipo || 'comprimido',
          dosagem: dados.dosagem || '',
          frequencia: dados.frequencia || 'diaria',
          horarios: dados.horarios || ['08:00'],
          dias: dados.dias || [],
          duracao: dados.duracao || 'continuo',
          dataInicio: dados.dataInicio || new Date().toISOString().split('T')[0],
          dataTermino: dados.dataTermino || null,
          quantidade: dados.quantidade || 30,
          avisarReposicao: dados.avisarReposicao ?? true,
          quantidadeAviso: dados.quantidadeAviso || 10,
        })
        break
    }
  }

  async function enviar() {
    if (!input.trim() || carregando) return

    const novaMensagemUsuario = { role: 'user', content: input.trim(), tipo: 'texto' }
    const historico = [...mensagens, novaMensagemUsuario]

    setMensagens(historico)
    setInput('')
    setCarregando(true)

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)

    try {
      // Monta histórico sem o campo tipo (a API não precisa)
      const historicoAPI = historico.map(m => ({ role: m.role, content: m.content }))
      const resposta = await chatIA(historicoAPI, montarContexto())

      // Executa ação se houver
      executarAcao(resposta.acao, resposta.dados)

      const novaMensagemIA = {
        role: 'assistant',
        content: resposta.resposta,
        acao: resposta.acao,
        tipo: 'texto',
      }

      setMensagens(prev => [...prev, novaMensagemIA])
    } catch (erro) {
      setMensagens(prev => [...prev, {
        role: 'assistant',
        content: 'Ops, tive um problema para processar sua mensagem. Pode tentar de novo?',
        tipo: 'erro',
      }])
    } finally {
      setCarregando(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }

  function renderBadgeAcao(acao) {
    const badges = {
      criar_tarefa: { label: '✅ Tarefa criada', cor: colors.success },
      criar_objetivo: { label: '🎯 Objetivo criado', cor: colors.primary },
      criar_habito: { label: '🌱 Hábito criado', cor: colors.teal },
      criar_evento: { label: '📅 Evento criado', cor: colors.teal },
      criar_medicamento: { label: '💊 Medicamento criado', cor: colors.pink },
    }
    const badge = badges[acao]
    if (!badge) return null
    return (
      <View style={[styles.badge, { backgroundColor: badge.cor + '22' }]}>
        <Text style={[styles.badgeTexto, { color: badge.cor }]}>{badge.label}</Text>
      </View>
    )
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.avatarIA}>
                <Text style={styles.avatarIATexto}>✨</Text>
              </View>
              <View>
                <Text style={styles.headerTitulo}>Sidekick IA</Text>
                <Text style={styles.headerSubtitulo}>Seu assistente pessoal</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.fecharBtn} onPress={onFechar}>
              <Text style={styles.fecharTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>

          {/* SUGESTÕES RÁPIDAS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sugestoesRapidas}>
            {[
              'Criar uma tarefa',
              'Novo objetivo',
              'Adicionar hábito',
              'Como estou hoje?',
              'Registrar medicamento',
            ].map(s => (
              <TouchableOpacity
                key={s}
                style={styles.sugestaoRapida}
                onPress={() => { setInput(s) }}
              >
                <Text style={styles.sugestaoRapidaTexto}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* MENSAGENS */}
          <ScrollView
            ref={scrollRef}
            style={styles.mensagens}
            contentContainerStyle={styles.mensagensConteudo}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {mensagens.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.mensagemContainer,
                  msg.role === 'user' ? styles.mensagemUsuarioContainer : styles.mensagemIAContainer
                ]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.avatarIASmall}>
                    <Text style={{ fontSize: 12 }}>✨</Text>
                  </View>
                )}
                <View style={[
                  styles.bolha,
                  msg.role === 'user' ? styles.bolhaUsuario : styles.bolhaIA,
                  msg.tipo === 'erro' && styles.bolhaErro,
                ]}>
                  <Text style={[
                    styles.mensagemTexto,
                    msg.role === 'user' && styles.mensagemTextoUsuario,
                  ]}>
                    {msg.content}
                  </Text>
                  {msg.acao && renderBadgeAcao(msg.acao)}
                </View>
              </View>
            ))}

            {carregando && (
              <View style={styles.mensagemIAContainer}>
                <View style={styles.avatarIASmall}>
                  <Text style={{ fontSize: 12 }}>✨</Text>
                </View>
                <View style={styles.bolhaCarregando}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.carregandoTexto}>Pensando...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* INPUT */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escreva uma mensagem..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onSubmitEditing={enviar}
            />
            <TouchableOpacity
              style={[styles.enviarBtn, (!input.trim() || carregando) && styles.enviarBtnDesabilitado]}
              onPress={enviar}
            >
              <Text style={styles.enviarBtnTexto}>➤</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingTop: spacing.xxl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatarIA: { width: 40, height: 40, borderRadius: radii.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarIATexto: { fontSize: 20 },
  headerTitulo: { ...typography.h3 },
  headerSubtitulo: { ...typography.caption },
  fecharBtn: { padding: spacing.sm },
  fecharTexto: { color: colors.primary, fontWeight: '600', fontSize: 15 },

  sugestoesRapidas: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 48, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  sugestaoRapida: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full, marginRight: spacing.sm },
  sugestaoRapidaTexto: { color: colors.primaryDark, fontSize: 13, fontWeight: '500' },

  mensagens: { flex: 1 },
  mensagensConteudo: { padding: spacing.md, paddingBottom: spacing.xl },

  mensagemContainer: { marginBottom: spacing.md, maxWidth: '85%' },
  mensagemUsuarioContainer: { alignSelf: 'flex-end' },
  mensagemIAContainer: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  avatarIASmall: { width: 24, height: 24, borderRadius: radii.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },

  bolha: { padding: spacing.md, borderRadius: radii.lg },
  bolhaUsuario: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bolhaIA: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bolhaErro: { backgroundColor: colors.coralLight, borderColor: colors.coral },
  bolhaCarregando: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.md, borderRadius: radii.lg, borderBottomLeftRadius: 4 },
  carregandoTexto: { ...typography.caption, color: colors.primary },

  mensagemTexto: { ...typography.body, color: colors.textPrimary },
  mensagemTextoUsuario: { color: 'white' },

  badge: { marginTop: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.full, alignSelf: 'flex-start' },
  badgeTexto: { fontSize: 11, fontWeight: '600' },

  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, fontSize: 15, color: colors.textPrimary, maxHeight: 100 },
  enviarBtn: { width: 44, height: 44, borderRadius: radii.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  enviarBtnDesabilitado: { opacity: 0.4 },
  enviarBtnTexto: { color: 'white', fontSize: 18 },
})