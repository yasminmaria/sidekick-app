import { createStackNavigator } from '@react-navigation/stack'
import ObjetivosScreen from '../screens/Objetivos/ObjetivosScreen'
import ObjetivoDetalheScreen from '../screens/Objetivos/ObjetivosDetalheScreen'

const Stack = createStackNavigator()

export default function ObjetivosNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ObjetivosList" component={ObjetivosScreen} />
      <Stack.Screen name="ObjetivoDetalhe" component={ObjetivoDetalheScreen} />
    </Stack.Navigator>
  )
}