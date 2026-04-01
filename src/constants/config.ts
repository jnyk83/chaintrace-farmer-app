// ChainTrace Farmer App Configuration
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000/api' // Android emulator → host machine
  : 'https://chaintrace-mvp-production.up.railway.app/api'

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC1TUvw_sCa8kMDgm6aT8oEPbJmtEXaJ1g',
  authDomain: 'chaintrace-mvp-v2.firebaseapp.com',
  projectId: 'chaintrace-mvp-v2',
  storageBucket: 'chaintrace-mvp-v2.firebasestorage.app',
  messagingSenderId: '',
  appId: '',
}

export const COLORS = {
  brand: '#00c896',
  brandDark: '#00a67d',
  surface: '#0d1117',
  surfaceLight: '#161b27',
  border: '#1e2d45',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#00c896',
  chain: '#a78bfa',
  textPrimary: '#f0f4ff',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
} as const
