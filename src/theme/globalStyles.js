import { StyleSheet } from 'react-native'
import { colors, spacing, radii, typography } from './index'

export const globalStyles = StyleSheet.create({

  // ========================
  // CONTAINERS
  // ========================
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  scrollModal: {
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ========================
  // CARDS
  // ========================
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLg: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // ========================
  // MODAL
  // ========================
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitulo: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  modalSubtitulo: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  // ========================
  // INPUTS
  // ========================
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  toggleDesc: {
    ...typography.caption,
    marginTop: 2,
  },

  // ========================
  // BOTÕES
  // ========================
  botaoPrimario: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  botaoSecundario: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.4,
  },
  botaoPrimarioTexto: {
    ...typography.body,
    color: 'white',
    fontWeight: '600',
  },
  botaoSecundarioTexto: {
    ...typography.body,
    color: colors.textSecondary,
  },
  botaoAdicionar: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  botaoAdicionarTexto: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 13,
  },

  // ========================
  // SELETOR DE DIAS
  // ========================
  diasRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  diaBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  diaBtnAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diaBtnTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  diaBtnTextoAtivo: {
    color: 'white',
  },
  atalhoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  atalho: {
    flex: 1,
    padding: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
  },
  atalhoTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  // ========================
  // SELETOR DE FREQUÊNCIA
  // ========================
  frequenciaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  frequenciaOpcao: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  frequenciaAtiva: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequenciaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  frequenciaTextoAtivo: {
    color: 'white',
  },

  // ========================
  // FAB
  // ========================
  fab: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabTexto: {
    color: 'white',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },

  // ========================
  // ESTADO VAZIO
  // ========================
  vazio: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  vazioTexto: {
    ...typography.body,
    color: colors.textMuted,
  },
  vazioDica: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  // ========================
  // CHECKBOX
  // ========================
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxMarcado: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },

  // ========================
  // SEPARADOR
  // ========================
  divisor: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
})