import api from "./api"

export interface Patient {
  patient_id?: number
  student_id?: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  address?: string
  phone_number: string
  email?: string
  medical_history?: string
  allergies?: string
  status?: string
  created_at?: string
  updated_at?: string
}

const patientService = {
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await api.get("/patients")
    return response.data
  },

  getPatientById: async (id: string | number): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`)
    return response.data
  },

  createPatient: async (patientData: Patient): Promise<{ message: string; patient: Patient }> => {
    const response = await api.post("/patients", patientData)
    return response.data
  },

  updatePatient: async (id: string | number, patientData: Patient): Promise<{ message: string; patient: Patient }> => {
    const response = await api.put(`/patients/${id}`, patientData)
    return response.data
  },

  deletePatient: async (id: string | number): Promise<void> => {
    await api.delete(`/patients/${id}`)
  },

  searchPatients: async (searchTerm: string, gender?: string, status?: string): Promise<Patient[]> => {
    // In a real implementation, you would pass these as query parameters
    // For now, we'll fetch all and filter client-side
    const response = await api.get("/patients")
    let patients = response.data

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      patients = patients.filter(
        (patient: Patient) =>
          patient.first_name.toLowerCase().includes(term) ||
          patient.last_name.toLowerCase().includes(term) ||
          (patient.student_id && patient.student_id.toLowerCase().includes(term)) ||
          (patient.email && patient.email.toLowerCase().includes(term)),
      )
    }

    if (gender && gender !== "all") {
      patients = patients.filter((patient: Patient) => patient.gender === gender)
    }

    if (status && status !== "all") {
      patients = patients.filter((patient: Patient) => patient.status === status)
    }

    return patients
  },
}

export default patientService

