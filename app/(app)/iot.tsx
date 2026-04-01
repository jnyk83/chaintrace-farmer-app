import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function IoTScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl mb-4">📡</Text>
        <Text className="text-xl font-inter-700 text-text-primary">IoT Monitoring</Text>
        <Text className="text-sm font-inter text-text-muted text-center mt-2">
          View real-time sensor data from your farm. Select a batch to see IoT readings.
        </Text>
        <Text className="text-xs font-inter text-text-muted mt-6">Coming in next update</Text>
      </View>
    </SafeAreaView>
  )
}
