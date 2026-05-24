import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, radii, typography } from '../../theme'

export function XPBar({ nivel, xpAtual, xpProximoNivel, moedas }) {
  const porcentagem = Math.round((xpAtual / xpProximoNivel) * 100)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>⚡ Nível {nivel}</Text>
        <Text style={styles.numeros}>{xpAtual} / {xpProximoNivel} XP</Text>
      </View>
      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${porcentagem}%` }]} />
      </View>
      <View style={styles.rodape}>
        <Text style={styles.dica}>{porcentagem}% para o próximo nível</Text>
        {moedas !== undefined && (
          <Text style={styles.moedas}>🪙 {moedas}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { ...typography.label, color: colors.primaryDark, fontWeight: '600' },
  numeros: { ...typography.label },
  barraFundo: { height: 10, backgroundColor: colors.border, borderRadius: radii.full, overflow: 'hidden' },
  barraPreenchida: { height: 10, backgroundColor: colors.primary, borderRadius: radii.full },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  dica: { ...typography.caption },
  moedas: { ...typography.caption, fontWeight: '600', color: colors.amber },
})