import React, { useEffect, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Svg, { Rect, Circle, Path } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
} from 'react-native-reanimated'
import { useThemeColors } from '../theme/ThemeContext'
import Icon from '../components/ui/Icon'
import HomeScreen from '../screens/Home/HomeScreen'
import AgendaScreen from '../screens/Agenda/AgendaScreen'
import CuidadosScreen from '../screens/Cuidados/CuidadosScreen'
import PerfilScreen from '../screens/Perfil/PerfilScreen'
import ObjetivosScreen from '../screens/Objetivos/ObjetivosScreen'

const Tab = createBottomTabNavigator()
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)

const TABS = {
  Agenda:    { icon: 'calendar', label: 'Agenda' },
  Objetivos: { icon: 'target', label: 'Metas' },
  Home:      { icon: 'home', label: 'Início' },
  Cuidados:  { icon: 'heartPulse', label: 'Cuidados' },
  Perfil:    { icon: 'smile', label: 'Perfil' },
}

const BAR_H = 64
const BUBBLE = 52
// LIFT = transparent zone above bar where the bubble's upper half sits
const LIFT = Math.ceil(BUBBLE / 2)        // ~18
// NOTCH_R = bubble radius + gap — the circular cutout is slightly larger than the bubble
const NOTCH_R = BUBBLE / 2 + 5           // 31
const VISIBLE_TABS = 5
// Icon top margin — pulled up vs center to leave room for the text label below
const INACTIVE_MT = LIFT + 2

const SPRING_CFG = { damping: 22, stiffness: 260, mass: 0.7 }

// Worklet: SVG path for the bar's top edge, curving into the circular notch at cx
function notchBorderPath(cx, w) {
  'worklet'
  const k = 0.5523 // cubic bezier factor to approximate a quarter-circle arc
  const y0 = LIFT
  const yD = LIFT + NOTCH_R
  return (
    `M 0 ${y0}` +
    ` L ${cx - NOTCH_R} ${y0}` +
    ` C ${cx - NOTCH_R} ${y0 + NOTCH_R * k} ${cx - NOTCH_R * k} ${yD} ${cx} ${yD}` +
    ` C ${cx + NOTCH_R * k} ${yD} ${cx + NOTCH_R} ${y0 + NOTCH_R * k} ${cx + NOTCH_R} ${y0}` +
    ` L ${w} ${y0}`
  )
}

function makeStyles(colors) {
  return StyleSheet.create({
    tabRow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
    },
    iconWrap: {
      marginTop: INACTIVE_MT,
      width: 44,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 20,
      opacity: 0.4,
    },
    iconHidden: {
      opacity: 0,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 1,
      letterSpacing: 0.1,
    },
    tabLabelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    iconActive: {
      fontSize: 22,
    },
    bubble: {
      position: 'absolute',
      top: 0,
      width: BUBBLE,
      height: BUBBLE,
      borderRadius: BUBBLE / 2,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.surfaceAlt,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  })
}

function CustomTabBar({ state, descriptors, navigation }) {
  const colors = useThemeColors()
  const styles = useMemo(() => makeStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()

  // Keep screen width accessible on the UI thread for worklets
  const svgWidth = useSharedValue(width)
  useEffect(() => { svgWidth.value = width }, [width])

  const tabWidth = width / VISIBLE_TABS
  const activeVisualIndex = Math.min(state.index, VISIBLE_TABS - 1)
  const targetCx = tabWidth * activeVisualIndex + tabWidth / 2

  const animCx = useSharedValue(targetCx)
  useEffect(() => {
    animCx.value = withSpring(targetCx, SPRING_CFG)
  }, [targetCx])

  // Bubble slides horizontally — center of bubble tracks animCx
  const bubbleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: animCx.value - BUBBLE / 2 }],
  }))

  // Notch circle follows the same animated cx
  const notchCircleProps = useAnimatedProps(() => ({
    cx: animCx.value,
  }))

  // Top-edge border follows the notch curve
  const notchBorderProps = useAnimatedProps(() => ({
    d: notchBorderPath(animCx.value, svgWidth.value),
  }))

  const activeTab = TABS[state.routes[state.index]?.name]

  return (
    <View style={{ height: LIFT + BAR_H + insets.bottom, backgroundColor: colors.background }}>

      {/* SVG layer: surface bar + animated notch hole + animated border */}
      <Svg
        width={width}
        height={LIFT + BAR_H + insets.bottom}
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents="none"
      >
        {/* Surface bar — starts at LIFT, extends through safe area */}
        <Rect
          x={0}
          y={LIFT}
          width={width}
          height={BAR_H + insets.bottom}
          fill={colors.surface}
        />

        {/* Animated circular notch — fill matches background to create cutout effect */}
        <AnimatedCircle
          cy={LIFT}
          r={NOTCH_R}
          fill={colors.background}
          animatedProps={notchCircleProps}
        />

        {/* Animated border following the notch curve */}
        <AnimatedPath
          fill="none"
          stroke={colors.border}
          strokeWidth={1}
          animatedProps={notchBorderProps}
        />
      </Svg>

      {/* Tab touch areas — invisible icons, full-height hit targets */}
      <View style={[styles.tabRow, { height: LIFT + BAR_H }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          if (options.tabBarButton) return null

          const tab = TABS[route.name]
          if (!tab) return null

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconWrap}>
                {/* Active icon is hidden here — shown inside the bubble instead */}
                {!isFocused && (
                  <Icon name={tab.icon} size={22} color={colors.textMuted} strokeWidth={2} />
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Animated teal bubble — floats at top of bar, slides between tabs */}
      <Animated.View
        style={[styles.bubble, bubbleAnimStyle]}
        pointerEvents="none"
      >
        {activeTab && <Icon name={activeTab.icon} size={24} color={colors.brightGreen} strokeWidth={2.2} />}
      </Animated.View>

    </View>
  )
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Objetivos" component={ObjetivosScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cuidados" component={CuidadosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  )
}

