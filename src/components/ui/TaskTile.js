import { Text, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useRef, useEffect, useMemo } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  interpolateColor,
  Easing,
  ReduceMotion,
  useReducedMotion,
  FadeOut,
} from 'react-native-reanimated'
import Icon from './Icon'
import { radii } from '../../theme'
import { useThemeColors } from '../../theme/ThemeContext'

// A task row that plays its completion reward (check fill + "+XP" float + pop)
// before the parent removes it from the pending list. The actual store toggle
// (onComplete) fires after the celebration so the user sees the payoff land.
// Reduced-motion: skips the float/pop and completes near-instantly.
const CELEBRATE_MS = 560

export default function TaskTile({ tarefa, tintBg, tintFg, icon, tag, meta, onComplete, onLongPress }) {
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const reduced = useReducedMotion()
  const completing = useRef(false)
  const timer = useRef(null)

  const fill = useSharedValue(0)        // 0 = empty checkbox, 1 = filled green
  const checkScale = useSharedValue(0)  // checkmark pop
  const pop = useSharedValue(1)         // whole-tile press pop
  const xpY = useSharedValue(0)
  const xpOpacity = useSharedValue(0)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function handlePress() {
    if (completing.current) return
    completing.current = true

    if (reduced) {
      fill.value = withTiming(1, { duration: 90, reduceMotion: ReduceMotion.System })
      checkScale.value = withTiming(1, { duration: 90, reduceMotion: ReduceMotion.System })
      timer.current = setTimeout(onComplete, 130)
      return
    }

    pop.value = withSequence(
      withTiming(1.03, { duration: 90, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 13, stiffness: 320, mass: 0.5 })
    )
    fill.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
    checkScale.value = withDelay(60, withSpring(1, { damping: 10, stiffness: 430, mass: 0.3 }))

    xpY.value = 0
    xpOpacity.value = 0
    xpY.value = withTiming(-34, { duration: 780, easing: Easing.out(Easing.quad) })
    xpOpacity.value = withSequence(
      withTiming(1, { duration: 90 }),
      withDelay(300, withTiming(0, { duration: 380 }))
    )

    timer.current = setTimeout(onComplete, CELEBRATE_MS)
  }

  const tileStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }))
  const checkStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fill.value, [0, 1], ['rgba(255,255,255,0)', colors.primary]),
    borderColor: interpolateColor(fill.value, [0, 1], [colors.checkBorder, colors.primary]),
  }))
  const checkMarkStyle = useAnimatedStyle(() => ({
    opacity: checkScale.value,
    transform: [{ scale: checkScale.value }],
  }))
  const xpStyle = useAnimatedStyle(() => ({
    opacity: xpOpacity.value,
    transform: [{ translateY: xpY.value }],
  }))

  return (
    <Animated.View exiting={reduced ? undefined : FadeOut.duration(160).reduceMotion(ReduceMotion.System)} style={tileStyle}>
      <TouchableOpacity
        style={styles.tile}
        activeOpacity={0.85}
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={400}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
        accessibilityLabel={`${tarefa.titulo}. Pendente. ${tag}, ${meta}. Toque para concluir.`}
      >
        <View style={[styles.tileIcon, { backgroundColor: tintBg }]}>
          <Icon name={icon} size={20} color={tintFg} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.tileTitulo} numberOfLines={1}>{tarefa.titulo}</Text>
          <Text style={styles.tileMeta} numberOfLines={1}>{tag} · {meta}</Text>
        </View>
        <View style={styles.checkWrap}>
          <Animated.View style={[styles.tileCheck, checkStyle]}>
            <Animated.View style={checkMarkStyle}>
              <Icon name="check" size={15} color="#fff" strokeWidth={3} />
            </Animated.View>
          </Animated.View>
          <Animated.Text style={[styles.xpFloat, xpStyle]}>+{tarefa.xp}</Animated.Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

function makeStyles(colors) {
  return StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 10,
  },
  tileIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileTitulo: { fontSize: 14.5, fontWeight: '700', color: colors.textStrong, letterSpacing: -0.2 },
  tileMeta: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginTop: 2 },
  checkWrap: { width: 26, alignItems: 'center', justifyContent: 'center' },
  tileCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpFloat: {
    position: 'absolute',
    top: -4,
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  })
}
