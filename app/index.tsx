import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { login } from '@/lib/firebase'
import Spinner from '@/components/ui/Spinner'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return setError('Please enter email and password')
    setLoading(true)
    setError('')
    try {
      const result = await login(email.trim(), password)
      if (!result.user) {
        setError('Login failed. Please try again.')
      }
      // Auth state listener in _layout.tsx will handle navigation
    } catch (err) {
      const msg = (err as Error).message.replace('Firebase: ', '')
      setError(msg)
      Alert.alert('Login Failed', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="h-16 w-16 rounded-2xl bg-brand/15 items-center justify-center mb-4">
            <Text className="text-2xl font-inter-700 text-brand">CT</Text>
          </View>
          <Text className="text-2xl font-inter-700 text-text-primary">ChainTrace</Text>
          <Text className="text-sm font-inter text-text-muted mt-1">Farmer Portal</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
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
              placeholder="••••••••"
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
            onPress={handleLogin}
            disabled={loading}
            className="rounded-xl bg-brand py-4 items-center mt-2"
            activeOpacity={0.8}
          >
            {loading ? (
              <Spinner color="#0d1117" />
            ) : (
              <Text className="text-base font-inter-600 text-surface">Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-sm font-inter text-text-muted">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="text-sm font-inter-600 text-brand">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
