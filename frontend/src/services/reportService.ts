import api from "./api"

export interface Report {
  report_id?: number
  user_id: number
  report_type: string
  report_name: string
  start_date?: string
  end_date?: string
  parameters?: string
  userName?: string
  created_at?: string
}

const reportService = {
  getAllReports: async (): Promise<Report[]> => {
    const response = await api.get("/reports")
    return response.data
  },

  createReport: async (reportData: Report): Promise<{ message: string; report: Report }> => {
    const response = await api.post("/reports", reportData)
    return response.data
  },
}

export default reportService

