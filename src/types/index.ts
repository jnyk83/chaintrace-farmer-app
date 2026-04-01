// ===== User =====
export type UserRole = 'admin' | 'farmer' | 'lab'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
}

// ===== Farmer =====
export type FarmerStatus = 'pending_approval' | 'approved' | 'rejected'

export interface FarmerProfile {
  uid: string
  name: string
  icNumber: string
  phone: string
  email: string
  companyName: string
  ssmNumber: string
  businessType: string
  farmAddress: string
  gpsCoords: string
  farmSize: string
  products: string[]
  documents: { name: string; url: string; uploadedAt: string }[]
  status: FarmerStatus
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  createdAt: string
}

// ===== Batch =====
export type ProductType = 'crop' | 'aquatic'
export type BatchStatus = 'registered' | 'lab_uploaded' | 'on_chain'

export interface Batch {
  batchId: string
  farmerName: string
  farmLocation: string
  productType: ProductType
  productName: string
  quantity: number
  harvestDate: string
  gpsCoords: string
  status: BatchStatus
  labReportFile?: string
  sha256Hash?: string
  txHash?: string
  blockNumber?: number
  assignedLabId?: string
  assignedLabName?: string
  labResult?: 'pass' | 'fail' | 'conditional'
  labNotes?: string
  createdAt?: string
  uploadedAt?: string
  storedOnChainAt?: string
}

// ===== IoT =====
export interface IoTTemplate {
  name: string
  sensors: {
    key: string
    label: string
    unit: string
    min: number
    max: number
    threshold: { low: number; high: number }
  }[]
}

export interface IoTReading {
  id: string
  batchId: string
  templateKey: string
  templateName: string
  timestamp: string
  [sensorKey: string]: string | number
}
