import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { register as firebaseRegister } from '@/lib/firebase'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

export default function RegisterScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!name || !email || !password) return setError('Please fill in all fields')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')
    try {
      const cred = await firebaseRegister(email.trim(), password)
      // Create user profile on backend
      await api.post('/auth/register-profile', {
        uid: cred.user.uid,
        email: email.trim(),
        displayName: name.trim(),
        role: 'farmer',
      })
      // Auth state listener will redirect to onboarding or pending
    } catch (err) {
      setError((err as Error).message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        {/* Header */}
        <View className="items-center mb-10">
          <View className="h-16 w-16 rounded-2xl bg-brand/15 items-center justify-center mb-4">
            <Text className="text-2xl font-inter-700 text-brand">CT</Text>
          </View>
          <Text className="text-2xl font-inter-700 text-text-primary">Create Account</Text>
          <Text className="text-sm font-inter text-text-muted mt-1">Register as a farmer</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-inter-500 text-text-secondary mb-1.5">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ahmad bin Ibrahim"
              placeholderTextColor="#475569"
              autoCapitalize="words"
              className="rounded-xl border border-border bg-surface-light px-4 py-3.5 text-text-primary font-inter"
            />
          </View>
          <View>
            <Text className="text-sm font-inter-500 text-text-secondary mb-1.5">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#475569"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-xl border border-border bg-surface-light px-4 py-3.5 text-text-primary font-inter"
            />
          </View>
          <View>
            <Text className="text-sm font-inter-500 text-text-secondary mb-1.5">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#475569"
              secureTextEntry
              className="rounded-xl border border-border bg-surface-light px-4 py-3.5 text-text-primary font-inter"
            />
          </View>

          {error ? (
            <View className="rounded-lg bg-danger/10 px-3 py-2">
              <Text className="text-xs font-inter-500 text-danger">{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="rounded-xl bg-brand py-4 items-center mt-2"
            activeOpacity={0.8}
          >
            {loading ? (
              <Spinner color="#0d1117" />
            ) : (
              <Text className="text-base font-inter-600 text-surface">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-sm font-inter text-text-muted">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-sm font-inter-600 text-brand">Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
