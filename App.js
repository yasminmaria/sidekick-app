import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useState } from 'react'
import { useAppStore } from './src/store/useAppStore'
import TabNavigator from './src/navigation/TabNavigator'
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen'
import ConfiguracaoScreen from './src/screens/Onboarding/ConfiguracaoScreen'

export default function App() {
  const { onboardingConcluido, concluirOnboarding, alterarNome } = useAppStore()
  const [etapaApp, setEtapaApp] = useState(
    onboardingConcluido ? 'app' : 'onboarding'
  )

  // Usuário pulou tudo — só salva nome padrão e entra
  function pularTudo() {
    concluirOnboarding()
    setEtapaApp('app')
  }

  // Concluiu os slides — vai para configuração
  function concluiuSlides() {
    setEtapaApp('configuracao')
  }

  // Concluiu a configuração — entra no app
  function concluiuConfiguracao() {
    setEtapaApp('app')
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar backgroundColor="transparent" style="light" translucent />

        {etapaApp === 'onboarding' && (
          <OnboardingScreen
            onConcluir={concluiuSlides}
            onPular={pularTudo}
          />
        )}

        {etapaApp === 'configuracao' && (
          <ConfiguracaoScreen
            onConcluir={concluiuConfiguracao}
          />
        )}

        {etapaApp === 'app' && (
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        )}

      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}