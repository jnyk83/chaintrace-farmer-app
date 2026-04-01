import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, RefreshControl, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBatchStore } from '@/store/batchStore'
import BatchStatusBadge from '@/components/batch/BatchStatusBadge'
import Spinner from '@/components/ui/Spinner'
import type { Batch, BatchStatus } from '@/types'

const TABS: { key: 'all' | BatchStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'registered', label: 'Registered' },
  { key: 'lab_uploaded', label: 'Lab Done' },
  { key: 'on_chain', label: 'On-Chain' },
]

export default function BatchesScreen() {
  const router = useRouter()
  const { batches, loading, fetchBatches } = useBatchStore()
  const [tab, setTab] = useState<'all' | BatchStatus>('all')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchBatches() }, [])

  const filtered = batches.filter((b) => {
    if (tab !== 'all' && b.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      return b.batchId.toLowerCase().includes(q) || b.productName.toLowerCase().includes(q)
    }
    return true
  })

  const renderBatch = ({ item }: { item: Batch }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/batch/${item.batchId}`)}
      className="rounded-xl border border-border bg-surface-light px-4 py-3 mb-2"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-inter-600 text-text-primary">{item.batchId}</Text>
        <BatchStatusBadge status={item.status} />
      </View>
      <Text className="text-xs font-inter text-text-muted">
        {item.productName} · {item.quantity} kg · {item.harvestDate}
      </Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xl font-inter-700 text-text-primary mb-4">My Batches</Text>

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search batch ID or product..."
          placeholderTextColor="#475569"
          className="rounded-xl border border-border bg-surface-light px-4 py-3 text-sm text-text-primary font-inter mb-3"
        />

        {/* Tabs */}
        <View className="flex-row gap-2 mb-2">
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              className={`rounded-full px-3.5 py-2 ${tab === t.key ? 'bg-brand' : 'bg-surface-light border border-border'}`}
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-inter-600 ${tab === t.key ? 'text-surface' : 'text-text-muted'}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && batches.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.batchId}
          renderItem={renderBatch}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchBatches} tintColor="#00c896" />
          }
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Text className="text-3xl mb-2">📋</Text>
              <Text className="text-sm font-inter text-text-muted">No batches found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
