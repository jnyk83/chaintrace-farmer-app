import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/authStore'
import { useBatchStore } from '@/store/batchStore'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

const HARVEST_PERIODS = ['Morning (6am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)']

export default function RegisterBatchScreen() {
  const router = useRouter()
  const { farmerProfile } = useAuthStore()
  const { fetchBatches } = useBatchStore()
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10))
  const [harvestPeriod, setHarvestPeriod] = useState(HARVEST_PERIODS[0])

  const products = farmerProfile?.products || []

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity) {
      Alert.alert('Missing Fields', 'Please select a product and enter quantity')
      return
    }
    setLoading(true)
    try {
      const aquatic = ['tilapia', 'catfish', 'prawn', 'red snapper', 'grouper', 'seabass', 'crab']
      const productType = aquatic.includes(selectedProduct.toLowerCase()) ? 'aquatic' : 'crop'

      await api.post('/register-batch', {
        farmerName: farmerProfile?.name || '',
        farmLocation: farmerProfile?.farmAddress || '',
        productType,
        productName: selectedProduct,
        quantity: parseFloat(quantity),
        harvestDate,
        gpsCoords: farmerProfile?.gpsCoords || '',
        farmerUid: farmerProfile?.uid || '',
        harvestPeriod,
      })

      await fetchBatches()
      Alert.alert('Success', 'Batch registered successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      Alert.alert('Error', (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-sm font-inter-600 text-brand">← Back</Text>
        </TouchableOpacity>

        <Text className="text-xl font-inter-700 text-text-primary mb-1">Register New Batch</Text>
        <Text className="text-sm font-inter text-text-muted mb-6">
          Auto-filled from your farmer profile
        </Text>

        {/* Auto-filled info */}
        <View className="rounded-xl border border-border bg-surface-light p-4 mb-5">
          <Text className="text-xs font-inter text-text-muted mb-1">Farmer</Text>
          <Text className="text-sm font-inter-500 text-text-primary">{farmerProfile?.name || '-'}</Text>
          <Text className="text-xs font-inter text-text-muted mt-2 mb-1">Farm Location</Text>
          <Text className="text-sm font-inter-500 text-text-primary">{farmerProfile?.farmAddress || '-'}</Text>
        </View>

        {/* Product Selection */}
        <Text className="text-sm font-inter-500 text-text-secondary mb-2">Product</Text>
        {products.length === 0 ? (
          <View className="rounded-xl border border-warning/25 bg-warning/5 p-4 mb-4">
            <Text className="text-xs font-inter text-warning">
              No products registered in your profile. Please complete your farmer onboarding first.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2 mb-5">
            {products.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedProduct(p)}
                className={`rounded-xl px-4 py-2.5 border ${
                  selectedProduct === p
                    ? 'border-brand bg-brand/15'
                    : 'border-border bg-surface-light'
                }`}
                activeOpacity={0.7}
              >
                <Text className={`text-sm font-inter-500 ${
                  selectedProduct === p ? 'text-brand' : 'text-text-secondary'
                }`}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quantity */}
        <Text className="text-sm font-inter-500 text-text-secondary mb-2">Quantity (kg)</Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="e.g. 500"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          className="rounded-xl border border-border bg-surface-light px-4 py-3.5 text-text-primary font-inter mb-5"
        />

        {/* Harvest Date */}
        <Text className="text-sm font-inter-500 text-text-secondary mb-2">Harvest Date</Text>
        <TextInput
          value={harvestDate}
          onChangeText={setHarvestDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#475569"
          className="rounded-xl border border-border bg-surface-light px-4 py-3.5 text-text-primary font-inter mb-5"
        />

        {/* Harvest Period */}
        <Text className="text-sm font-inter-500 text-text-secondary mb-2">Harvest Period</Text>
        <View className="gap-2 mb-6">
          {HARVEST_PERIODS.map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setHarvestPeriod(period)}
              className={`rounded-xl px-4 py-3 border ${
                harvestPeriod === period
                  ? 'border-brand bg-brand/15'
                  : 'border-border bg-surface-light'
              }`}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-inter-500 ${
                harvestPeriod === period ? 'text-brand' : 'text-text-secondary'
              }`}>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !selectedProduct || !quantity}
          className="rounded-xl bg-brand py-4 items-center mb-8"
          style={{ opacity: loading || !selectedProduct || !quantity ? 0.6 : 1 }}
          activeOpacity={0.8}
        >
          {loading ? (
            <Spinner color="#0d1117" />
          ) : (
            <Text className="text-base font-inter-600 text-surface">Register Batch</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
