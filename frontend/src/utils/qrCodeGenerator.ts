import QRCode from "qrcode"

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const url = await QRCode.toDataURL(data)
    return url
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

export const generatePatientQRCode = async (patientId: string): Promise<string> => {
  const data = JSON.stringify({
    type: "patient",
    id: patientId,
    timestamp: new Date().toISOString(),
  })
  return generateQRCode(data)
}

export const generateAppointmentQRCode = async (appointmentId: string): Promise<string> => {
  const data = JSON.stringify({
    type: "appointment",
    id: appointmentId,
    timestamp: new Date().toISOString(),
  })
  return generateQRCode(data)
}

export const generatePrescriptionQRCode = async (prescriptionId: string): Promise<string> => {
  const data = JSON.stringify({
    type: "prescription",
    id: prescriptionId,
    timestamp: new Date().toISOString(),
  })
  return generateQRCode(data)
}

