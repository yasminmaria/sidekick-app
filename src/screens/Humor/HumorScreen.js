import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useState, useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'
import { globalStyles } from '../../theme/globalStyles'
import { Header } from '../../components/ui/Header'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { EmptyState } from '../../components/ui/EmptyState'

const HUMORES = [
    { emoji: '😄', label: 'Ótimo', valor: 5, cor: '#1D9E75' },
    { emoji: '🙂', label: 'Bem', valor: 4, cor: '#7F77DD' },
    { emoji: '😐', label: 'Neutro', valor: 3, cor: '#EF9F27' },
    { emoji: '😕', label: 'Mal', valor: 2, cor: '#D4537E' },
    { emoji: '😔', label: 'Péssimo', valor: 1, cor: '#D85A30' },
]

const PERIODOS = [
    { id: 'manha', label: 'Manhã', emoji: '🌅', horas: '00h–12h' },
    { id: 'tarde', label: 'Tarde', emoji: '☀️', horas: '12h–18h' },
    { id: 'noite', label: 'Noite', emoji: '🌙', horas: '18h–24h' },
]

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function toDateString(date) {
    return date.toISOString().split('T')[0]
}

function formatarDataExibicao(dateStr) {
    const [ano, mes, dia] = dateStr.split('-').map(Number)
    const data = new Date(ano, mes - 1, dia)
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function HumorScreen() {
    const { registrosHumor, registrarHumor, deletarRegistroHumor } = useAppStore()

    const hoje = toDateString(new Date())
    const [dataSelecionada, setDataSelecionada] = useState(hoje)
    const [modalNota, setModalNota] = useState(false)
    const [humorSelecionado, setHumorSelecionado] = useState(null)
    const [nota, setNota] = useState('')
    const [mostrarHistorico, setMostrarHistorico] = useState(false)
    const [mesHistorico, setMesHistorico] = useState(new Date().getMonth())
    const [anoHistorico, setAnoHistorico] = useState(new Date().getFullYear())

    // Registros do dia selecionado
    const registrosDia = useMemo(() =>
        registrosHumor.filter(r => r.data === dataSelecionada),
        [registrosHumor, dataSelecionada]
    )

    // Dias com registros para o histórico
    const diasComRegistros = useMemo(() => {
        const set = new Set(registrosHumor.map(r => r.data))
        return set
    }, [registrosHumor])

    function abrirRegistro(humor) {
        setHumorSelecionado(humor)
        setNota('')
        setModalNota(true)
    }

    function confirmarRegistro() {
        if (!humorSelecionado) return
        registrarHumor(humorSelecionado.emoji, humorSelecionado.valor, nota.trim())
        setModalNota(false)
        setHumorSelecionado(null)
        setNota('')
        // Garante que está vendo o dia de hoje
        setDataSelecionada(hoje)
    }

    function confirmarDeletar(id, emoji) {
        Alert.alert('Remover registro?', `O registro ${emoji} será removido.`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Remover', style: 'destructive', onPress: () => deletarRegistroHumor(id) },
        ])
    }

    // Último humor registrado hoje
    const ultimoHoje = registrosDia[0]

    // Gera dias do mês para o calendário do histórico
    function gerarDiasMes(ano, mes) {
        const primeiroDia = new Date(ano, mes, 1).getDay()
        const totalDias = new Date(ano, mes + 1, 0).getDate()
        const dias = []
        for (let i = 0; i < primeiroDia; i++) dias.push(null)
        for (let i = 1; i <= totalDias; i++) dias.push(i)
        return dias
    }

    return (
        <View style={globalStyles.screen}>
            <Header titulo="Humor" />

            <ScrollView contentContainerStyle={globalStyles.scroll}>

                {/* REGISTRO RÁPIDO */}
                <View style={styles.registroCard}>
                    <Text style={styles.registroTitulo}>Como você está agora?</Text>
                    {ultimoHoje && (
                        <Text style={styles.registroUltimo}>
                            Último registro: {ultimoHoje.emoji} {ultimoHoje.hora}
                        </Text>
                    )}
                    <View style={styles.humorRow}>
                        {HUMORES.map(h => (
                            <TouchableOpacity
                                key={h.valor}
                                style={styles.humorBtn}
                                onPress={() => abrirRegistro(h)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.humorEmoji}>{h.emoji}</Text>
                                <Text style={styles.humorLabel}>{h.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* CARDS DE PERÍODO */}
                <SectionHeader
                    titulo={dataSelecionada === hoje ? 'Hoje' : formatarDataExibicao(dataSelecionada)}
                    labelBotao="Histórico"
                    onPress={() => setMostrarHistorico(true)}
                />

                <View style={styles.periodosRow}>
                    {PERIODOS.map(periodo => {
                        const registrosPeriodo = registrosDia.filter(r => r.periodo === periodo.id)
                        const ultimoPeriodo = registrosPeriodo[0]

                        return (
                            <View key={periodo.id} style={[
                                styles.periodoCard,
                                ultimoPeriodo && { borderTopColor: HUMORES.find(h => h.valor === ultimoPeriodo.valor)?.cor, borderTopWidth: 3 }
                            ]}>
                                <Text style={styles.periodoEmoji}>{periodo.emoji}</Text>
                                <Text style={styles.periodoLabel}>{periodo.label}</Text>
                                <Text style={styles.periodoHoras}>{periodo.horas}</Text>

                                {ultimoPeriodo ? (
                                    <View style={styles.periodoHumor}>
                                        <Text style={styles.periodoHumorEmoji}>{ultimoPeriodo.emoji}</Text>
                                        <Text style={styles.periodoHumorLabel}>
                                            {HUMORES.find(h => h.valor === ultimoPeriodo.valor)?.label}
                                        </Text>
                                        {registrosPeriodo.length > 1 && (
                                            <Text style={styles.periodoContagem}>
                                                +{registrosPeriodo.length - 1} registro{registrosPeriodo.length > 2 ? 's' : ''}
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={styles.periodoVazio}>Não registrado</Text>
                                )}
                            </View>
                        )
                    })}
                </View>

                {/* REGISTROS DETALHADOS DO DIA */}
                {registrosDia.length > 0 && (
                    <>
                        <SectionHeader titulo="Registros do dia" />
                        {registrosDia.map(registro => (
                            <TouchableOpacity
                                key={registro.id}
                                style={styles.registroItem}
                                onLongPress={() => confirmarDeletar(registro.id, registro.emoji)}
                                delayLongPress={400}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.registroItemEmoji, { backgroundColor: HUMORES.find(h => h.valor === registro.valor)?.cor + '22' }]}>
                                    <Text style={styles.registroItemEmojiTexto}>{registro.emoji}</Text>
                                </View>
                                <View style={styles.registroItemInfo}>
                                    <Text style={styles.registroItemLabel}>
                                        {HUMORES.find(h => h.valor === registro.valor)?.label}
                                    </Text>
                                    {registro.nota ? (
                                        <Text style={styles.registroItemNota}>{registro.nota}</Text>
                                    ) : null}
                                </View>
                                <View style={styles.registroItemMeta}>
                                    <Text style={styles.registroItemHora}>{registro.hora}</Text>
                                    <Text style={styles.registroItemPeriodo}>
                                        {PERIODOS.find(p => p.id === registro.periodo)?.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {registrosDia.length === 0 && (
                    <EmptyState
                        titulo="Nenhum registro hoje"
                        dica="Toque em um emoji acima para registrar como você está"
                    />
                )}

            </ScrollView>

            {/* MODAL — HISTÓRICO */}
            <Modal visible={mostrarHistorico} transparent animationType="slide" onRequestClose={() => setMostrarHistorico(false)}>
                <View style={globalStyles.modalFundo}>
                    <View style={[globalStyles.modalContainer, { maxHeight: '80%' }]}>
                        <Text style={globalStyles.modalTitulo}>📅 Histórico de humor</Text>

                        {/* Navegação de mês */}
                        <View style={styles.mesNav}>
                            <TouchableOpacity
                                style={styles.mesNavBtn}
                                onPress={() => {
                                    if (mesHistorico === 0) { setMesHistorico(11); setAnoHistorico(anoHistorico - 1) }
                                    else setMesHistorico(mesHistorico - 1)
                                }}
                            >
                                <Text style={styles.mesNavTexto}>‹</Text>
                            </TouchableOpacity>
                            <Text style={styles.mesTitulo}>{MESES[mesHistorico]} {anoHistorico}</Text>
                            <TouchableOpacity
                                style={styles.mesNavBtn}
                                onPress={() => {
                                    if (mesHistorico === 11) { setMesHistorico(0); setAnoHistorico(anoHistorico + 1) }
                                    else setMesHistorico(mesHistorico + 1)
                                }}
                            >
                                <Text style={styles.mesNavTexto}>›</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Grade de dias */}
                        <View style={styles.calendarHeader}>
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                <Text key={i} style={styles.calendarDia}>{d}</Text>
                            ))}
                        </View>

                        <View style={styles.calendarGrade}>
                            {gerarDiasMes(anoHistorico, mesHistorico).map((dia, index) => {
                                if (!dia) return <View key={`v-${index}`} style={styles.calendarCell} />

                                const dateStr = `${anoHistorico}-${String(mesHistorico + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                                const temRegistro = diasComRegistros.has(dateStr)
                                const selecionado = dateStr === dataSelecionada
                                const ehHoje = dateStr === hoje

                                // Pega o humor predominante do dia
                                const registrosDoDia = registrosHumor.filter(r => r.data === dateStr)
                                const humorPredominante = registrosDoDia.length > 0
                                    ? HUMORES.find(h => h.valor === Math.round(registrosDoDia.reduce((a, r) => a + r.valor, 0) / registrosDoDia.length))
                                    : null

                                return (
                                    <TouchableOpacity
                                        key={dateStr}
                                        style={styles.calendarCell}
                                        onPress={() => {
                                            setDataSelecionada(dateStr)
                                            setMostrarHistorico(false)
                                        }}
                                    >
                                        <View style={[
                                            styles.calendarDiaNumero,
                                            selecionado && { backgroundColor: colors.primary },
                                            !selecionado && ehHoje && { backgroundColor: colors.primaryLight },
                                        ]}>
                                            {humorPredominante && !selecionado ? (
                                                <Text style={styles.calendarEmoji}>{humorPredominante.emoji}</Text>
                                            ) : (
                                                <Text style={[
                                                    styles.calendarNumero,
                                                    selecionado && { color: 'white' },
                                                    ehHoje && !selecionado && { color: colors.primaryDark, fontWeight: '700' },
                                                ]}>
                                                    {dia}
                                                </Text>
                                            )}
                                        </View>
                                        {temRegistro && !humorPredominante && (
                                            <View style={styles.calendarPonto} />
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>

                        <TouchableOpacity
                            style={[globalStyles.botaoPrimario, { marginTop: spacing.lg }]}
                            onPress={() => setMostrarHistorico(false)}
                        >
                            <Text style={globalStyles.botaoPrimarioTexto}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

 {/* MODAL — REGISTRAR COM NOTA */}
      <Modal visible={modalNota} transparent animationType="slide" onRequestClose={() => setModalNota(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={globalStyles.modalFundo}>
            <View style={globalStyles.modalContainer}>
              {humorSelecionado && (
                <>
                  <View style={styles.modalHumorHeader}>
                    <Text style={styles.modalHumorEmoji}>{humorSelecionado.emoji}</Text>
                    <View>
                      <Text style={globalStyles.modalTitulo}>{humorSelecionado.label}</Text>
                      <Text style={globalStyles.modalSubtitulo}>
                        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  <Text style={globalStyles.inputLabel}>Quer adicionar uma nota? (opcional)</Text>
                  <TextInput
                    style={[globalStyles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Ex: Acordei cansada, mas depois do café melhorou..."
                    placeholderTextColor={colors.textMuted}
                    value={nota}
                    onChangeText={setNota}
                    multiline
                    autoFocus
                  />

                  <View style={globalStyles.modalBotoes}>
                    <TouchableOpacity
                      style={globalStyles.botaoSecundario}
                      onPress={() => setModalNota(false)}
                    >
                      <Text style={globalStyles.botaoSecundarioTexto}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[globalStyles.botaoPrimario, { backgroundColor: humorSelecionado.cor }]}
                      onPress={confirmarRegistro}
                    >
                      <Text style={globalStyles.botaoPrimarioTexto}>Registrar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
    // Registro rápido
    registroCard: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    registroTitulo: { ...typography.h3, marginBottom: 4 },
    registroUltimo: { ...typography.caption, marginBottom: spacing.md, color: colors.textMuted },
    humorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    humorBtn: { alignItems: 'center', flex: 1 },
    humorEmoji: { fontSize: 32, marginBottom: 4 },
    humorLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },

    // Cards de período
    periodosRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    periodoCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    periodoEmoji: { fontSize: 20, marginBottom: 4 },
    periodoLabel: { ...typography.label, fontWeight: '600', marginBottom: 2 },
    periodoHoras: { fontSize: 10, color: colors.textMuted, marginBottom: spacing.sm },
    periodoHumor: { alignItems: 'center' },
    periodoHumorEmoji: { fontSize: 24 },
    periodoHumorLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    periodoContagem: { fontSize: 10, color: colors.primary, marginTop: 2, fontWeight: '600' },
    periodoVazio: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },

    // Registros do dia
    registroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    registroItemEmoji: {
        width: 44,
        height: 44,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    registroItemEmojiTexto: { fontSize: 24 },
    registroItemInfo: { flex: 1 },
    registroItemLabel: { ...typography.body, fontWeight: '600' },
    registroItemNota: { ...typography.caption, marginTop: 2, fontStyle: 'italic' },
    registroItemMeta: { alignItems: 'flex-end' },
    registroItemHora: { ...typography.label, fontWeight: '600' },
    registroItemPeriodo: { ...typography.caption, marginTop: 2 },

    // Modal humor
    modalHumorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    modalHumorEmoji: { fontSize: 48 },

    // Calendário histórico
    mesNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    mesNavBtn: { padding: spacing.sm },
    mesNavTexto: { fontSize: 22, color: colors.primary, fontWeight: '600' },
    mesTitulo: { ...typography.h3 },
    calendarHeader: { flexDirection: 'row', marginBottom: spacing.sm },
    calendarDia: { flex: 1, textAlign: 'center', ...typography.caption, fontWeight: '600', color: colors.textMuted },
    calendarGrade: { flexDirection: 'row', flexWrap: 'wrap' },
    calendarCell: { width: '14.28%', alignItems: 'center', paddingVertical: 4 },
    calendarDiaNumero: {
        width: 34,
        height: 34,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarEmoji: { fontSize: 20 },
    calendarNumero: { ...typography.body, fontSize: 14 },
    calendarPonto: {
        width: 5,
        height: 5,
        borderRadius: radii.full,
        backgroundColor: colors.primary,
        marginTop: 2,
    },
})