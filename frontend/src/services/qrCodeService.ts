import api from "./api"

export interface QRCode {
  qr_id?: number
  patient_id: number
  qr_data: string
  created_at?: string
}

const qrCodeService = {
  getPatientQRCode: async (patientId: string | number): Promise<QRCode> => {
    const response = await api.get(`/qr-codes/${patientId}`)
    return response.data
  },

  createQRCode: async (qrCodeData: QRCode): Promise<{ message: string; qrCode: QRCode }> => {
    const response = await api.post("/qr-codes", qrCodeData)
    return response.data
  },
}

export default qrCodeService

