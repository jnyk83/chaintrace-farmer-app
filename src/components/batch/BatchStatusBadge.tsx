import { View, Text } from 'react-native'
import type { BatchStatus } from '@/types'

const config: Record<BatchStatus, { label: string; bg: string; text: string }> = {
  registered: { label: 'Registered', bg: 'bg-warning/15', text: 'text-warning' },
  lab_uploaded: { label: 'Lab Uploaded', bg: 'bg-success/15', text: 'text-success' },
  on_chain: { label: 'On-Chain', bg: 'bg-chain/15', text: 'text-chain' },
}

export default function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const c = config[status] ?? config.registered
  return (
    <View className={`rounded-full px-3 py-1 ${c.bg}`}>
      <Text className={`text-xs font-inter-600 ${c.text}`}>{c.label}</Text>
    </View>
  )
}
