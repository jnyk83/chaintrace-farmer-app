import { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Notification {
  id: string
  title: string
  message: string
  type: 'alert' | 'info' | 'success'
  timestamp: string
  read: boolean
}

// Demo notifications (will be replaced by real push notifications)
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Soil Temperature Alert',
    message: 'Batch VG-20260401-1234: Soil temperature exceeded 35°C threshold',
    type: 'alert',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: '2',
    title: 'Lab Report Uploaded',
    message: 'SGS Malaysia has uploaded the lab report for batch VG-20260328-5678',
    type: 'success',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false,
  },
  {
    id: '3',
    title: 'Batch On-Chain',
    message: 'Batch VG-20260325-9012 has been stored on BSC blockchain',
    type: 'success',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
  {
    id: '4',
    title: 'Irrigation Suggestion',
    message: 'Soil moisture dropped below 30%. Consider starting irrigation for your chili plot.',
    type: 'info',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    read: true,
  },
]

const typeConfig = {
  alert: { icon: '🔴', bg: 'bg-danger/10', border: 'border-danger/25' },
  info: { icon: '🔵', bg: 'bg-brand/10', border: 'border-brand/25' },
  success: { icon: '🟢', bg: 'bg-success/10', border: 'border-success/25' },
}

export default function NotificationsScreen() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = typeConfig[item.type]
    return (
      <View className={`rounded-xl border ${config.border} ${config.bg} p-4 mb-2 ${!item.read ? '' : 'opacity-60'}`}>
        <View className="flex-row items-start gap-3">
          <Text className="text-lg">{config.icon}</Text>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-inter-600 text-text-primary flex-1">{item.title}</Text>
              {!item.read && <View className="h-2 w-2 rounded-full bg-brand" />}
            </View>
            <Text className="text-xs font-inter text-text-secondary mt-1">{item.message}</Text>
            <Text className="text-[10px] font-inter text-text-muted mt-2">{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <TouchableOpacity onPress={() => router.back()} className="mb-2">
            <Text className="text-sm font-inter-600 text-brand">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-inter-700 text-text-primary">Notifications</Text>
          <Text className="text-[10px] font-inter text-text-muted mt-0.5">Sample alerts · real-time push notifications are enabled on this device</Text>
          {unreadCount > 0 && (
            <Text className="text-xs font-inter text-text-muted mt-1">{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} className="rounded-lg bg-surface-light border border-border px-3 py-2">
            <Text className="text-xs font-inter-500 text-text-secondary">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="py-16 items-center">
            <Text className="text-3xl mb-2">🔔</Text>
            <Text className="text-sm font-inter text-text-muted">No notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
