import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '@/lib/api'
import type { Batch } from '@/types'
import BatchStatusBadge from '@/components/batch/BatchStatusBadge'
import Spinner from '@/components/ui/Spinner'

export default function BatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get<{ verified: boolean; batch: Batch }>(`/verify/${id}`)
      .then((res) => { if (res.batch) setBatch(res.batch) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    )
  }

  if (!batch) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-6">
        <Text className="text-3xl mb-3">❌</Text>
        <Text className="text-lg font-inter-700 text-text-primary">Batch Not Found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-sm font-inter-600 text-brand">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const infoItems = [
    { label: 'Product', value: batch.productName },
    { label: 'Type', value: batch.productType === 'crop' ? 'Crop / Vegetable' : 'Aquatic' },
    { label: 'Quantity', value: `${batch.quantity} kg` },
    { label: 'Harvest Date', value: batch.harvestDate },
    { label: 'Farm Location', value: batch.farmLocation },
  ]

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-sm font-inter-600 text-brand">← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="rounded-xl border border-border bg-surface-light p-5 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-inter-700 text-text-primary">{batch.batchId}</Text>
            <BatchStatusBadge status={batch.status} />
          </View>
          <Text className="text-xs font-inter text-text-muted">{batch.farmerName}</Text>
        </View>

        {/* Info */}
        <View className="rounded-xl border border-border bg-surface-light p-5 mb-4">
          {infoItems.map((item) => (
            <View key={item.label} className="flex-row justify-between py-2 border-b border-border/50 last:border-b-0">
              <Text className="text-xs font-inter text-text-muted">{item.label}</Text>
              <Text className="text-sm font-inter-500 text-text-primary">{item.value || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Lab Result */}
        {batch.labResult && (
          <View className="rounded-xl border border-success/25 bg-success/5 p-5 mb-4">
            <Text className="text-sm font-inter-600 text-success mb-2">Lab Result</Text>
            <View className="flex-row items-center gap-2">
              <View className={`rounded-full px-3 py-1 ${
                batch.labResult === 'pass' ? 'bg-success/15' :
                batch.labResult === 'fail' ? 'bg-danger/15' : 'bg-warning/15'
              }`}>
                <Text className={`text-sm font-inter-700 ${
                  batch.labResult === 'pass' ? 'text-success' :
                  batch.labResult === 'fail' ? 'text-danger' : 'text-warning'
                }`}>
                  {batch.labResult.toUpperCase()}
                </Text>
              </View>
              {batch.assignedLabName && (
                <Text className="text-xs font-inter text-text-muted">by {batch.assignedLabName}</Text>
              )}
            </View>
            {batch.labNotes && (
              <Text className="text-xs font-inter text-text-secondary mt-2">{batch.labNotes}</Text>
            )}
          </View>
        )}

        {/* Hash */}
        {batch.sha256Hash && (
          <View className="rounded-xl border border-border bg-surface-light p-5 mb-4">
            <Text className="text-sm font-inter-600 text-text-secondary mb-2">SHA-256 Hash</Text>
            <Text className="text-xs font-mono text-success" selectable>{batch.sha256Hash}</Text>
          </View>
        )}

        {/* Blockchain */}
        {batch.txHash && (
          <View className="rounded-xl border border-chain/25 bg-chain/5 p-5 mb-4">
            <Text className="text-sm font-inter-600 text-chain mb-2">Blockchain Record</Text>
            <Text className="text-xs font-inter text-text-muted mb-1">Transaction Hash</Text>
            <Text className="text-xs font-mono text-text-primary mb-3" selectable>{batch.txHash}</Text>
            {batch.blockNumber && (
              <View className="mb-3">
                <Text className="text-xs font-inter text-text-muted">Block Number</Text>
                <Text className="text-sm font-inter-600 text-text-primary">{batch.blockNumber}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://testnet.bscscan.com/tx/${batch.txHash}`)}
              className="rounded-lg bg-chain/15 py-2.5 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-inter-600 text-chain">View on BscScan →</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  )
}
