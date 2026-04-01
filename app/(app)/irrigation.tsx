import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '@/constants/config'

interface Schedule {
  id: string
  time: string
  enabled: boolean
  days: string[]
}

interface Trigger {
  id: string
  sensor: string
  condition: '<' | '>'
  value: number
  unit: string
  action: string
  enabled: boolean
}

const DEFAULT_SCHEDULES: Schedule[] = [
  { id: '1', time: '06:00', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  { id: '2', time: '17:00', enabled: true, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
]

const DEFAULT_TRIGGERS: Trigger[] = [
  { id: '1', sensor: 'Soil Moisture', condition: '<', value: 30, unit: '%', action: 'Start irrigation', enabled: true },
  { id: '2', sensor: 'Soil Temperature', condition: '>', value: 35, unit: '°C', action: 'Send alert', enabled: false },
]

export default function IrrigationScreen() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>(DEFAULT_SCHEDULES)
  const [triggers, setTriggers] = useState<Trigger[]>(DEFAULT_TRIGGERS)
  const [pumpOn, setPumpOn] = useState(false)

  const toggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const toggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  const handlePumpToggle = () => {
    const newState = !pumpOn
    setPumpOn(newState)
    Alert.alert(
      newState ? 'Pump ON' : 'Pump OFF',
      newState
        ? 'Intent recorded. In production, this will control the actual pump via ViTrox IoT gateway.'
        : 'Intent recorded. Pump turned off.',
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-sm font-inter-600 text-brand">← Back</Text>
        </TouchableOpacity>

        <Text className="text-xl font-inter-700 text-text-primary mb-1">Irrigation Control</Text>
        <Text className="text-sm font-inter text-text-muted mb-6">
          Manage watering schedules and smart triggers
        </Text>

        {/* Manual Control */}
        <View className="rounded-xl border border-border bg-surface-light p-5 mb-5">
          <Text className="text-sm font-inter-600 text-text-secondary mb-3">Manual Control</Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-inter-500 text-text-primary">Water Pump</Text>
              <Text className="text-xs font-inter text-text-muted mt-0.5">
                {pumpOn ? 'Currently running' : 'Currently off'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handlePumpToggle}
              className={`rounded-xl px-6 py-3 ${pumpOn ? 'bg-danger' : 'bg-brand'}`}
              activeOpacity={0.8}
            >
              <Text className="text-sm font-inter-600 text-surface">
                {pumpOn ? 'STOP' : 'START'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-[10px] font-inter text-text-muted mt-3">
            MVP: Records intent only. V2 connects to ViTrox IoT gateway for actual hardware control.
          </Text>
        </View>

        {/* Schedules */}
        <Text className="text-sm font-inter-600 text-text-secondary mb-3">Daily Schedules</Text>
        <View className="gap-2 mb-6">
          {schedules.map((s) => (
            <View key={s.id} className="rounded-xl border border-border bg-surface-light p-4 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-inter-700 text-text-primary">{s.time}</Text>
                <Text className="text-xs font-inter text-text-muted mt-0.5">
                  {s.days.join(', ')}
                </Text>
              </View>
              <Switch
                value={s.enabled}
                onValueChange={() => toggleSchedule(s.id)}
                trackColor={{ false: COLORS.border, true: COLORS.brand + '60' }}
                thumbColor={s.enabled ? COLORS.brand : '#475569'}
              />
            </View>
          ))}
        </View>

        {/* Smart Triggers */}
        <Text className="text-sm font-inter-600 text-text-secondary mb-3">Smart Triggers</Text>
        <View className="gap-2 mb-6">
          {triggers.map((t) => (
            <View key={t.id} className="rounded-xl border border-border bg-surface-light p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-inter-600 text-text-primary">{t.action}</Text>
                <Switch
                  value={t.enabled}
                  onValueChange={() => toggleTrigger(t.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.brand + '60' }}
                  thumbColor={t.enabled ? COLORS.brand : '#475569'}
                />
              </View>
              <Text className="text-xs font-inter text-text-muted">
                When {t.sensor} {t.condition} {t.value}{t.unit}
              </Text>
              {t.enabled && (
                <View className="mt-2 rounded bg-warning/10 px-2 py-1">
                  <Text className="text-[10px] font-inter text-warning">
                    MVP: Shows "Suggested Action" alert only — no hardware control
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  )
}
