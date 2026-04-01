import { create } from 'zustand'
import type { AppUser, FarmerProfile, FarmerStatus } from '@/types'

interface AuthState {
  user: AppUser | null
  farmerProfile: FarmerProfile | null
  farmerStatus: FarmerStatus | null
  loading: boolean
  setUser: (user: AppUser | null) => void
  setFarmerProfile: (profile: FarmerProfile | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  farmerProfile: null,
  farmerStatus: null,
  loading: true,
  setUser: (user) => set({ user }),
  setFarmerProfile: (profile) =>
    set({ farmerProfile: profile, farmerStatus: profile?.status ?? null }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, farmerProfile: null, farmerStatus: null, loading: false }),
}))
