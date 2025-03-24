"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FiEdit2, FiPrinter, FiArrowLeft } from "react-icons/fi"
import appointmentService, { type Appointment } from "../services/appointmentService"
import patientService, { type Patient } from "../services/patientService"
import userService, { type User } from "../services/userService"
import { generateAppointmentQRCode } from "../utils/qrCodeGenerator"
import { toast } from "react-hot-toast"

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [doctor, setDoctor] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      fetchAppointmentData(id)
      generateQRCode(id)
    }
  }, [id])

  const generateQRCode = async (appointmentId: string) => {
    try {
      const qrCodeUrl = await generateAppointmentQRCode(appointmentId)
      setQrCode(qrCodeUrl)
    } catch (err) {
      console.error("Error generating QR code:", err)
      toast.error("Failed to generate QR code")
    }
  }

  const fetchAppointmentData = async (appointmentId: string) => {
    try {
      setLoading(true)

      // Get appointment details
      const appointmentData = await appointmentService.getAppointmentById(appointmentId)
      setAppointment(appointmentData)

      // Get patient data
      if (appointmentData.patient_id) {
        const patientData = await patientService.getPatientById(appointmentData.patient_id)
        setPatient(patientData)
      }

      // Get doctor data
      if (appointmentData.user_id) {
        const doctorData = await userService.getUserById(appointmentData.user_id)
        setDoctor(doctorData)
      }

      setError(null)
    } catch (err) {
      setError("Failed to fetch appointment data. Please try again later.")
      console.error("Error fetching appointment data:", err)
      toast.error("Failed to load appointment data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (appointment && id) {
      try {
        const updatedAppointment = {
          ...appointment,
          status: newStatus,
        }

        await appointmentService.updateAppointment(id, updatedAppointment)
        setAppointment(updatedAppointment)
        toast.success(`Appointment status updated to ${newStatus}`)
      } catch (err) {
        console.error("Error updating appointment status:", err)
        toast.error("Failed to update appointment status")
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
        {error || "Appointment not found"}
        <div className="mt-4">
          <button
            onClick={() => navigate("/appointments")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Appointment Header */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Appointment Details</h2>
            <div className="flex flex-col md:flex-row md:space-x-4 text-blue-100 mt-2">
              <span>ID: {appointment.appointment_id}</span>
              <span>• {formatDateTime(appointment.appointment_date)}</span>
              <span>• {appointment.appointment_type}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to={`/appointments/${appointment.appointment_id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              <FiEdit2 className="inline mr-2" />
              Edit Appointment
            </Link>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              <FiPrinter className="inline mr-2" />
              Print Details
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Appointment Information */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-600">{appointment.appointment_type}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-medium text-gray-600">{formatDateTime(appointment.appointment_date)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${
                      appointment.status === "Scheduled"
                        ? "text-blue-600"
                        : appointment.status === "Completed"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Notes</span>
                  <span className="font-medium text-gray-600">{appointment.notes || "No notes"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Created At</span>
                  <span className="font-medium text-gray-600">
                    {appointment.created_at ? formatDateTime(appointment.created_at) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
              {patient ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-600">
                      <Link to={`/patients/${patient.patient_id}`} className="text-blue-600 hover:underline">
                        {patient.first_name} {patient.last_name}
                      </Link>
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">ID</span>
                    <span className="font-medium text-gray-600">{patient.student_id || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium text-gray-600">{patient.gender}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Contact</span>
                    <span className="font-medium text-gray-600">{patient.phone_number}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-600">{patient.email || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Patient information not available</p>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Healthcare Provider</h3>
              {doctor ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-600">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-gray-600">{doctor.role}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-600">{doctor.email}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-600">{doctor.phone_number || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Healthcare provider information not available</p>
              )}
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment QR Code</h3>
              <div className="flex flex-col items-center">
                {qrCode ? (
                  <img src={qrCode || "/placeholder.svg"} alt="Appointment QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">QR Code not available</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">Scan for appointment verification</p>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                >
                  View Full Size
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                {appointment.status === "Scheduled" && (
                  <>
                    <button
                      onClick={() => handleStatusChange("Completed")}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange("Cancelled")}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
                {appointment.status === "Completed" && (
                  <Link
                    to={`/medical-records/new?patientId=${appointment.patient_id}`}
                    className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Medical Record
                  </Link>
                )}
                {appointment.status === "Cancelled" && (
                  <button
                    onClick={() => handleStatusChange("Scheduled")}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Reschedule Appointment
                  </button>
                )}
                <Link
                  to={`/prescriptions/new?patientId=${appointment.patient_id}`}
                  className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700 transition-colors"
                >
                  Create Prescription
                </Link>
                <Link
                  to={`/billings/new?patientId=${appointment.patient_id}`}
                  className="block w-full px-4 py-2 bg-yellow-600 text-white text-center rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Create Bill
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <FiArrowLeft className="inline mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Appointment QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="flex justify-center mb-4">
              {qrCode ? (
                <img src={qrCode || "/placeholder.svg"} alt="Appointment QR Code" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Loading QR code...</p>
                </div>
              )}
            </div>
            <div className="pt-4">
              <div className="mb-2">
                <p className="text-sm text-gray-500">Appointment</p>
                <p className="font-medium">#{appointment.appointment_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium">{patient ? `${patient.first_name} ${patient.last_name}` : "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">{formatDateTime(appointment.appointment_date)}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <FiPrinter className="inline mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentDetail

