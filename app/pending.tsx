import { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, RefreshControl, ScrollView } from 'react-native'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { logout, auth } from '@/lib/firebase'
import type { FarmerProfile } from '@/types'
import Spinner from '@/components/ui/Spinner'

export default function PendingScreen() {
  const { farmerStatus, farmerProfile, setFarmerProfile } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const uid = auth.currentUser?.uid
      if (uid) {
        const profile = await api.get<FarmerProfile>(`/farmers/${uid}`)
        setFarmerProfile(profile)
      }
    } catch { /* silent */ }
    setRefreshing(false)
  }, [])

  const isPending = farmerStatus === 'pending_approval'
  const isRejected = farmerStatus === 'rejected'

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00c896" />
      }
    >
      <View className="items-center">
        {/* Icon */}
        <View className={`h-20 w-20 rounded-full items-center justify-center mb-6 ${isPending ? 'bg-warning/15' : 'bg-danger/15'}`}>
          <Text className="text-4xl">{isPending ? '⏳' : '❌'}</Text>
        </View>

        <Text className="text-xl font-inter-700 text-text-primary text-center">
          {isPending ? 'Awaiting Approval' : 'Application Rejected'}
        </Text>

        <Text className="text-sm font-inter text-text-muted text-center mt-3 px-6">
          {isPending
            ? 'Your farmer registration is being reviewed by the ChainTrace admin team. This usually takes 1-2 business days.'
            : 'Your farmer registration was not approved.'}
        </Text>

        {isRejected && farmerProfile?.rejectedReason && (
          <View className="mt-4 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 w-full">
            <Text className="text-xs font-inter-500 text-text-muted mb-1">Reason</Text>
            <Text className="text-sm font-inter text-text-primary">{farmerProfile.rejectedReason}</Text>
          </View>
        )}

        {/* Pull to refresh hint */}
        <Text className="text-xs font-inter text-text-muted mt-8">Pull down to refresh status</Text>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          className="mt-6 rounded-xl border border-border px-6 py-3"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-inter-500 text-text-secondary">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
