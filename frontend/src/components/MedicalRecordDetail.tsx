"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FiEdit2, FiPrinter, FiArrowLeft } from "react-icons/fi"
import medicalRecordService, { type MedicalRecord, type VitalSign } from "../services/medicalRecordService"
import patientService, { type Patient } from "../services/patientService"
import userService, { type User } from "../services/userService"
import { toast } from "react-hot-toast"

const MedicalRecordDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [doctor, setDoctor] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchMedicalRecordData(id)
    }
  }, [id])

  const fetchMedicalRecordData = async (recordId: string) => {
    try {
      setLoading(true)

      // Get medical record data
      const recordData = await medicalRecordService.getMedicalRecordById(recordId)
      
      setRecord(recordData)

      // Get patient data
      if (recordData.patient_id) {
        const patientData = await patientService.getPatientById(recordData.patient_id)
        setPatient(patientData)
      }

      // Get doctor data
      if (recordData.user_id) {
        const doctorData = await userService.getUserById(recordData.user_id)
        setDoctor(doctorData)
      }

      setError(null)
    } catch (err) {
      setError("Failed to fetch medical record data. Please try again later.")
      console.error("Error fetching medical record data:", err)
      toast.error("Failed to load medical record data")
    } finally {
      setLoading(false)
    }
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

  // Get the first vital sign if available
  const vitalSign: VitalSign | undefined =
    record?.VitalSigns && record.VitalSigns.length > 0 ? record.VitalSigns[0] : undefined
    

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
        {error || "Medical record not found"}
        <div className="mt-4">
          <button
            onClick={() => navigate("/medical-records")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Medical Records
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Medical Record Header */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Medical Record: {record.diagnosis}</h2>
            <div className="flex flex-col md:flex-row md:space-x-4 text-blue-100 mt-2">
              <span>ID: {record.record_id}</span>
              <span>• {formatDateTime(record.record_date)}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to={`/medical-records/${record.record_id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              <FiEdit2 className="inline mr-2" />
              Edit Record
            </Link>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              <FiPrinter className="inline mr-2" />
              Print Record
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medical Record Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Diagnosis & Treatment</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Diagnosis</h4>
                <p className="text-gray-800 font-medium mt-1">{record.diagnosis}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Treatment</h4>
                <p className="text-gray-800 mt-1">{record.treatment || "No treatment specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                <p className="text-gray-800 mt-1">{record.notes || "No additional notes"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Record Date</h4>
                <p className="text-gray-800 mt-1">{formatDateTime(record.record_date)}</p>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vital Signs</h3>
            {vitalSign ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">Blood Pressure</h4>
                  <p className="text-xl font-semibold text-blue-700 mt-1">{vitalSign.blood_pressure || "N/A"}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">Heart Rate</h4>
                  <p className="text-xl font-semibold text-green-700 mt-1">
                    {vitalSign.heart_rate ? `${vitalSign.heart_rate} bpm` : "N/A"}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">Temperature</h4>
                  <p className="text-xl font-semibold text-red-700 mt-1">
                    {vitalSign.temperature ? `${vitalSign.temperature} °C` : "N/A"}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">Weight</h4>
                  <p className="text-xl font-semibold text-purple-700 mt-1">
                    {vitalSign.weight ? `${vitalSign.weight} kg` : "N/A"}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg col-span-2">
                  <h4 className="text-sm font-medium text-gray-700">Blood Sugar</h4>
                  <p className="text-xl font-semibold text-yellow-700 mt-1">{vitalSign.blood_sugar || "N/A"}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No vital signs recorded for this medical record</p>
            )}
          </div>

          {/* Patient Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
            {patient ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">
                    <Link to={`/patients/${patient.patient_id}`} className="text-blue-600 hover:underline">
                      {patient.first_name} {patient.last_name}
                    </Link>
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">ID</span>
                  <span className="font-medium text-gray-600">{patient.patient_id || "N/A"}</span>
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
                  <span className="text-gray-500">Medical History</span>
                  <span className="font-medium text-gray-600">{patient.medical_history || "None"}</span>
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

          {/* Healthcare Provider */}
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

          {/* Related Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Related Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link
                to={`/prescriptions/new?patientId=${record.patient_id}`}
                className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700 transition-colors"
              >
                Create Prescription
              </Link>
              <Link
                to={`/appointments/schedule?patientId=${record.patient_id}`}
                className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
              >
                Schedule Follow-up
              </Link>
              <Link
                to={`/billings/new?patientId=${record.patient_id}`}
                className="block w-full px-4 py-2 bg-yellow-600 text-white text-center rounded-md hover:bg-yellow-700 transition-colors"
              >
                Create Bill
              </Link>
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

export default MedicalRecordDetail

