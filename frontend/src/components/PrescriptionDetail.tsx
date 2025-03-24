"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FiEdit2, FiPrinter, FiArrowLeft } from "react-icons/fi"
import prescriptionService, { type Prescription } from "../services/prescriptionService"
import patientService, { type Patient } from "../services/patientService"
import userService, { type User } from "../services/userService"
import { generatePrescriptionQRCode } from "../utils/qrCodeGenerator"
import { toast } from "react-hot-toast"

const PrescriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [doctor, setDoctor] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchPrescriptionData(id)
      generateQRCode(id)
    }
  }, [id])

  const generateQRCode = async (prescriptionId: string) => {
    try {
      const qrCodeUrl = await generatePrescriptionQRCode(prescriptionId)
      setQrCode(qrCodeUrl)
    } catch (err) {
      console.error("Error generating QR code:", err)
      toast.error("Failed to generate QR code")
    }
  }

  const fetchPrescriptionData = async (prescriptionId: string) => {
    try {
      setLoading(true)

      // Get prescription details
      const prescriptionData = await prescriptionService.getPrescriptionById(prescriptionId)
      setPrescription(prescriptionData)

      // Get patient data
      if (prescriptionData.patient_id) {
        const patientData = await patientService.getPatientById(prescriptionData.patient_id)
        setPatient(patientData)
      }

      // Get doctor data
      if (prescriptionData.user_id) {
        const doctorData = await userService.getUserById(prescriptionData.user_id)
        setDoctor(doctorData)
      }

      setError(null)
    } catch (err) {
      setError("Failed to fetch prescription data. Please try again later.")
      console.error("Error fetching prescription data:", err)
      toast.error("Failed to load prescription data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (prescription && id) {
      try {
        const updatedPrescription = {
          ...prescription,
          status: newStatus,
        }

        await prescriptionService.updatePrescription(id, updatedPrescription)
        setPrescription(updatedPrescription)
        toast.success(`Prescription status updated to ${newStatus}`)
      } catch (err) {
        console.error("Error updating prescription status:", err)
        toast.error("Failed to update prescription status")
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !prescription) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
        {error || "Prescription not found"}
        <div className="mt-4">
          <button
            onClick={() => navigate("/prescriptions")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Prescriptions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Prescription Header */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Prescription: {prescription.medication}</h2>
            <div className="flex flex-col md:flex-row md:space-x-4 text-blue-100 mt-2">
              <span>ID: {prescription.prescription_id}</span>
              <span>• {formatDate(prescription.prescription_date)}</span>
              <span>• {prescription.status}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to={`/prescriptions/${prescription.prescription_id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              <FiEdit2 className="inline mr-2" />
              Edit Prescription
            </Link>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              <FiPrinter className="inline mr-2" />
              Print Prescription
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Prescription Information */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medication Details</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Medication</span>
                  <span className="font-medium text-gray-600">{prescription.medication}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Dosage</span>
                  <span className="font-medium text-gray-600">{prescription.dosage}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Frequency</span>
                  <span className="font-medium text-gray-600">{prescription.frequency || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium text-gray-600">{formatDate(prescription.start_date)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">End Date</span>
                  <span className="font-medium text-gray-600">
                    {prescription.end_date ? formatDate(prescription.end_date) : "Ongoing"}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${prescription.status === "Active" ? "text-green-600" : "text-gray-600"}`}
                  >
                    {prescription.status}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Instructions</span>
                  <span className="font-medium text-gray-600">
                    {prescription.instructions || "No specific instructions"}
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
                    <span className="text-gray-500">Allergies</span>
                    <span className="font-medium text-gray-600">{patient.allergies || "None"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Patient information not available</p>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prescribing Doctor</h3>
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
                <p className="text-gray-500">Doctor information not available</p>
              )}
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Prescription QR Code</h3>
              <div className="flex flex-col items-center">
                {qrCode ? (
                  <img src={qrCode || "/placeholder.svg"} alt="Prescription QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">QR Code not available</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">Scan for prescription verification</p>
                <button
                  onClick={() => window.open(qrCode || "", "_blank")}
                  className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                >
                  View Full Size
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                {prescription.status === "Active" && (
                  <button
                    onClick={() => handleStatusChange("Completed")}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                {prescription.status === "Completed" && (
                  <button
                    onClick={() => handleStatusChange("Active")}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Reactivate Prescription
                  </button>
                )}
                <Link
                  to={`/billings/new?patientId=${prescription.patient_id}`}
                  className="block w-full px-4 py-2 bg-yellow-600 text-white text-center rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Create Bill
                </Link>
                <Link
                  to={`/medical-records/new?patientId=${prescription.patient_id}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Medical Record
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
    </div>
  )
}

export default PrescriptionDetail

