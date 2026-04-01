import { create } from 'zustand'
import type { Batch } from '@/types'
import { api } from '@/lib/api'

interface BatchState {
  batches: Batch[]
  loading: boolean
  error: string | null
  fetchBatches: () => Promise<void>
}

export const useBatchStore = create<BatchState>((set) => ({
  batches: [],
  loading: false,
  error: null,
  fetchBatches: async () => {
    set({ loading: true, error: null })
    try {
      const data = await api.get<Batch[]>('/batches')
      set({ batches: data, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },
}))
