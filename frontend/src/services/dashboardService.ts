import api from "./api"

export interface DashboardStats {
  totalPatients: number
  activePatients: number
  totalAppointments: number
  upcomingAppointments: number
  activePrescriptions: number
  totalUsers: number
  totalDoctors: number
}

const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/dashboard/stats")
    return response.data
  },
}

export default dashboardService

