import { useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/authStore'
import { useBatchStore } from '@/store/batchStore'
import Spinner from '@/components/ui/Spinner'

export default function DashboardScreen() {
  const router = useRouter()
  const { user, farmerProfile } = useAuthStore()
  const { batches, loading, fetchBatches } = useBatchStore()

  useEffect(() => {
    fetchBatches()
  }, [])

  const totalBatches = batches.length
  const registered = batches.filter((b) => b.status === 'registered').length
  const labUploaded = batches.filter((b) => b.status === 'lab_uploaded').length
  const onChain = batches.filter((b) => b.status === 'on_chain').length

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-sm font-inter text-text-muted">Welcome back,</Text>
          <Text className="text-xl font-inter-700 text-text-primary">
            {farmerProfile?.name || user?.displayName || 'Farmer'}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[
            { label: 'Total Batches', value: totalBatches, color: 'text-text-primary' },
            { label: 'Registered', value: registered, color: 'text-warning' },
            { label: 'Lab Uploaded', value: labUploaded, color: 'text-success' },
            { label: 'On-Chain', value: onChain, color: 'text-chain' },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 min-w-[45%] rounded-xl border border-border bg-surface-light p-4">
              <Text className="text-xs font-inter text-text-muted">{stat.label}</Text>
              {loading ? (
                <Spinner size="small" />
              ) : (
                <Text className={`text-2xl font-inter-700 mt-1 ${stat.color}`}>{stat.value}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text className="text-sm font-inter-600 text-text-secondary mb-3">Quick Actions</Text>
        <View className="gap-3 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/(app)/register-batch')}
            className="rounded-xl bg-brand py-4 px-5 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-base font-inter-600 text-surface">+ Register New Batch</Text>
          </TouchableOpacity>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(app)/batches')}
              className="flex-1 rounded-xl border border-border bg-surface-light py-3.5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-2xl mb-1">📦</Text>
              <Text className="text-xs font-inter-500 text-text-secondary">My Batches</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(app)/iot')}
              className="flex-1 rounded-xl border border-border bg-surface-light py-3.5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-2xl mb-1">📡</Text>
              <Text className="text-xs font-inter-500 text-text-secondary">IoT Monitor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(app)/notifications')}
              className="flex-1 rounded-xl border border-border bg-surface-light py-3.5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-2xl mb-1">🔔</Text>
              <Text className="text-xs font-inter-500 text-text-secondary">Alerts</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/irrigation')}
            className="rounded-xl border border-brand/25 bg-brand/5 py-3.5 flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <Text className="text-lg">💧</Text>
            <Text className="text-sm font-inter-500 text-brand">Irrigation Control</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Batches */}
        <Text className="text-sm font-inter-600 text-text-secondary mb-3">Recent Batches</Text>
        {loading ? (
          <View className="py-8 items-center"><Spinner size="large" /></View>
        ) : batches.length === 0 ? (
          <View className="rounded-xl border border-border bg-surface-light py-10 items-center">
            <Text className="text-3xl mb-2">📋</Text>
            <Text className="text-sm font-inter text-text-muted">No batches yet</Text>
            <Text className="text-xs font-inter text-text-muted mt-1">Register your first batch to get started</Text>
          </View>
        ) : (
          <View className="gap-2 pb-6">
            {batches.slice(0, 5).map((batch) => (
              <TouchableOpacity
                key={batch.batchId}
                onPress={() => router.push(`/(app)/batch/${batch.batchId}`)}
                className="rounded-xl border border-border bg-surface-light px-4 py-3 flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className="text-sm font-inter-600 text-text-primary">{batch.batchId}</Text>
                  <Text className="text-xs font-inter text-text-muted mt-0.5">
                    {batch.productName} · {batch.quantity} kg
                  </Text>
                </View>
                <View className={`rounded-full px-2.5 py-1 ${
                  batch.status === 'on_chain' ? 'bg-chain/15' :
                  batch.status === 'lab_uploaded' ? 'bg-success/15' : 'bg-warning/15'
                }`}>
                  <Text className={`text-[10px] font-inter-600 ${
                    batch.status === 'on_chain' ? 'text-chain' :
                    batch.status === 'lab_uploaded' ? 'text-success' : 'text-warning'
                  }`}>
                    {batch.status === 'on_chain' ? 'On-Chain' :
                     batch.status === 'lab_uploaded' ? 'Lab Done' : 'Registered'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
