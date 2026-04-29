import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppStore } from '../../store/useAppStore'
import { colors, spacing, radii, typography } from '../../theme'

export function Header({ titulo, onVoltar }) {
  const { perfil } = useAppStore()
  const insets = useSafeAreaInsets()

  // Modo tela interna — com botão de voltar e título
  if (onVoltar) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.voltarBtn} onPress={onVoltar}>
          <Text style={styles.voltarTexto}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.tituloPagina}>{titulo}</Text>
        <View style={styles.placeholder} />
      </View>
    )
  }

  // Modo home — saudação + avatar
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View>
        <Text style={styles.saudacao}>Olá, {perfil.nome}! 👋</Text>
        <Text style={styles.data}>{dataFormatada()}</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>
          {perfil.nome.substring(0, 2).toUpperCase()}
        </Text>
      </View>
    </View>
  )
}

function dataFormatada() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Modo home
  saudacao: { ...typography.h2 },
  data: { ...typography.caption, marginTop: 2, textTransform: 'capitalize' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { fontSize: 15, fontWeight: '600', color: colors.primaryDark },

  // Modo tela interna
  voltarBtn: { padding: spacing.xs, minWidth: 80 },
  voltarTexto: { fontSize: 17, color: colors.primary, fontWeight: '500' },
  tituloPagina: { ...typography.h3 },
  placeholder: { minWidth: 80 },
})