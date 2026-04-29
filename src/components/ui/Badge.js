import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, radii } from '../../theme'

export function Badge({ label, cor = colors.primary, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: cor + '22' }, style]}>
      <Text style={[styles.texto, { color: cor }]}>{label}</Text>
    </View>
  )
}

export function BadgeXP({ xp, opaco = false }) {
  return (
    <Text style={[styles.xp, opaco && { opacity: 0.3 }]}>+{xp}xp</Text>
  )
}

export function BadgeMoeda({ moedas, opaco = false }) {
  return (
    <Text style={[styles.moeda, opaco && { opacity: 0.3 }]}>🪙{moedas}</Text>
  )
}

export function BadgeRepeticao({ label }) {
  return (
    <Text style={styles.repeticao}>🔁 {label}</Text>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  texto: { fontSize: 12, fontWeight: '600' },
  xp: { fontSize: 12, fontWeight: '600', color: colors.primary },
  moeda: { fontSize: 11, color: colors.amber },
  repeticao: { fontSize: 11, color: colors.primary, marginTop: 2, fontWeight: '500' },
})