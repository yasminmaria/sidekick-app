import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configura como as notificações aparecem quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Pede permissão ao usuário
export async function pedirPermissaoNotificacoes() {
  const { status: statusAtual } = await Notifications.getPermissionsAsync()

  if (statusAtual === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// Agenda uma notificação para uma tarefa
export async function agendarNotificacaoTarefa(tarefa) {
  if (!tarefa.lembrete || !tarefa.prazoData) return null

  const temPermissao = await pedirPermissaoNotificacoes()
  if (!temPermissao) return null

  // Monta a data/hora do lembrete
  const [ano, mes, dia] = tarefa.prazoData.split('-').map(Number)
  const [hora, minuto] = tarefa.prazoHorario
    ? tarefa.prazoHorario.split(':').map(Number)
    : [9, 0]

  const dataLembrete = new Date(ano, mes - 1, dia, hora, minuto)

  // Subtrai os minutos de antecedência
  dataLembrete.setMinutes(dataLembrete.getMinutes() - (tarefa.lembreteMinutos || 30))

  // Não agenda se já passou
  if (dataLembrete <= new Date()) return null

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 Sidekick — Tarefa pendente',
      body: tarefa.titulo,
      data: { tarefaId: tarefa.id },
    },
    trigger: dataLembrete,
  })

  return id
}

// Cancela uma notificação agendada
export async function cancelarNotificacao(notificacaoId) {
  if (!notificacaoId) return
  await Notifications.cancelScheduledNotificationAsync(notificacaoId)
}

// Cancela todas as notificações do app
export async function cancelarTodasNotificacoes() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}