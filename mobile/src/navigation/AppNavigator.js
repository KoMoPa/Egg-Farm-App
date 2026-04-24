import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'

import { SupabaseProvider } from '../contexts/SupabaseContext'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { FarmProvider } from '../contexts/FarmContext'

import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import Form07Screen from '../screens/Form07Screen'
import Form08Screen from '../screens/Form08Screen'
import Form09Screen from '../screens/Form09Screen'
import Form10Screen from '../screens/Form10Screen'
import ReportsScreen from '../screens/ReportsScreen'

const Tab = createBottomTabNavigator()

function tabIcon(routeName, focused) {
  const icons = {
    Home: '🏠',
    'Form 07': '🥚',
    'Form 08': '🐔',
    'Form 09': '🌾',
    'Form 10': '🐀',
    Reports: '📋',
  }
  return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[routeName] || '📄'}</Text>
}

function AppTabs() {
  const { user } = useAuth()

  if (!user) return <LoginScreen />

  return (
    <FarmProvider user={user}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => tabIcon(route.name, focused),
          tabBarActiveTintColor: '#0066cc',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { paddingBottom: 4, height: 60 },
          tabBarLabelStyle: { fontSize: 11 },
          headerStyle: { backgroundColor: '#0066cc' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Farm & Barns' }} />
        <Tab.Screen name="Form 07" component={Form07Screen} options={{ title: 'Production' }} />
        <Tab.Screen name="Form 08" component={Form08Screen} options={{ title: 'Welfare' }} />
        <Tab.Screen name="Form 09" component={Form09Screen} options={{ title: 'Feed/Water' }} />
        <Tab.Screen name="Form 10" component={Form10Screen} options={{ title: 'Pest Control' }} />
        <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      </Tab.Navigator>
    </FarmProvider>
  )
}

export default function AppNavigator() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
      </AuthProvider>
    </SupabaseProvider>
  )
}
