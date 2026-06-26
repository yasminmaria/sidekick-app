import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from './src/store/useAppStore'
import { ThemeProvider, useTheme } from './src/theme/ThemeContext'
import TabNavigator from './src/navigation/TabNavigator'
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen'

function AppInner() {
  const { onboardingConcluido } = useAppStore()
  const { isDark } = useTheme()
  const [noApp, setNoApp] = useState(onboardingConcluido)

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