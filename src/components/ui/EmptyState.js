import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, typography } from '../../theme'

export function EmptyState({ titulo, dica }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      {dica && <Text style={styles.dica}>{dica}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl },
  titulo: { ...typography.body, color: colors.textMuted },
  dica: { ...typography.caption, marginTop: spacing.xs, textAlign: 'center', paddingHorizontal: spacing.lg },
})