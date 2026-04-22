import React, { useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import {
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'

export default function ObjetivoBottomSheet({
  objetivo,
  abrir,
  onClose,
}) {
  const modalRef = useRef(null)

  const snapPoints = useMemo(() => ['72%', '92%'], [])

  useEffect(() => {
    if (abrir && objetivo) {
      modalRef.current?.present()
    } else {
      modalRef.current?.dismiss()
    }
  }, [abrir, objetivo])

  if (!objetivo) return null

  const tarefas = objetivo.tarefas || [
    'Definir roadmap',
    'Executar próximas tarefas',
    'Revisar progresso semanal',
    'Finalizar meta atual',
  ]

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {objetivo.prazo}
              </Text>
            </View>

            <Text style={styles.titulo}>
              {objetivo.titulo}
            </Text>

            <Text style={styles.subtitulo}>
              Continue avançando todos os dias 🚀
            </Text>
          </View>

          {/* PROGRESSO */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>
                Progresso atual
              </Text>

              <Text style={styles.percent}>
                {objetivo.progresso}%
              </Text>
            </View>

            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${objetivo.progresso}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.metaInfo}>
              {objetivo.concluidas || 0}/
              {objetivo.total || 10} etapas concluídas
            </Text>
          </View>

          {/* STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>+120</Text>
              <Text style={styles.statLabel}>XP ganho</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Dias foco</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
          </View>

          {/* CHECKLIST */}
          <Text style={styles.sectionTitle}>
            Próximas tarefas
          </Text>

          {tarefas.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.task}
              activeOpacity={0.8}
            >
              <View style={styles.checkbox} />

              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>
                  {item}
                </Text>

                <Text style={styles.taskSub}>
                  Toque para concluir
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* AÇÕES */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>
                Editar meta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryText}>
                Concluir etapa
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  indicator: {
    backgroundColor: '#D1D5DB',
    width: 52,
  },

  scroll: {
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 22,
  },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },

  badgeText: {
    color: '#6D5DF6',
    fontWeight: '700',
    fontSize: 13,
  },

  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
  },

  subtitulo: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 14,
  },

  card: {
    backgroundColor: '#F8F9FC',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  percent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6D5DF6',
  },

  progressBg: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  progressFill: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#6D5DF6',
  },

  metaInfo: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 14,
  },

  task: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C7CAD1',
    marginRight: 12,
  },

  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },

  taskSub: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  secondaryBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },

  secondaryText: {
    fontWeight: '700',
    color: '#111111',
  },

  primaryBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: '#6D5DF6',
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
})