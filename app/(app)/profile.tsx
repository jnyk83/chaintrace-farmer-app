import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/lib/firebase'

export default function ProfileScreen() {
  const { user, farmerProfile } = useAuthStore()

  const infoItems = farmerProfile
    ? [
        { label: 'Name', value: farmerProfile.name },
        { label: 'Email', value: farmerProfile.email },
        { label: 'Phone', value: farmerProfile.phone },
        { label: 'Company', value: farmerProfile.companyName },
        { label: 'SSM Number', value: farmerProfile.ssmNumber },
        { label: 'Farm Address', value: farmerProfile.farmAddress },
        { label: 'Farm Size', value: farmerProfile.farmSize },
        { label: 'Products', value: farmerProfile.products.join(', ') },
        { label: 'Status', value: farmerProfile.status },
      ]
    : [
        { label: 'Email', value: user?.email || '-' },
        { label: 'Name', value: user?.displayName || '-' },
        { label: 'Role', value: user?.role || '-' },
      ]

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-xl font-inter-700 text-text-primary mb-6">My Profile</Text>

        {/* Avatar */}
        <View className="items-center mb-6">
          <View className="h-20 w-20 rounded-full bg-brand/15 items-center justify-center">
            <Text className="text-2xl font-inter-700 text-brand">
              {(farmerProfile?.name || user?.displayName || 'F').substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text className="text-lg font-inter-600 text-text-primary mt-3">
            {farmerProfile?.name || user?.displayName}
          </Text>
          {farmerProfile?.status === 'approved' && (
            <View className="rounded-full bg-success/15 px-3 py-1 mt-1">
              <Text className="text-xs font-inter-600 text-success">Verified Farmer</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="rounded-xl border border-border bg-surface-light p-5 mb-6">
          {infoItems.map((item) => (
            <View key={item.label} className="py-2.5 border-b border-border/50 last:border-b-0">
              <Text className="text-xs font-inter text-text-muted">{item.label}</Text>
              <Text className="text-sm font-inter-500 text-text-primary mt-0.5">{item.value || '-'}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          className="rounded-xl border border-danger/30 bg-danger/5 py-4 items-center mb-8"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-inter-600 text-danger">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
