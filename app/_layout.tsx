import { useEffect, useState } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { onAuthChange } from '@/lib/firebase'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { registerForPushNotifications, addNotificationResponseListener } from '@/lib/notifications'
import type { AppUser, FarmerProfile } from '@/types'
import '../global.css'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  const router = useRouter()
  const segments = useSegments()
  const { user, farmerStatus, loading, setUser, setFarmerProfile, setLoading } = useAuthStore()
  const [authReady, setAuthReady] = useState(false)

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from backend
          const profile = await api.get<AppUser>('/auth/me')
          setUser(profile)

          // If farmer, fetch farmer profile
          if (profile.role === 'farmer') {
            try {
              const farmerProfile = await api.get<FarmerProfile>(`/farmers/${firebaseUser.uid}`)
              setFarmerProfile(farmerProfile)
            } catch {
              setFarmerProfile(null)
            }
          }
        } catch {
          setUser(null)
          setFarmerProfile(null)
        }
      } else {
        setUser(null)
        setFarmerProfile(null)
      }
      setLoading(false)
      setAuthReady(true)
    })
    return unsubscribe
  }, [])

  // Register push notifications when user is logged in
  useEffect(() => {
    if (user?.uid) {
      registerForPushNotifications(user.uid)
    }
  }, [user?.uid])

  // Handle notification taps — navigate to relevant screen
  useEffect(() => {
    const sub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data
      if (data?.batchId) {
        router.push(`/(app)/batch/${data.batchId}`)
      } else if (data?.screen === 'iot') {
        router.push('/(app)/iot')
      } else if (data?.screen === 'notifications') {
        router.push('/(app)/notifications')
      }
    })
    return () => sub.remove()
  }, [])

  // Navigation guard
  useEffect(() => {
    if (!authReady || !fontsLoaded) return

    const inAppGroup = segments[0] === '(app)'

    if (!user) {
      // Not logged in → go to login
      if (inAppGroup) router.replace('/')
    } else if (user.role === 'farmer') {
      if (!farmerStatus) {
        // No farmer profile → go to onboarding
        if (inAppGroup) router.replace('/onboarding')
      } else if (farmerStatus === 'pending_approval' || farmerStatus === 'rejected') {
        // Pending/rejected → go to pending screen
        if (inAppGroup) router.replace('/pending')
      }
      // approved → allow access to (app) group
    }
  }, [user, farmerStatus, authReady, fontsLoaded, segments])

  // Hide splash when ready
  useEffect(() => {
    if (fontsLoaded && authReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, authReady])

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0d1117', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00c896" />
        <StatusBar style="light" />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  )
}
