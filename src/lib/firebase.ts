import { initializeApp } from 'firebase/app'
import {
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FIREBASE_CONFIG } from '@/constants/config'

const app = initializeApp(FIREBASE_CONFIG)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function logout() {
  return signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}
