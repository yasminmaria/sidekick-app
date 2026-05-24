import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, spacing, radii } from '../../theme'

export function Card({ children, style, onPress, onLongPress, delayLongPress = 400, activeOpacity = 0.7 }) {
  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={delayLongPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )
}

export function CardDestaque({ children, style, cor }) {
  return (
    <View style={[styles.card, styles.cardDestaque, cor && { borderLeftColor: cor }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardDestaque: {
    borderLeftWidth: 4,
    borderRadius: radii.lg,
  },
})