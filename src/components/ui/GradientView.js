import { useRef } from 'react'
import { View } from 'react-native'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'

let gradCounter = 0

// Lightweight linear-gradient background using react-native-svg (no extra deps).
// Renders an absolute-fill gradient behind `children`. Apply borderRadius +
// overflow:'hidden' through `style` to clip the corners.
//
// direction: 'diagonal' (135deg, default) | 'vertical' (top→bottom) | 'horizontal'
export default function GradientView({
  colors = ['#0F6E56', '#14805F'],
  direction = 'diagonal',
  style,
  children,
  ...rest
}) {
  // Unique gradient id per instance — avoids <Defs> id collisions on Android.
  const id = useRef(`grad${++gradCounter}`).current

  const coords =
    direction === 'vertical'
      ? { x1: '0', y1: '0', x2: '0', y2: '1' }
      : direction === 'horizontal'
      ? { x1: '0', y1: '0', x2: '1', y2: '0' }
      : { x1: '0', y1: '0', x2: '1', y2: '1' }

  return (
    <View style={[{ overflow: 'hidden' }, style]} {...rest}>
      <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id={id} {...coords}>
            {colors.map((c, i) => (
              <Stop key={i} offset={`${i / (colors.length - 1)}`} stopColor={c} stopOpacity="1" />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  )
}
