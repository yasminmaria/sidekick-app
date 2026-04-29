import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import TabNavigator from './src/navigation/TabNavigator'
import { useSafeAreaInsets, SafeAreaProvider  } from 'react-native-safe-area-context';


export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar backgroundColor="transparent" style="light" translucent />
             <TabNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}