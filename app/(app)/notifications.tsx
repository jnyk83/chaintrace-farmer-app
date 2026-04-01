import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center">
      <Text className="text-4xl mb-4">🔔</Text>
      <Text className="text-lg font-inter-700 text-text-primary">Notifications</Text>
      <Text className="text-sm font-inter text-text-muted mt-2">Coming in next update</Text>
    </SafeAreaView>
  )
}
