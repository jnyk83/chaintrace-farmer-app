import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'
import type { IoTTemplate, IoTReading } from '@/types'
import { COLORS } from '@/constants/config'

const CHART_COLORS = ['#f87171', '#3b82f6', '#00c896', '#f59e0b']
const screenWidth = Dimensions.get('window').width - 40

export default function IoTDetailScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>()
  const router = useRouter()
  const [readings, setReadings] = useState<IoTReading[]>([])
  const [template, setTemplate] = useState<IoTTemplate | null>(null)
  const [templates, setTemplates] = useState<Record<string, IoTTemplate>>({})
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState<string | null>(null)

  useEffect(() => {
    if (!batchId) return
    Promise.all([
      api.get<Record<string, IoTTemplate>>('/iot/templates'),
      api.get<IoTReading[]>(`/iot/readings/${batchId}`),
    ])
      .then(([tmpl, data]) => {
        setTemplates(tmpl)
        setReadings(data)
        if (data.length > 0 && data[0].templateKey && tmpl[data[0].templateKey]) {
          setTemplate(tmpl[data[0].templateKey])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [batchId])

  const handleSimulate = async (scenario: 'pass' | 'fail') => {
    if (!batchId) return
    setSimulating(scenario)
    try {
      await api.post(`/iot/simulate/${batchId}`, { scenario })
      const data = await api.get<IoTReading[]>(`/iot/readings/${batchId}`)
      setReadings(data)
      if (data.length > 0 && data[0].templateKey && templates[data[0].templateKey]) {
        setTemplate(templates[data[0].templateKey])
      }
    } catch { /* silent */ }
    finally { setSimulating(null) }
  }

  // Compute alerts
  const alerts = template
    ? readings.filter((r) =>
        template.sensors.some((s) => {
          const val = r[s.key] as number
          return val !== undefined && (val < s.threshold.low || val > s.threshold.high)
        })
      )
    : []

  // Downsample readings for display (show every 6th = every 6 hours)
  const sampled = readings.filter((_, i) => i % 6 === 0)

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-sm font-inter-600 text-brand">← Back</Text>
        </TouchableOpacity>

        <Text className="text-xl font-inter-700 text-text-primary mb-1">IoT Monitoring</Text>
        <Text className="text-sm font-inter text-text-muted mb-4">Batch: {batchId}</Text>

        {/* Simulate buttons */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => handleSimulate('pass')}
            disabled={!!simulating}
            className="flex-1 rounded-xl border border-success/30 bg-success/10 py-3 items-center"
            activeOpacity={0.7}
          >
            {simulating === 'pass' ? <Spinner color={COLORS.success} /> : (
              <Text className="text-sm font-inter-600 text-success">Simulate PASS</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSimulate('fail')}
            disabled={!!simulating}
            className="flex-1 rounded-xl border border-danger/30 bg-danger/10 py-3 items-center"
            activeOpacity={0.7}
          >
            {simulating === 'fail' ? <Spinner color={COLORS.danger} /> : (
              <Text className="text-sm font-inter-600 text-danger">Simulate FAIL</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Template info */}
        {template && readings.length > 0 && (
          <View className="rounded-xl border border-chain/25 bg-chain/5 px-4 py-2.5 mb-4 flex-row items-center">
            <Text className="text-xs font-inter-600 text-chain">
              Template: {template.name}
            </Text>
            <Text className="text-xs text-chain/70 ml-2">
              · {template.sensors.length} sensors · {readings.length} readings
            </Text>
          </View>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <View className="rounded-xl border border-danger/25 bg-danger/5 p-4 mb-4">
            <Text className="text-sm font-inter-600 text-danger mb-2">
              ⚠️ {alerts.length} Threshold Alerts
            </Text>
            {alerts.slice(0, 3).map((a, i) => {
              const violations = template!.sensors.filter((s) => {
                const val = a[s.key] as number
                return val !== undefined && (val < s.threshold.low || val > s.threshold.high)
              })
              return (
                <Text key={i} className="text-xs font-inter text-text-secondary mb-1">
                  {new Date(a.timestamp).toLocaleString()} — {violations.map((s) =>
                    `${s.label}: ${(a[s.key] as number).toFixed(1)}${s.unit}`
                  ).join(', ')}
                </Text>
              )
            })}
            {alerts.length > 3 && (
              <Text className="text-xs font-inter text-text-muted">+{alerts.length - 3} more</Text>
            )}
          </View>
        )}

        {/* No data */}
        {readings.length === 0 && (
          <View className="rounded-xl border border-border bg-surface-light py-16 items-center">
            <Text className="text-3xl mb-2">📡</Text>
            <Text className="text-sm font-inter text-text-muted">No IoT readings yet</Text>
            <Text className="text-xs font-inter text-text-muted mt-1">Use the simulate buttons above to generate test data</Text>
          </View>
        )}

        {/* Sensor data cards (mini charts as text-based sparkline) */}
        {template && readings.length > 0 && template.sensors.map((sensor, idx) => {
          const values = readings.map((r) => r[sensor.key] as number).filter((v) => v !== undefined)
          const min = Math.min(...values)
          const max = Math.max(...values)
          const avg = values.reduce((a, b) => a + b, 0) / values.length
          const latest = values[values.length - 1]
          const isAlert = latest < sensor.threshold.low || latest > sensor.threshold.high
          const color = CHART_COLORS[idx % CHART_COLORS.length]

          return (
            <View key={sensor.key} className="rounded-xl border border-border bg-surface-light p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <Text className="text-sm font-inter-600 text-text-secondary">
                    {sensor.label}
                  </Text>
                </View>
                {isAlert && (
                  <View className="rounded-full bg-danger/15 px-2 py-0.5">
                    <Text className="text-[10px] font-inter-600 text-danger">ALERT</Text>
                  </View>
                )}
              </View>

              {/* Stats row */}
              <View className="flex-row gap-4 mb-2">
                <View className="flex-1">
                  <Text className="text-[10px] font-inter text-text-muted">Current</Text>
                  <Text className={`text-lg font-inter-700 ${isAlert ? 'text-danger' : 'text-text-primary'}`}>
                    {latest.toFixed(sensor.unit === 'lux' ? 0 : 1)}{sensor.unit}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-inter text-text-muted">Average</Text>
                  <Text className="text-sm font-inter-600 text-text-secondary">
                    {avg.toFixed(1)}{sensor.unit}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-inter text-text-muted">Range</Text>
                  <Text className="text-sm font-inter-600 text-text-secondary">
                    {min.toFixed(1)} – {max.toFixed(1)}
                  </Text>
                </View>
              </View>

              {/* Threshold info */}
              <View className="flex-row items-center gap-3">
                <Text className="text-[10px] font-inter text-text-muted">
                  Safe: {sensor.min}–{sensor.max}{sensor.unit}
                </Text>
                <Text className="text-[10px] font-inter text-danger">
                  Alert: &lt;{sensor.threshold.low} / &gt;{sensor.threshold.high}
                </Text>
              </View>

              {/* Mini bar chart (last 28 readings = ~1 day sampled) */}
              <View className="flex-row items-end gap-px mt-3 h-12">
                {readings.slice(-28).map((r, i) => {
                  const val = r[sensor.key] as number
                  if (val === undefined) return null
                  const range = sensor.threshold.high - sensor.threshold.low
                  const pct = Math.max(0.05, Math.min(1, (val - sensor.threshold.low + range * 0.2) / (range * 1.4)))
                  const barAlert = val < sensor.threshold.low || val > sensor.threshold.high
                  return (
                    <View
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${pct * 100}%`,
                        backgroundColor: barAlert ? COLORS.danger : color,
                        opacity: barAlert ? 1 : 0.6,
                      }}
                    />
                  )
                })}
              </View>
            </View>
          )
        })}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  )
}
