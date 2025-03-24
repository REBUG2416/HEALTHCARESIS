import api from "./api"

export interface Billing {
  billing_id?: number
  patient_id: number
  invoice_number: string
  service_description?: string
  amount: number
  tax?: number
  discount?: number
  total_amount: number
  payment_status?: string
  payment_date?: string
  due_date?: string
  notes?: string
  patientName?: string
  created_at?: string
  updated_at?: string
}

const billingService = {
  getAllBillings: async (): Promise<Billing[]> => {
    const response = await api.get("/billings")
    return response.data
  },

  getBillingById: async (id: string | number): Promise<Billing> => {
    const response = await api.get(`/billings/${id}`)
    return response.data
  },

  createBilling: async (billingData: Billing): Promise<{ message: string; billing: Billing }> => {
    const response = await api.post("/billings", billingData)
    return response.data
  },

  updateBilling: async (id: string | number, billingData: Billing): Promise<{ message: string; billing: Billing }> => {
    const response = await api.put(`/billings/${id}`, billingData)
    return response.data
  },

  deleteBilling: async (id: string | number): Promise<void> => {
    await api.delete(`/billings/${id}`)
  },
}

export default billingService

