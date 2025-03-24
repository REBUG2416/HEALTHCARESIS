import api from "./api"

export interface Prescription {
  prescription_id?: number
  patient_id: number
  user_id: number
  prescription_date: string
  medication: string
  dosage: string
  frequency?: string
  start_date: string
  end_date?: string
  instructions?: string
  status?: string
  patientName?: string
  doctorName?: string
  created_at?: string
  updated_at?: string
}

const prescriptionService = {
  getAllPrescriptions: async (): Promise<Prescription[]> => {
    const response = await api.get("/prescriptions")
    return response.data
  },

  getPrescriptionById: async (id: string | number): Promise<Prescription> => {
    const response = await api.get(`/prescriptions/${id}`)
    return response.data
  },

  createPrescription: async (
    prescriptionData: Prescription,
  ): Promise<{ message: string; prescription: Prescription }> => {
    const response = await api.post("/prescriptions", prescriptionData)
    return response.data
  },

  updatePrescription: async (
    id: string | number,
    prescriptionData: Prescription,
  ): Promise<{ message: string; prescription: Prescription }> => {
    const response = await api.put(`/prescriptions/${id}`, prescriptionData)
    return response.data
  },

  deletePrescription: async (id: string | number): Promise<void> => {
    await api.delete(`/prescriptions/${id}`)
  },

  searchPrescriptions: async (searchTerm: string, status?: string): Promise<Prescription[]> => {
    // In a real implementation, you would pass these as query parameters
    // For now, we'll fetch all and filter client-side
    const response = await api.get("/prescriptions")
    let prescriptions = response.data

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      prescriptions = prescriptions.filter(
        (prescription: Prescription) =>
          prescription.medication.toLowerCase().includes(term) ||
          (prescription.patientName && prescription.patientName.toLowerCase().includes(term)),
      )
    }

    if (status && status !== "all") {
      prescriptions = prescriptions.filter((prescription: Prescription) => prescription.status === status)
    }

    return prescriptions
  },
}

export default prescriptionService

