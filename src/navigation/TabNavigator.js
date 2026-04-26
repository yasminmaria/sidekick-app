import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { colors } from '../theme'
import HomeScreen from '../screens/Home/HomeScreen'
import AgendaScreen from '../screens/Agenda/AgendaScreen'
import CuidadosScreen from '../screens/Cuidados/CuidadosScreen'
import PerfilScreen from '../screens/Perfil/PerfilScreen'
import ObjetivosNavigator from './ObjetivosNavigator'

const Tab = createBottomTabNavigator()

const icons = {
  Home: '🏠',
  Agenda: '📅',
  Objetivos: '🎯',
  Cuidados: '💊',
  Perfil: '⚡',
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
            {icons[route.name]}
          </Text>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={{
            fontSize: 11,
            color: focused ? colors.primaryDark : colors.textMuted,
            fontWeight: focused ? '600' : '400',
            marginBottom: 4,
          }}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Objetivos" component={ObjetivosNavigator} />
      <Tab.Screen name="Cuidados" component={CuidadosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  )
}