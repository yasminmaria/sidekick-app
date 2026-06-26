import { LinearGradient } from 'expo-linear-gradient'

// Linear-gradient background via expo-linear-gradient (bundled in Expo Go).
// It fills its own bounds natively, so there's no percentage-sizing fragility.
// Apply borderRadius/padding/flex through `style`; children render on top.
//
// direction: 'diagonal' (135deg, default) | 'vertical' (top→bottom) | 'horizontal'
export default function GradientView({
  colors = ['#0F6E56', '#14805F'],
  direction = 'diagonal',
  style,
  children,
  ...rest
}) {
  const start = { x: 0, y: 0 }
  const end =
    direction === 'vertical'
      ? { x: 0, y: 1 }
      : direction === 'horizontal'
      ? { x: 1, y: 0 }
      : { x: 1, y: 1 }

  return (
    <LinearGradient colors={colors} start={start} end={end} style={[{ overflow: 'hidden' }, style]} {...rest}>
      {children}
    </LinearGradient>
  )
}
