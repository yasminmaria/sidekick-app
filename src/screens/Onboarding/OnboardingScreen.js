import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppStore } from '../../store/useAppStore'

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  primary:      '#0F6E56',
  primaryDeep:  '#0B6450',
  primaryLight: '#E1F5EE',
  spring:       '#17E375',
  mint:         '#9FE1CB',
  tealBright:   '#1D9E75',
  canvas:       '#F4F7F4',
  surface:      '#FFFFFF',
  ink:          '#0E1A16',
  inkSoft:      '#15201B',
  secondary:    '#5C6A62',
  muted:        '#8A938C',
  border:       '#EBEEEB',
  sunken:       '#EEF1EE',
  amber:        '#EFA436',
  amberLight:   '#FAEEDA',
  amberText:    '#9A6312',
  pink:         '#D4537E',
  pinkLight:    '#FBEAF0',
}

// ─── Data ────────────────────────────────────────────────────────────────────
const FOCUS_GOALS = [
  'Foco nos estudos',
  'Organizar a rotina',
  'Cuidar da saúde',
  'Reduzir a ansiedade',
  'Manter hábitos',
]

const MOODS = [
  { emoji: '😄', label: 'Ótimo',     color: '#1D9E75', tint: '#E1F5EE' },
  { emoji: '🙂', label: 'Bem',       color: '#6FA53B', tint: '#EAF3DD' },
  { emoji: '😐', label: 'Neutro',    color: '#C98A1E', tint: '#FAEEDA' },
  { emoji: '😔', label: 'Pra baixo', color: '#D2733E', tint: '#FBEADD' },
  { emoji: '😣', label: 'Difícil',   color: '#C13E68', tint: '#FBEAF0' },
]

// Donut
const DONUT_R  = 42
const DONUT_C  = 2 * Math.PI * DONUT_R
const DONUT_OFFSET = DONUT_C * (1 - 0.65) // 65% progress

