import api from "./api"

export interface Appointment {
  appointment_id?: number
  patient_id: number
  user_id: number
  appointment_date: string
  appointment_type: string
  notes?: string
  status?: string
  patientName?: string
  doctorName?: string
  created_at?: string
  updated_at?: string
}

const appointmentService = {
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get("/appointments")
    return response.data
  },

  getAppointmentById: async (id: string | number): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  createAppointment: async (appointmentData: Appointment): Promise<{ message: string; appointment: Appointment }> => {
    const response = await api.post("/appointments", appointmentData)
    return response.data
  },

  updateAppointment: async (
    id: string | number,
    appointmentData: Appointment,
  ): Promise<{ message: string; appointment: Appointment }> => {
    const response = await api.put(`/appointments/${id}`, appointmentData)
    return response.data
  },

  deleteAppointment: async (id: string | number): Promise<void> => {
    await api.delete(`/appointments/${id}`)
  },

  searchAppointments: async (
    searchTerm: string,
    type?: string,
    status?: string,
    date?: string,
  ): Promise<Appointment[]> => {
    // In a real implementation, you would pass these as query parameters
    // For now, we'll fetch all and filter client-side
    const response = await api.get("/appointments")
    let appointments = response.data

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      appointments = appointments.filter(
        (appointment: Appointment) =>
          (appointment.patientName && appointment.patientName.toLowerCase().includes(term)) ||
          (appointment.doctorName && appointment.doctorName.toLowerCase().includes(term)) ||
          appointment.appointment_type.toLowerCase().includes(term),
      )
    }

    if (type && type !== "all") {
      appointments = appointments.filter((appointment: Appointment) => appointment.appointment_type === type)
    }

    if (status && status !== "all") {
      appointments = appointments.filter((appointment: Appointment) => appointment.status === status)
    }

    if (date) {
      const filterDate = new Date(date)
      appointments = appointments.filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.appointment_date)
        return (
          appointmentDate.getFullYear() === filterDate.getFullYear() &&
          appointmentDate.getMonth() === filterDate.getMonth() &&
          appointmentDate.getDate() === filterDate.getDate()
        )
      })
    }

    return appointments
  },
}

export default appointmentService

