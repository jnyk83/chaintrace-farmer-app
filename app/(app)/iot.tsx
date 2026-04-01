import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBatchStore } from '@/store/batchStore'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'
import type { Batch, IoTTemplate } from '@/types'

export default function IoTScreen() {
  const router = useRouter()
  const { batches, loading: batchLoading, fetchBatches } = useBatchStore()
  const [templates, setTemplates] = useState<Record<string, IoTTemplate>>({})

  useEffect(() => {
    fetchBatches()
    api.get<Record<string, IoTTemplate>>('/iot/templates')
      .then(setTemplates)
      .catch(() => {})
  }, [])

  // Map product to template
  const getTemplate = (productName: string): string => {
    const name = productName.toLowerCase()
    const aquatic = ['tilapia', 'catfish', 'prawn', 'red snapper', 'grouper', 'seabass', 'crab']
    const leafy = ['kangkung', 'lettuce', 'spinach', 'cabbage']
    if (['chili', 'bell pepper', 'tomato', 'eggplant'].includes(name)) return 'chili'
    if (leafy.includes(name)) return 'leafy'
    if (aquatic.includes(name)) return 'freshwater'
    return 'chili'
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-xl font-inter-700 text-text-primary mb-2">IoT Monitoring</Text>
        <Text className="text-sm font-inter text-text-muted mb-5">
          Select a batch to view real-time sensor data
        </Text>

        {batchLoading ? (
          <View className="py-16 items-center"><Spinner size="large" /></View>
        ) : batches.length === 0 ? (
          <View className="rounded-xl border border-border bg-surface-light py-16 items-center">
            <Text className="text-3xl mb-2">📡</Text>
            <Text className="text-sm font-inter text-text-muted">No batches to monitor</Text>
          </View>
        ) : (
          <View className="gap-3 pb-6">
            {batches.map((batch) => {
              const templateKey = getTemplate(batch.productName)
              const template = templates[templateKey]
              return (
                <TouchableOpacity
                  key={batch.batchId}
                  onPress={() => router.push(`/(app)/iot/${batch.batchId}`)}
                  className="rounded-xl border border-border bg-surface-light p-4"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-inter-600 text-text-primary">{batch.batchId}</Text>
                    <View className="rounded-full bg-brand/15 px-2.5 py-1">
                      <Text className="text-[10px] font-inter-600 text-brand">
                        {template?.name || templateKey}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs font-inter text-text-muted">
                    {batch.productName} · {batch.quantity} kg
                  </Text>
                  {template && (
                    <View className="flex-row flex-wrap gap-1.5 mt-2">
                      {template.sensors.map((s) => (
                        <View key={s.key} className="rounded bg-surface px-2 py-0.5">
                          <Text className="text-[10px] font-inter text-text-muted">{s.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
