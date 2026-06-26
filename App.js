import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { AppState } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import { useAppStore } from './src/store/useAppStore'
import { ThemeProvider, useTheme } from './src/theme/ThemeContext'
import TabNavigator from './src/navigation/TabNavigator'
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen'

function AppInner() {
  const { onboardingConcluido } = useAppStore()
  const { isDark } = useTheme()
  const [noApp, setNoApp] = useState(onboardingConcluido)

  // Reset diário do status (tarefas/hábitos/remédios) + streak. A ação é
  // idempotente (só age 1x por data), então é seguro chamá-la várias vezes.
  // Disparos: ao reidratar o estado, ao voltar do background, e por um timer
  // que aponta exatamente para a próxima meia-noite enquanto o app está aberto.
  useEffect(() => {
    const run = () => useAppStore.getState().verificarDiaNovo()

    let midnightTimer = null
    const armarMeiaNoite = () => {
      if (midnightTimer) clearTimeout(midnightTimer)
      const agora = new Date()
      const proxima = new Date(agora)
      proxima.setHours(24, 0, 5, 0) // 00:00:05 do dia seguinte (margem de segurança)
      midnightTimer = setTimeout(() => { run(); armarMeiaNoite() }, proxima - agora)
    }

    if (useAppStore.persist.hasHydrated()) run()
    const unsubHydrate = useAppStore.persist.onFinishHydration(run)
    armarMeiaNoite()

    const sub = AppState.addEventListener('change', estado => {
      // Ao voltar do foreground, reseta e re-arma o timer (timers podem ser
      // pausados em background, então re-armar garante o próximo disparo certo).
      if (estado === 'active') { run(); armarMeiaNoite() }
    })

    return () => {
      unsubHydrate?.()
      sub.remove()
      if (midnightTimer) clearTimeout(midnightTimer)
    }
  }, [])

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar backgroundColor="transparent" style={isDark ? 'light' : 'dark'} translucent />

        {!noApp && (
          <OnboardingScreen onConcluir={() => setNoApp(true)} />
        )}

        {noApp && (
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        )}

      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}