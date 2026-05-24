import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors, spacing, radii, typography } from '../../theme'

export function Button({ label, onPress, variante = 'primario', desabilitado = false, style }) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variante], desabilitado && styles.desabilitado, style]}
      onPress={onPress}
      disabled={desabilitado}
      activeOpacity={0.7}
    >
      <Text style={[styles.texto, styles[`texto_${variante}`]]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

export function ButtonPilula({ label, onPress, ativo = false, cor, style }) {
  return (
    <TouchableOpacity
      style={[
        styles.pilula,
        ativo && { backgroundColor: cor || colors.primary, borderColor: cor || colors.primary },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.pilulaTexto, ativo && styles.pilulaTextoAtivo]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

export function ButtonAdicionar({ label = '+ Adicionar', onPress }) {
  return (
    <TouchableOpacity style={styles.adicionar} onPress={onPress}>
      <Text style={styles.adicionarTexto}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  primario: {
    backgroundColor: colors.primary,
  },
  secundario: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  perigo: {
    backgroundColor: colors.coral,
  },
  desabilitado: { opacity: 0.4 },
  texto: { ...typography.body, fontWeight: '600' },
  texto_primario: { color: 'white' },
  texto_secundario: { color: colors.textSecondary },
  texto_perigo: { color: 'white' },

  pilula: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  pilulaTexto: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  pilulaTextoAtivo: { color: 'white' },

  adicionar: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  adicionarTexto: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
})