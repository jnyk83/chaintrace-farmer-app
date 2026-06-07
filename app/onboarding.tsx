import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Location from 'expo-location'
import * as DocumentPicker from 'expo-document-picker'
import { api } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'
import type { FarmerProfile } from '@/types'

const CROP_PRODUCTS = ['Chili', 'Kangkung', 'Lettuce', 'Cabbage', 'Tomato', 'Broccoli', 'Spinach', 'Cucumber', 'Eggplant', 'Bell Pepper']
const AQUATIC_PRODUCTS = ['Tilapia', 'Catfish', 'Prawn', 'Red Snapper', 'Grouper', 'Seabass', 'Crab']
const BUSINESS_TYPES = ['Sole Proprietor', 'Partnership', 'Sdn Bhd', 'Cooperative', 'Other']

const STEPS = ['Personal', 'Business', 'Farm', 'Products', 'Review']

export default function OnboardingScreen() {
  const router = useRouter()
  const { setFarmerProfile } = useAuthStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1: Personal
  const [name, setName] = useState('')
  const [icNumber, setIcNumber] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2: Business
  const [companyName, setCompanyName] = useState('')
  const [ssmNumber, setSsmNumber] = useState('')
  const [businessType, setBusinessType] = useState('Sole Proprietor')

  // Step 3: Farm
  const [farmAddress, setFarmAddress] = useState('')
  const [farmSize, setFarmSize] = useState('')
  const [gpsCoords, setGpsCoords] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)

  // Documents
  const [documents, setDocuments] = useState<{ name: string; uri: string }[]>([])

  // Step 4: Products
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const toggleProduct = (p: string) => {
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleGetGPS = async () => {
    setGpsLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location access in your device settings to auto-detect farm coordinates.')
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const coords = `${loc.coords.latitude.toFixed(6)}, ${loc.coords.longitude.toFixed(6)}`
      setGpsCoords(coords)
    } catch {
      Alert.alert('GPS Error', 'Unable to get your location. Please try again or enter coordinates manually.')
    } finally {
      setGpsLoading(false)
    }
  }

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
        copyToCacheDirectory: true,
      })
      if (!result.canceled && result.assets) {
        const newDocs = result.assets.map((a) => ({ name: a.name, uri: a.uri }))
        setDocuments((prev) => [...prev, ...newDocs])
      }
    } catch {
      Alert.alert('Error', 'Failed to pick document. Please try again.')
    }
  }

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const canNext = () => {
    if (step === 0) return name && icNumber && phone
    if (step === 1) return companyName && ssmNumber
    if (step === 2) return farmAddress
    if (step === 3) return selectedProducts.length > 0
    return true
  }

  const handleSubmit = async () => {
    const uid = auth.currentUser?.uid
    const email = auth.currentUser?.email
    if (!uid || !email) return

    setLoading(true)
    try {
      await api.post('/farmers', {
        uid,
        name: name.trim(),
        icNumber: icNumber.trim(),
        phone: phone.trim(),
        email,
        companyName: companyName.trim(),
        ssmNumber: ssmNumber.trim(),
        businessType: businessType.toLowerCase().replace(/ /g, '_'),
        farmAddress: farmAddress.trim(),
        gpsCoords: gpsCoords,
        farmSize: farmSize.trim(),
        products: selectedProducts,
        documents: documents.map((d) => ({ name: d.name, url: d.uri, uploadedAt: new Date().toISOString() })),
      })

      // Refresh farmer profile
      const profile = await api.get<FarmerProfile>(`/farmers/${uid}`)
      setFarmerProfile(profile)

      Alert.alert('Submitted!', 'Your registration is pending admin approval.', [
        { text: 'OK', onPress: () => router.replace('/pending') },
      ])
    } catch (err) {
      Alert.alert('Error', (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const renderInput = (label: string, value: string, onChange: (t: string) => void, options?: { placeholder?: string; keyboardType?: 'default' | 'phone-pad' | 'numeric' }) => (
    <View className="mb-4">
      <Text className="text-sm font-inter-500 text-text-secondary mb-1.5">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={options?.placeholder || ''}
        placeholderTextColor="#475569"
        keyboardType={options?.keyboardType || 'default'}
        className="rounded-xl border border-border bg-surface-light px-4 py-3.5 text-text-primary font-inter"
      />
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      {/* Progress bar */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-inter-700 text-text-primary">Farmer Registration</Text>
          <Text className="text-xs font-inter text-text-muted">Step {step + 1} of {STEPS.length}</Text>
        </View>
        <View className="flex-row gap-1.5">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-brand' : 'bg-border'}`}
            />
          ))}
        </View>
        <Text className="text-xs font-inter-600 text-brand mt-2">{STEPS[step]}</Text>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        {/* Step 1: Personal */}
        {step === 0 && (
          <View className="pt-4">
            {renderInput('Full Name', name, setName, { placeholder: 'Ahmad bin Ibrahim' })}
            {renderInput('IC / Passport Number', icNumber, setIcNumber, { placeholder: '880101-01-1234' })}
            {renderInput('Phone Number', phone, setPhone, { placeholder: '012-3456789', keyboardType: 'phone-pad' })}
          </View>
        )}

        {/* Step 2: Business */}
        {step === 1 && (
          <View className="pt-4">
            {renderInput('Company / Farm Name', companyName, setCompanyName, { placeholder: 'Ladang Ahmad Sdn Bhd' })}
            {renderInput('SSM Registration Number', ssmNumber, setSsmNumber, { placeholder: 'e.g. 202301012345' })}
            <Text className="text-sm font-inter-500 text-text-secondary mb-2">Business Type</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {BUSINESS_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setBusinessType(t)}
                  className={`rounded-xl px-4 py-2.5 border ${
                    businessType === t ? 'border-brand bg-brand/15' : 'border-border bg-surface-light'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-inter-500 ${businessType === t ? 'text-brand' : 'text-text-secondary'}`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Farm */}
        {step === 2 && (
          <View className="pt-4">
            {renderInput('Farm Address', farmAddress, setFarmAddress, { placeholder: 'Lot 123, Jalan Ladang, Cameron Highlands' })}
            {renderInput('Farm Size', farmSize, setFarmSize, { placeholder: 'e.g. 5 acres' })}

            {/* GPS Auto-detect */}
            <Text className="text-sm font-inter-500 text-text-secondary mb-1.5">GPS Coordinates</Text>
            <View className="flex-row items-center gap-2 mb-1.5">
              <View className="flex-1 rounded-xl border border-border bg-surface-light px-4 py-3.5">
                <Text className={`text-sm font-inter ${gpsCoords ? 'text-text-primary' : 'text-text-muted'}`}>
                  {gpsCoords || 'Not detected yet'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleGetGPS}
                disabled={gpsLoading}
                className="rounded-xl bg-brand px-4 py-3.5 items-center justify-center"
                style={{ opacity: gpsLoading ? 0.6 : 1 }}
                activeOpacity={0.7}
              >
                {gpsLoading ? (
                  <ActivityIndicator size="small" color="#0d1117" />
                ) : (
                  <Text className="text-sm font-inter-600 text-surface">📍 Detect</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text className="text-xs font-inter text-text-muted mb-4">
              Tap to auto-detect your farm location via GPS
            </Text>

            {/* Document Upload */}
            <Text className="text-sm font-inter-500 text-text-secondary mb-1.5">Documents (Optional)</Text>
            <Text className="text-xs font-inter text-text-muted mb-2">
              Upload business license, farm permit, or MyKAD copy (PDF/Image)
            </Text>
            <TouchableOpacity
              onPress={handlePickDocument}
              className="rounded-xl border border-dashed border-brand/50 bg-brand/5 py-4 items-center mb-2"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-inter-600 text-brand">📎 Pick Files</Text>
            </TouchableOpacity>
            {documents.length > 0 && (
              <View className="gap-2 mb-2">
                {documents.map((doc, i) => (
                  <View key={i} className="flex-row items-center rounded-xl border border-border bg-surface-light px-3 py-2.5">
                    <Text className="flex-1 text-sm font-inter text-text-primary" numberOfLines={1}>
                      📄 {doc.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeDocument(i)} activeOpacity={0.7}>
                      <Text className="text-sm font-inter-600 text-red-400 ml-2">✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Step 4: Products */}
        {step === 3 && (
          <View className="pt-4">
            <Text className="text-sm font-inter-600 text-text-secondary mb-3">Crops / Vegetables</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {CROP_PRODUCTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => toggleProduct(p)}
                  className={`rounded-xl px-3.5 py-2 border ${
                    selectedProducts.includes(p) ? 'border-brand bg-brand/15' : 'border-border bg-surface-light'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-inter-500 ${selectedProducts.includes(p) ? 'text-brand' : 'text-text-secondary'}`}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-inter-600 text-text-secondary mb-3">Aquatic Products</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {AQUATIC_PRODUCTS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => toggleProduct(p)}
                  className={`rounded-xl px-3.5 py-2 border ${
                    selectedProducts.includes(p) ? 'border-brand bg-brand/15' : 'border-border bg-surface-light'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-inter-500 ${selectedProducts.includes(p) ? 'text-brand' : 'text-text-secondary'}`}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedProducts.length > 0 && (
              <Text className="text-xs font-inter text-text-muted">
                Selected: {selectedProducts.join(', ')}
              </Text>
            )}
          </View>
        )}

        {/* Step 5: Review */}
        {step === 4 && (
          <View className="pt-4">
            <View className="rounded-xl border border-border bg-surface-light p-4 mb-4">
              {[
                { label: 'Name', value: name },
                { label: 'IC', value: icNumber },
                { label: 'Phone', value: phone },
                { label: 'Company', value: companyName },
                { label: 'SSM', value: ssmNumber || '-' },
                { label: 'Business Type', value: businessType },
                { label: 'Farm Address', value: farmAddress },
                { label: 'GPS Coordinates', value: gpsCoords || 'Not provided' },
                { label: 'Farm Size', value: farmSize || '-' },
                { label: 'Products', value: selectedProducts.join(', ') },
                { label: 'Documents', value: documents.length > 0 ? documents.map((d) => d.name).join(', ') : 'None' },
              ].map((item) => (
                <View key={item.label} className="py-2 border-b border-border/50">
                  <Text className="text-xs font-inter text-text-muted">{item.label}</Text>
                  <Text className="text-sm font-inter-500 text-text-primary mt-0.5">{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Bottom buttons */}
      <View className="px-5 pb-6 pt-3 flex-row gap-3">
        {step > 0 && (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            className="flex-1 rounded-xl border border-border py-4 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-inter-600 text-text-secondary">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={step === 4 ? handleSubmit : () => setStep(step + 1)}
          disabled={!canNext() || loading}
          className="flex-1 rounded-xl bg-brand py-4 items-center"
          style={{ opacity: canNext() && !loading ? 1 : 0.5 }}
          activeOpacity={0.8}
        >
          {loading ? (
            <Spinner color="#0d1117" />
          ) : (
            <Text className="text-sm font-inter-600 text-surface">
              {step === 4 ? 'Submit Registration' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