// ─── Main Component ──────────────────────────────────────────────────────────
export default function OnboardingScreen({ onConcluir }) {
  const { alterarNome, concluirOnboarding, registrarHumor } = useAppStore()
  const insets = useSafeAreaInsets()

  const [step, setStep]       = useState(0)
  const [nome, setNome]       = useState('')
  const [goalSel, setGoalSel] = useState(null)
  const [moodSel, setMoodSel] = useState(null)

  function proximo() {
    if (step < 3) {
      setStep(step + 1)
    } else {
      finalizar()
    }
  }

  function voltar() {
    if (step > 0) setStep(step - 1)
  }

  function pular() {
    finalizar()
  }

  function finalizar() {
    const nomeTrimmed = nome.trim()
    if (nomeTrimmed) alterarNome(nomeTrimmed)
    if (moodSel !== null) {
      const m = MOODS[moodSel]
      registrarHumor(m.emoji, moodSel + 1, '', 3, 3)
    }
    concluirOnboarding()
    onConcluir()
  }

  const isUltimo = step === 3

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header: dots + Pular ── */}
      <View style={styles.header}>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === step ? 24 : 7,
                  backgroundColor: i <= step ? C.primary : '#D9DFD9',
                },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={pular} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.pularText}>Pular</Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <Step0
              nome={nome}
              setNome={setNome}
            />
          )}
          {step === 1 && (
            <Step1
              goalSel={goalSel}
              setGoalSel={setGoalSel}
            />
          )}
          {step === 2 && <Step2 />}
          {step === 3 && (
            <Step3
              moodSel={moodSel}
              setMoodSel={setMoodSel}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom navigation ── */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={voltar} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.primaryBtn, { flex: 1 }]}
          onPress={proximo}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>
            {isUltimo ? 'Começar a usar 🌱' : 'Continuar →'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

// ─── Step 0: Boas-vindas + Nome ──────────────────────────────────────────────
function Step0({ nome, setNome }) {
  return (
    <View style={styles.stepContainer}>
      {/* Logo */}
      <LinearGradient
        colors={['#17E375', '#0B6450']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.logoGradient}
      >
        <Text style={styles.logoEmoji}>🌱</Text>
      </LinearGradient>

      {/* Eyebrow */}
      <Text style={styles.eyebrow}>SIDEKICK</Text>

      {/* Headline */}
      <Text style={styles.headline}>Seu companheiro{'\n'}pra cada dia</Text>

      {/* Body */}
      <Text style={styles.body}>
        Tarefas, metas, humor e remédios — num só lugar, leve e feito pro seu ritmo.
      </Text>

      {/* Name input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Como podemos te chamar?</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          placeholderTextColor={C.muted}
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </View>
  )
}

// ─── Step 1: Foco preview + Goal chips ───────────────────────────────────────
function Step1({ goalSel, setGoalSel }) {
  return (
    <View style={styles.stepContainerTop}>
      {/* Preview card */}
      <LinearGradient
        colors={['#0F6E56', '#14805F']}
        style={styles.previewGreen}
      >
        <View style={styles.previewGreenHeader}>
          <Text style={styles.previewGreenLabel}>Foco agora</Text>
          <Text style={styles.previewGreenCount}>2 restantes</Text>
        </View>

        {/* Focus task */}
        <View style={styles.focusTaskCard}>
          <View style={styles.focusTaskIcon}>
            <Text>📖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.focusTaskTitle}>Estudar para a prova</Text>
            <Text style={styles.focusTaskMeta}>Foco · 25 min</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>+30</Text>
          </View>
        </View>

        {/* Other tasks */}
        <View style={styles.taskListCard}>
          <View style={styles.taskListRow}>
            <View style={[styles.taskListIcon, { backgroundColor: C.primaryLight }]}>
              <Text style={{ fontSize: 14 }}>🏃</Text>
            </View>
            <Text style={styles.taskListTitle}>Fazer exercício</Text>
            <View style={styles.taskCheck} />
          </View>
          <View style={[styles.taskListRow, { borderTopWidth: 1, borderTopColor: C.sunken }]}>
            <View style={[styles.taskListIcon, { backgroundColor: C.pinkLight }]}>
              <Text style={{ fontSize: 14 }}>💊</Text>
            </View>
            <Text style={styles.taskListTitle}>Tomar remédio</Text>
            <View style={styles.taskCheck} />
          </View>
        </View>
      </LinearGradient>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>Comece o dia sabendo{'\n'}o que importa</Text>
        <Text style={styles.body}>
          Suas tarefas, remédios e compromissos organizados por hora — com um foco principal pra hoje.
        </Text>

        <Text style={styles.questionLabel}>No que você quer focar agora?</Text>
        <View style={styles.chipsRow}>
          {FOCUS_GOALS.map((label, i) => {
            const on = goalSel === i
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setGoalSel(on ? null : i)}
                style={[
                  styles.chip,
                  on
                    ? { backgroundColor: C.primary, borderColor: C.primary }
                    : { backgroundColor: C.surface, borderColor: '#E0E5E0' },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: on ? '#fff' : C.inkSoft }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )
}

// ─── Step 2: Metas donut preview ─────────────────────────────────────────────
function Step2() {
  return (
    <View style={styles.stepContainerTop}>
      {/* Preview card */}
      <LinearGradient
        colors={['#163A2E', '#0E1A16']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.previewDark}
      >
        <View style={styles.donutRow}>
          {/* SVG Donut */}
          <View style={styles.donutWrap}>
            <Svg width={84} height={84} style={{ transform: [{ rotate: '-90deg' }] }}>
              <Circle cx={42} cy={42} r={DONUT_R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={9} />
              <Circle
                cx={42} cy={42} r={DONUT_R}
                fill="none"
                stroke={C.spring}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={DONUT_C}
                strokeDashoffset={DONUT_OFFSET}
              />
            </Svg>
            <View style={styles.donutCenter}>
              <Text style={styles.donutPct}>65%</Text>
            </View>
          </View>

          {/* Companion text */}
          <View style={{ flex: 1 }}>
            <Text style={styles.darkCardTitle}>Você está indo bem 🌿</Text>
            <Text style={styles.darkCardSub}>3 metas ativas, divididas em passos pequenos.</Text>
          </View>
        </View>

        {/* Goal bars */}
        <View style={{ marginTop: 18, gap: 12 }}>
          <GoalBar label="Organizar a casa" pct={0.67} />
          <GoalBar label="Criar uma nova rotina" pct={0.50} />
        </View>
      </LinearGradient>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>Metas grandes,{'\n'}em passos pequenos</Text>
        <Text style={styles.body}>
          Quebre cada objetivo em etapas e veja seu progresso crescer — sem peso, no seu tempo.
        </Text>
      </View>
    </View>
  )
}

function GoalBar({ label, pct }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 11.5, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>{label}</Text>
        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#fff' }}>{Math.round(pct * 100)}%</Text>
      </View>
      <View style={{ height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.16)' }}>
        <View style={{ height: 6, borderRadius: 99, width: `${pct * 100}%`, backgroundColor: '#5DCAA5' }} />
      </View>
    </View>
  )
}

// ─── Step 3: Cuidados preview + Humor ────────────────────────────────────────
function Step3({ moodSel, setMoodSel }) {
  return (
    <View style={styles.stepContainerTop}>
      {/* Preview card */}
      <View style={styles.previewWhite}>
        <View style={styles.habitRow}>
          <View style={[styles.habitIcon, { backgroundColor: C.primaryLight }]}>
            <Text style={{ fontSize: 16 }}>💧</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.habitTitle}>Beber água</Text>
            <Text style={styles.habitMeta}>5/8 copos</Text>
          </View>
          <Text style={[styles.habitCount, { color: C.primary }]}>5</Text>
        </View>

        <View style={[styles.habitRow, { borderTopWidth: 1, borderTopColor: C.sunken, paddingTop: 12 }]}>
          <View style={[styles.habitIcon, { backgroundColor: C.amberLight }]}>
            <Text style={{ fontSize: 16 }}>🧘</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.habitTitle}>Meditar</Text>
            <Text style={styles.habitMeta}>Todos os dias</Text>
          </View>
          <View style={styles.habitCheckDone}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>✓</Text>
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>Cuide da sua mente{'\n'}e do corpo</Text>
        <Text style={styles.body}>
          Hábitos, remédios e check-ins de humor. Que tal começar agora?
        </Text>

        <Text style={styles.questionLabel}>Como você está se sentindo?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m, i) => {
            const on = moodSel === i
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setMoodSel(on ? null : i)}
                style={[
                  styles.moodBtn,
                  {
                    borderColor: on ? m.color : C.sunken,
                    backgroundColor: on ? m.tint : '#F7F9F7',
                    transform: [{ scale: on ? 1.06 : 1 }],
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 24, lineHeight: 28 }}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, { color: on ? m.color : C.muted }]}>{m.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.canvas,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 99,
  },
  pularText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: C.muted,
  },

  // Step containers
  stepContainer: {
    paddingHorizontal: 28,
    paddingTop: 28,
    alignItems: 'center',
  },
  stepContainerTop: {
    paddingTop: 6,
  },

  // Step 0
  logoGradient: {
    width: 96,
    height: 96,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    shadowColor: '#0F6E56',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.34,
    shadowRadius: 22,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 44,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.tealBright,
    marginBottom: 11,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.6,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 14.5,
    fontWeight: '500',
    color: C.secondary,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 4,
  },
  inputGroup: {
    width: '100%',
    marginTop: 28,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: C.inkSoft,
    letterSpacing: 0.2,
    marginBottom: 9,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: '#E0E5E0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15.5,
    fontWeight: '600',
    color: C.inkSoft,
  },

  // Shared text block
  textBlock: {
    paddingHorizontal: 26,
    paddingTop: 22,
    alignItems: 'center',
  },

  // Step 1 — green preview
  previewGreen: {
    marginHorizontal: 22,
    borderRadius: 26,
    padding: 17,
    shadowColor: '#0F6E56',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 10,
  },
  previewGreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewGreenLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  previewGreenCount: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  focusTaskCard: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  focusTaskIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusTaskTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#fff',
  },
  focusTaskMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  xpPill: {
    backgroundColor: 'rgba(23,227,117,0.18)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5DE39B',
  },
  taskListCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 8,
    marginTop: 9,
    gap: 0,
  },
  taskListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  taskListIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskListTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: C.inkSoft,
  },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#DCE2DD',
  },

  // Chips
  questionLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: C.inkSoft,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 11,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignSelf: 'flex-start',
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 99,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Step 2 — dark preview
  previewDark: {
    marginHorizontal: 22,
    borderRadius: 26,
    padding: 20,
    shadowColor: '#0E1A16',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  donutWrap: {
    width: 84,
    height: 84,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPct: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  darkCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  darkCardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },

  // Step 3 — white preview
  previewWhite: {
    marginHorizontal: 22,
    borderRadius: 26,
    padding: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0E1A16',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  habitIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: C.inkSoft,
  },
  habitMeta: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  habitCount: {
    fontSize: 13,
    fontWeight: '800',
  },
  habitCheckDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mood
  moodRow: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'stretch',
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 3,
    borderRadius: 16,
    borderWidth: 2,
  },
  moodLabel: {
    fontSize: 9.5,
    fontWeight: '700',
  },

  // Bottom navigation
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0E5E0',
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: C.muted,
  },
  primaryBtn: {
    backgroundColor: C.spring,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.spring,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: C.ink,
  },
})
