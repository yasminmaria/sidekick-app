import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { colors, spacing, radii, typography } from '../theme'

export default function TarefaObjetivoCard({
  tarefa,
  objetivo,
  onConcluir,
  onSegmentar,
  carregandoSegmentacao,
}) {
  function renderAcoesEsquerda() {
    return null
  }

  function renderAcoesDireita() {
    return (
      <View style={styles.acoesContainer}>
        <TouchableOpacity
          style={styles.acaoSegmentar}
          onPress={() => onSegmentar(tarefa)}
        >
          {carregandoSegmentacao === tarefa.id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.acaoIcone}>✨</Text>
              <Text style={styles.acaoTexto}>Segmentar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <Swipeable
      renderRightActions={renderAcoesDireita}
      renderLeftActions={renderAcoesEsquerda}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.cardTarefa}
        onPress={() => onConcluir(tarefa.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, { borderColor: objetivo.cor }]} />
        <View style={styles.tarefaInfo}>
          <Text style={styles.tarefaTexto}>{tarefa.titulo}</Text>
          <Text style={styles.tarefaXP}>+15 XP ao concluir · deslize para segmentar</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  cardTarefa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  tarefaInfo: { flex: 1 },
  tarefaTexto: { ...typography.body },
  tarefaXP: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  acoesContainer: {
    marginBottom: spacing.sm,
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  acaoSegmentar: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: '100%',
  },
  acaoIcone: { fontSize: 18, marginBottom: 2 },
  acaoTexto: { color: 'white', fontSize: 12, fontWeight: '600' },
})