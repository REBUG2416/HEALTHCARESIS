import axios from "axios"

// Service for sending notifications (email and SMS)
export const notificationService = {
  // Send email notification
  sendEmail: async (recipientEmail: string, subject: string, body: string) => {
    try {
      const response = await axios.post("/api/notifications/email", {
        to: recipientEmail,
        subject,
        body,
      })
      return response.data
    } catch (error) {
      console.error("Error sending email:", error)
      throw error
    }
  },

  // Send SMS notification
  sendSMS: async (phoneNumber: string, message: string) => {
    try {
      const response = await axios.post("/api/notifications/sms", {
        to: phoneNumber,
        message,
      })
      return response.data
    } catch (error) {
      console.error("Error sending SMS:", error)
      throw error
    }
  },

  // Send appointment reminder (both email and SMS if available)
  sendAppointmentReminder: async (appointment: any) => {
    try {
      const patient = appointment.patient || {}
      const appointmentDate = new Date(appointment.appointment_date)
      const formattedDate = appointmentDate.toLocaleDateString()
      const formattedTime = appointmentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })

      const subject = "Appointment Reminder"
      const body = `
        Dear ${patient.first_name} ${patient.last_name},
        
        This is a reminder about your upcoming appointment:
        Date: ${formattedDate}
        Time: ${formattedTime}
        Type: ${appointment.appointment_type}
        Doctor: ${appointment.doctorName}
        
        Please arrive 15 minutes before your scheduled appointment.
        If you need to reschedule, please contact us as soon as possible.
        
        Thank you,
        Healthcare SIS Team
      `

      const smsMessage = `Reminder: You have an appointment on ${formattedDate} at ${formattedTime} with ${appointment.doctorName}. Type: ${appointment.appointment_type}`

      // Send email if patient has email
      if (patient.email) {
        await notificationService.sendEmail(patient.email, subject, body)
      }

      // Send SMS if patient has phone number
      if (patient.phone_number) {
        await notificationService.sendSMS(patient.phone_number, smsMessage)
      }

      return { success: true }
    } catch (error) {
      console.error("Error sending appointment reminder:", error)
      throw error
    }
  },
}

