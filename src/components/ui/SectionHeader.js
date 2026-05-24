import { View, Text, StyleSheet } from 'react-native'
import { ButtonAdicionar } from './Button'
import { typography, spacing } from '../../theme'

export function SectionHeader({ titulo, labelBotao, onPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      {onPress && (
        <ButtonAdicionar label={labelBotao || '+ Adicionar'} onPress={onPress} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titulo: { ...typography.h3 },
})