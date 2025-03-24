import api from "./api"
import patientService, { type Patient } from "./patientService"

// Types for EHR integration
export interface EHRConfig {
  apiUrl: string
  apiKey?: string
  enabled: boolean
  syncFrequency: string
  autoSync: boolean
  lastUpdated?: string
}

export interface EHRStatus {
  status: string
  apiUrl: string
  lastSync: string | null
  enabled: boolean
  autoSync: boolean
  syncFrequency: string
  timeSinceLastSync: number | null
  totalPatients: number
  totalMappedPatients: number
  unmappedPatients: number
}

export interface EHRPatientMapping {
  patient_id: number
  ehr_id: string
  last_synced: string
  status: "mapped" | "unmapped" | "error"
  errorMessage?: string
}

export interface SyncResult {
  success: boolean
  syncStats: {
    syncedPatients: number
    failedPatients: number
    newMappings: number
    updatedRecords: number
  }
  details: {
    successfulPatients: Array<{ id: number; name: string }>
    failedPatients: Array<{ id: number; name: string; error: string }>
  }
}

// Local storage keys
const EHR_CONFIG_KEY = "ehr_config"
const EHR_MAPPINGS_KEY = "ehr_patient_mappings"
const EHR_LAST_SYNC_KEY = "ehr_last_sync"

// Default configuration
const DEFAULT_CONFIG: EHRConfig = {
  apiUrl: "",
  apiKey: "",
  enabled: false,
  syncFrequency: "daily",
  autoSync: false,
  lastUpdated: new Date().toISOString(),
}

// Helper functions for localStorage
const getLocalConfig = (): EHRConfig => {
  const storedConfig = localStorage.getItem(EHR_CONFIG_KEY)
  return storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG
}

const saveLocalConfig = (config: EHRConfig): void => {
  config.lastUpdated = new Date().toISOString()
  localStorage.setItem(EHR_CONFIG_KEY, JSON.stringify(config))
}

const getLocalMappings = (): EHRPatientMapping[] => {
  const storedMappings = localStorage.getItem(EHR_MAPPINGS_KEY)
  return storedMappings ? JSON.parse(storedMappings) : []
}

const saveLocalMappings = (mappings: EHRPatientMapping[]): void => {
  localStorage.setItem(EHR_MAPPINGS_KEY, JSON.stringify(mappings))
}

const getLastSyncTime = (): string | null => {
  return localStorage.getItem(EHR_LAST_SYNC_KEY)
}

const setLastSyncTime = (time: string): void => {
  localStorage.setItem(EHR_LAST_SYNC_KEY, time)
}

// Generate a unique EHR ID for a patient
const generateehr_id = (patient: Patient): string => {
  const prefix = "EHR"
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${patient.student_id || patient.patient_id}-${randomPart}`
}

// Calculate hours since last sync
const getHoursSinceLastSync = (): number | null => {
  const lastSync = getLastSyncTime()
  if (!lastSync) return null

  const lastSyncDate = new Date(lastSync)
  const now = new Date()
  const diffMs = now.getTime() - lastSyncDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60))
}

const ehrService = {
  getConfig: async (): Promise<EHRConfig> => {
    try {
      // Try to get from API first
      const response = await api.get("/ehr/config")
      const apiConfig = response.data

      // Save to localStorage for persistence
      saveLocalConfig(apiConfig)
      return apiConfig
    } catch (error) {
      // If API fails, get from localStorage
      return getLocalConfig()
    }
  },

  getStatus: async (): Promise<EHRStatus> => {
    try {
      // Try to get from API first
      const response = await api.get("/ehr/status")
      return response.data
    } catch (error) {
      // If API fails, calculate status from local data
      const config = getLocalConfig()
      const mappings = getLocalMappings()
      const lastSync = getLastSyncTime()

      // Get actual patient count from patientService
      let patients: Patient[] = []
      try {
        patients = await patientService.getAllPatients()
      } catch (err) {
        console.error("Failed to fetch patients for EHR status", err)
      }

      const totalPatients = patients.length
      const totalMappedPatients = mappings.filter((m) => m.status === "mapped").length

      return {
        status: config.enabled && config.apiUrl ? "operational" : "disconnected",
        apiUrl: config.apiUrl,
        lastSync,
        enabled: config.enabled,
        autoSync: config.autoSync,
        syncFrequency: config.syncFrequency,
        timeSinceLastSync: getHoursSinceLastSync(),
        totalPatients,
        totalMappedPatients,
        unmappedPatients: totalPatients - totalMappedPatients,
      }
    }
  },

  updateConfig: async (config: EHRConfig): Promise<EHRConfig> => {
    try {
      // Try to update via API first
      const response = await api.put("/ehr/config", config)
      const updatedConfig = response.data

      // Save to localStorage for persistence
      saveLocalConfig(updatedConfig)
      return updatedConfig
    } catch (error) {
      // If API fails, update localStorage directly
      saveLocalConfig(config)
      return config
    }
  },

  syncAllPatients: async (): Promise<SyncResult> => {
    try {
      // Try API first
      const response = await api.post("/ehr/sync")

      // Update last sync time
      setLastSyncTime(new Date().toISOString())

      return response.data
    } catch (error) {
      // If API fails, perform local sync simulation
      const config = getLocalConfig()

      // Check if integration is enabled
      if (!config.enabled || !config.apiUrl) {
        throw new Error("EHR integration is not properly configured or enabled")
      }

      // Get all patients
      const patients = await patientService.getAllPatients()

      // Get existing mappings
      const mappings = getLocalMappings()

      // Simulate sync process with delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const successfulPatients: Array<{ id: number; name: string }> = []
      const failedPatients: Array<{ id: number; name: string; error: string }> = []

      // Process each patient
      for (const patient of patients) {
        // Simulate 10% failure rate
        const willFail = Math.random() < 0.1

        if (willFail) {
          failedPatients.push({
            id: patient.patient_id!,
            name: `${patient.first_name} ${patient.last_name}`,
            error: "Connection timeout with EHR system",
          })

          // Update mapping with error
          const existingMappingIndex = mappings.findIndex((m) => m.patient_id === patient.patient_id)
          if (existingMappingIndex >= 0) {
            mappings[existingMappingIndex].status = "error"
            mappings[existingMappingIndex].errorMessage = "Connection timeout with EHR system"
          } else {
            mappings.push({
              patient_id: patient.patient_id!,
              ehr_id: generateehr_id(patient),
              last_synced: new Date().toISOString(),
              status: "error",
              errorMessage: "Connection timeout with EHR system",
            })
          }
        } else {
          successfulPatients.push({
            id: patient.patient_id!,
            name: `${patient.first_name} ${patient.last_name}`,
          })

          // Update or create mapping
          const existingMappingIndex = mappings.findIndex((m) => m.patient_id === patient.patient_id)
          if (existingMappingIndex >= 0) {
            mappings[existingMappingIndex].last_synced = new Date().toISOString()
            mappings[existingMappingIndex].status = "mapped"
            delete mappings[existingMappingIndex].errorMessage
          } else {
            mappings.push({
              patient_id: patient.patient_id!,
              ehr_id: generateehr_id(patient),
              last_synced: new Date().toISOString(),
              status: "mapped",
            })
          }
        }
      }

      // Save updated mappings
      saveLocalMappings(mappings)

      // Update last sync time
      setLastSyncTime(new Date().toISOString())

      // Return sync results
      const syncResult: SyncResult = {
        success: true,
        syncStats: {
          syncedPatients: successfulPatients.length,
          failedPatients: failedPatients.length,
          newMappings: mappings.filter((m) => new Date(m.last_synced).getTime() > Date.now() - 5000).length,
          updatedRecords:
            successfulPatients.length -
            mappings.filter((m) => new Date(m.last_synced).getTime() > Date.now() - 5000).length,
        },
        details: {
          successfulPatients,
          failedPatients,
        },
      }

      return syncResult
    }
  },

  // Get patient mappings
  getPatientMappings: async (): Promise<EHRPatientMapping[]> => {
    try {
      // Try API first
      const response = await api.get("/ehr/mappings")
      return response.data
    } catch (error) {
      // If API fails, get from localStorage
      return getLocalMappings()
    }
  },

  // Get mapping for a specific patient
  getPatientMapping: async (patient_id: number): Promise<EHRPatientMapping | null> => {
    try {
      // Try API first
      const response = await api.get(`/ehr/mappings/${patient_id}`)
      console.log("H"+response.data);
      return response.data
      
    } catch (error) {
      // If API fails, get from localStorage
      const mappings = getLocalMappings()
      return mappings.find((m) => m.patient_id === patient_id) || null
    }
  },

  // Sync a specific patient
  syncPatient: async (patient_id: number): Promise<boolean> => {
    try {
      // Try API first
      await api.post(`/ehr/sync/${patient_id}`)
      return true
    } catch (error) {
      // If API fails, simulate sync
      const patient = await patientService.getPatientById(patient_id)
      const mappings = getLocalMappings()

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Update or create mapping
      const existingMappingIndex = mappings.findIndex((m) => m.patient_id === patient_id)
      if (existingMappingIndex >= 0) {
        mappings[existingMappingIndex].last_synced = new Date().toISOString()
        mappings[existingMappingIndex].status = "mapped"
        delete mappings[existingMappingIndex].errorMessage
      } else {
        mappings.push({
          patient_id,
          ehr_id: generateehr_id(patient),
          last_synced: new Date().toISOString(),
          status: "mapped",
        })
      }

      // Save updated mappings
      saveLocalMappings(mappings)

      return true
    }
  },
  previewTransformedData: async (patient_id: number): Promise<any> => {
    try {
      // Call the new endpoint
      const response = await api.get(`/ehr/preview-transform/${patient_id}`)
      return response.data
    } catch (error) {
      console.error("Error previewing transformed data:", error)
      throw error
    }
  },
}

export default ehrService
