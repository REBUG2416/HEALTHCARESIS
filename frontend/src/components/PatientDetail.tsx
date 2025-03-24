"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FiEdit2, FiCalendar, FiFileText, FiDollarSign, FiArrowLeft } from "react-icons/fi"
import patientService, { type Patient } from "../services/patientService"
import appointmentService, { type Appointment } from "../services/appointmentService"
import prescriptionService, { type Prescription } from "../services/prescriptionService"
import medicalRecordService, { type MedicalRecord } from "../services/medicalRecordService"
import billingService, { type Billing } from "../services/billingService"
import { generatePatientQRCode } from "../utils/qrCodeGenerator"
import qrCodeService from "../services/qrCodeService"
import { toast } from "react-hot-toast"

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([])
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([])
  const [patientMedicalRecords, setPatientMedicalRecords] = useState<MedicalRecord[]>([])
  const [patientBillings, setPatientBillings] = useState<Billing[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchPatientData(id)
      generateQRCode(id)
    }
  }, [id])

  const generateQRCode = async (patientId: string) => {
    try {
      // First try to get existing QR code from the database
      try {
        const qrCodeData = await qrCodeService.getPatientQRCode(patientId)
        setQrCode(qrCodeData.qr_data)
      } catch (err) {
        // If no QR code exists, generate a new one
        const qrCodeUrl = await generatePatientQRCode(patientId)
        setQrCode(qrCodeUrl)

        // Save the generated QR code to the database
        await qrCodeService.createQRCode({
          patient_id: Number.parseInt(patientId),
          qr_data: qrCodeUrl,
        })
      }
    } catch (err) {
      console.error("Error generating QR code:", err)
      toast.error("Failed to generate QR code")
    }
  }

  const fetchPatientData = async (patientId: string) => {
    try {
      setLoading(true)

      // Get patient details
      const patientData = await patientService.getPatientById(patientId)
      setPatient(patientData)

      // Get patient appointments
      const appointments = await appointmentService.getAllAppointments()
      const filteredAppointments = appointments.filter(
        (appointment) => appointment.patient_id === Number.parseInt(patientId),
      )
      setPatientAppointments(filteredAppointments)

      // Get patient prescriptions
      const prescriptions = await prescriptionService.getAllPrescriptions()
      const filteredPrescriptions = prescriptions.filter(
        (prescription) => prescription.patient_id === Number.parseInt(patientId),
      )
      setPatientPrescriptions(filteredPrescriptions)

      // Get patient medical records
      const records = await medicalRecordService.getAllMedicalRecords()
      const filteredRecords = records.filter((record) => record.patient_id === Number.parseInt(patientId))
      setPatientMedicalRecords(filteredRecords)

      // Get patient billings
      const billings = await billingService.getAllBillings()
      const filteredBillings = billings.filter((billing) => billing.patient_id === Number.parseInt(patientId))
      setPatientBillings(filteredBillings)

      setError(null)
    } catch (err) {
      setError("Failed to fetch patient data. Please try again later.")
      console.error("Error fetching patient data:", err)
      toast.error("Failed to load patient data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Get the most recent vital signs from medical records
  const getLatestVitalSigns = () => {
    if (patientMedicalRecords.length === 0) return null

    // Sort records by date (newest first)
    const sortedRecords = [...patientMedicalRecords].sort(
      (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime(),
    )

    // Find the first record with vital signs
    for (const record of sortedRecords) {
      console.log(record);
      if (record.VitalSigns && record.VitalSigns.length > 0) {
        return {
          vitalSigns: record.VitalSigns[0],
          recordDate: record.record_date,
          recordId: record.record_id,
        }
      }
    }

    return null
  }

  const latestVitalSigns = getLatestVitalSigns()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
        {error || "Patient not found"}
        <div className="mt-4">
          <button
            onClick={() => navigate("/patients")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Patients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Patient Header */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {patient.first_name} {patient.last_name}
            </h2>
            <div className="flex flex-col md:flex-row md:space-x-4 text-blue-100 mt-2">
              <span>ID: {patient.student_id || "N/A"}</span>
              <span>• {patient.gender}</span>
              <span>• {calculateAge(patient.date_of_birth)} years</span>
              <span>• {patient.status}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to={`/patients/${patient.patient_id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              <FiEdit2 className="inline mr-2" />
              Edit Patient
            </Link>
            <Link
              to={`/appointments/schedule?patientId=${patient.patient_id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
            >
              <FiCalendar className="inline mr-2" />
              Schedule Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "overview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "appointments"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Appointments ({patientAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "prescriptions"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Prescriptions ({patientPrescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("medical-records")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "medical-records"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Medical Records ({patientMedicalRecords.length})
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "billing"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Billing ({patientBillings.length})
          </button>
          <button
            onClick={() => setActiveTab("qr-code")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === "qr-code"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            QR Code
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-medium text-gray-600">
                    {patient.first_name} {patient.last_name}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Student ID</span>
                  <span className="font-medium text-gray-600">{patient.student_id || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Date of Birth</span>
                  <span className="font-medium text-gray-600">
                    {formatDate(patient.date_of_birth)} ({calculateAge(patient.date_of_birth)} years)
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Gender</span>
                  <span className="font-medium text-gray-600">{patient.gender}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${patient.status === "Active" ? "text-green-600" : "text-gray-600"}`}>
                    {patient.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-600">{patient.email || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium text-gray-600">{patient.phone_number}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-gray-600">{patient.address || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Latest Vital Signs</h3>
                {latestVitalSigns && (
                  <Link
                    to={`/medical-records/${latestVitalSigns.recordId}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Record
                  </Link>
                )}
              </div>

              {latestVitalSigns ? (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Recorded on {formatDate(latestVitalSigns.recordDate)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700">Blood Pressure</h4>
                      <p className="text-xl font-semibold text-blue-700 mt-1">
                        {latestVitalSigns.vitalSigns.blood_pressure || "N/A"}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700">Heart Rate</h4>
                      <p className="text-xl font-semibold text-green-700 mt-1">
                        {latestVitalSigns.vitalSigns.heart_rate
                          ? `${latestVitalSigns.vitalSigns.heart_rate} bpm`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700">Temperature</h4>
                      <p className="text-xl font-semibold text-red-700 mt-1">
                        {latestVitalSigns.vitalSigns.temperature
                          ? `${latestVitalSigns.vitalSigns.temperature} °C`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700">Weight</h4>
                      <p className="text-xl font-semibold text-purple-700 mt-1">
                        {latestVitalSigns.vitalSigns.weight ? `${latestVitalSigns.vitalSigns.weight} kg` : "N/A"}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg col-span-2">
                      <h4 className="text-sm font-medium text-gray-700">Blood Sugar</h4>
                      <p className="text-xl font-semibold text-yellow-700 mt-1">
                        {latestVitalSigns.vitalSigns.blood_sugar || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No vital signs recorded for this patient.</p>
                  <Link
                    to={`/medical-records/new?patientId=${patient.patient_id}`}
                    className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                  >
                    Add Medical Record with Vital Signs
                  </Link>
                </div>
              )}
            </div>

            {/* Medical Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Medical History</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                    {patient.medical_history || "No medical history recorded."}
                  </p>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Allergies</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                    {patient.allergies || "No allergies recorded."}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>

              {patientAppointments.length === 0 &&
              patientPrescriptions.length === 0 &&
              patientMedicalRecords.length === 0 ? (
                <p className="text-gray-500">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {/* Recent Appointments */}
                  {patientAppointments.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">Recent Appointments</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Doctor
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {patientAppointments.slice(0, 3).map((appointment) => (
                              <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {formatDateTime(appointment.appointment_date)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.appointment_type}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {appointment.doctorName || "Unknown Doctor"}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      appointment.status === "Scheduled"
                                        ? "bg-blue-100 text-blue-800"
                                        : appointment.status === "Completed"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {appointment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {patientAppointments.length > 3 && (
                        <div className="mt-2 text-right">
                          <button
                            onClick={() => setActiveTab("appointments")}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View all appointments
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recent Prescriptions */}
                  {patientPrescriptions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-700 mb-2">Active Prescriptions</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Medication
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dosage
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {patientPrescriptions
                              .filter((p) => p.status === "Active")
                              .slice(0, 3)
                              .map((prescription) => (
                                <tr key={prescription.prescription_id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {prescription.medication}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {prescription.dosage}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        prescription.status === "Active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {prescription.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      {patientPrescriptions.length > 3 && (
                        <div className="mt-2 text-right">
                          <button
                            onClick={() => setActiveTab("prescriptions")}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View all prescriptions
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
              <Link
                to={`/appointments/schedule?patientId=${patient.patient_id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
              >
                <FiCalendar className="inline mr-2" />
                Schedule New Appointment
              </Link>
            </div>

            {patientAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments found for this patient.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patientAppointments.map((appointment) => (
                      <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(appointment.appointment_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.appointment_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.doctorName || "Unknown Doctor"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              appointment.status === "Scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {appointment.notes || "No notes"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/appointments/${appointment.appointment_id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link
                              to={`/appointments/${appointment.appointment_id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === "prescriptions" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Prescriptions</h3>
              <Link
                to={`/prescriptions/new?patientId=${patient.patient_id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
              >
                <FiFileText className="inline mr-2" />
                Add New Prescription
              </Link>
            </div>

            {patientPrescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No prescriptions found for this patient.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medication
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dosage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patientPrescriptions.map((prescription) => (
                      <tr key={prescription.prescription_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.medication}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.dosage}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(prescription.start_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prescription.end_date ? formatDate(prescription.end_date) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              prescription.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {prescription.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/prescriptions/${prescription.prescription_id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <Link
                              to={`/prescriptions/${prescription.prescription_id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === "medical-records" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Medical Records</h3>
              <Link
                to={`/medical-records/new?patientId=${patient.patient_id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
              >
                <FiFileText className="inline mr-2" />
                Add New Record
              </Link>
            </div>

            {patientMedicalRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No medical records found for this patient.</div>
            ) : (
              <div className="space-y-4">
                {patientMedicalRecords.map((record) => (
                  <div key={record.record_id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-medium text-gray-800">{record.diagnosis}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(record.record_date)} • {record.doctor_name || "Unknown Doctor"}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Link
                          to={`/medical-records/${record.record_id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Vital Signs Summary */}
                    {record.VitalSigns && record.VitalSigns.length > 0 && (
                      <div className="mt-2 bg-gray-50 p-3 rounded-md">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Vital Signs</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {record.VitalSigns[0].blood_pressure && (
                            <div>
                              <span className="text-gray-500">BP:</span>{" "}
                              <span className="font-medium">{record.VitalSigns[0].blood_pressure}</span>
                            </div>
                          )}
                          {record.VitalSigns[0].temperature && (
                            <div>
                              <span className="text-gray-500">Temp:</span>{" "}
                              <span className="font-medium">{record.VitalSigns[0].temperature}°C</span>
                            </div>
                          )}
                          {record.VitalSigns[0].heart_rate && (
                            <div>
                              <span className="text-gray-500">HR:</span>{" "}
                              <span className="font-medium">{record.VitalSigns[0].heart_rate} bpm</span>
                            </div>
                          )}
                          {record.VitalSigns[0].weight && (
                            <div>
                              <span className="text-gray-500">Weight:</span>{" "}
                              <span className="font-medium">{record.VitalSigns[0].weight} kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-700">Treatment</h5>
                      <p className="text-sm text-gray-600 mt-1">{record.treatment || "No treatment specified"}</p>
                    </div>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-700">Notes</h5>
                      <p className="text-sm text-gray-600 mt-1">{record.notes || "No notes"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Billing History</h3>
              <Link
                to={`/billings/new?patientId=${patient.patient_id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
              >
                <FiDollarSign className="inline mr-2" />
                Create New Bill
              </Link>
            </div>

            {patientBillings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No billing records found for this patient.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patientBillings.map((billing) => (
                      <tr key={billing.billing_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{billing.billing_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {billing.created_at ? formatDate(billing.created_at) : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {billing.service_description || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${billing.total_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              billing.payment_status === "Paid"
                                ? "bg-green-100 text-green-800"
                                : billing.payment_status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {billing.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link to={`/billings/${billing.billing_id}`} className="text-blue-600 hover:text-blue-900">
                              View
                            </Link>
                            {billing.payment_status === "Pending" && (
                              <Link
                                to={`/billings/${billing.billing_id}/pay`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Pay
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === "qr-code" && (
          <div className="flex flex-col items-center justify-center py-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Patient QR Code</h3>

            {qrCode ? (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="mb-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Scan this QR code to access patient information</p>
                  <p className="font-medium">
                    {patient.first_name} {patient.last_name} - {patient.student_id || "N/A"}
                  </p>
                </div>

                <div className="border border-gray-200 p-4 rounded-md flex justify-center">
                  <img src={qrCode || "/placeholder.svg"} alt="Patient QR Code" className="w-64 h-64" />
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      // Create a temporary link element
                      const link = document.createElement("a")
                      link.href = qrCode
                      link.download = `patient-${patient.patient_id}-qrcode.png`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Download QR Code
                  </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>This QR code contains a secure link to this patient's records.</p>
                  <p className="mt-1">
                    When scanned by authorized personnel, it will provide immediate access to the patient's information.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          <FiArrowLeft className="inline mr-2" />
          Back
        </button>
      </div>
    </div>
  )
}

export default PatientDetail

