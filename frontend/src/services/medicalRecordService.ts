import api from "./api"

export interface VitalSign {
  vital_id?: number
  record_id?: number
  patient_id: number
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  weight?: number
  blood_sugar?: string
  measured_at: string
  created_at?: string
}

export interface MedicalRecord {
  record_id?: number
  patient_id: number
  user_id: number
  record_date: string
  diagnosis: string
  treatment?: string
  notes?: string
  doctor_name?: string
  patientName?: string
  created_at?: string
  updated_at?: string
  VitalSigns?: VitalSign[]
  vitals?: {
    blood_pressure?: string
    heart_rate?: number
    temperature?: number
    weight?: number
    blood_sugar?: string
  }
}

const medicalRecordService = {
  getAllMedicalRecords: async (): Promise<MedicalRecord[]> => {
    const response = await api.get("/medical-records")
    return response.data
  },

  getMedicalRecordById: async (id: string | number): Promise<MedicalRecord> => {
    const response = await api.get(`/medical-records/${id}`)
    return response.data
  },

  createMedicalRecord: async (recordData: MedicalRecord): Promise<{ message: string; record: MedicalRecord }> => {
    // Extract vital signs data if present
    const medicalRecordData  = recordData

    // First create the medical record
    const response = await api.post("/medical-records", medicalRecordData)

   return response.data
  },

  updateMedicalRecord: async (
    id: string | number,
    recordData: MedicalRecord,
  ): Promise<{ message: string; record: MedicalRecord }> => {
    // Extract vital signs data if present
    const medicalRecordData = recordData

    // First update the medical record
    const response = await api.put(`/medical-records/${id}`, medicalRecordData)

    return response.data
  },

  deleteMedicalRecord: async (id: string | number): Promise<void> => {
    await api.delete(`/medical-records/${id}`)
  },

  searchMedicalRecords: async (searchTerm: string, date?: string): Promise<MedicalRecord[]> => {
    // In a real implementation, you would pass these as query parameters
    // For now, we'll fetch all and filter client-side
    const response = await api.get("/medical-records")
    let records = response.data

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      records = records.filter(
        (record: MedicalRecord) =>
          record.diagnosis.toLowerCase().includes(term) ||
          (record.treatment && record.treatment.toLowerCase().includes(term)) ||
          (record.patientName && record.patientName.toLowerCase().includes(term)) ||
          (record.doctor_name && record.doctor_name.toLowerCase().includes(term)),
      )
    }

    if (date) {
      const filterDate = new Date(date)
      records = records.filter((record: MedicalRecord) => {
        const recordDate = new Date(record.record_date)
        return (
          recordDate.getFullYear() === filterDate.getFullYear() &&
          recordDate.getMonth() === filterDate.getMonth() &&
          recordDate.getDate() === filterDate.getDate()
        )
      })
    }

    return records
  },
}

export default medicalRecordService

