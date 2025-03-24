"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiSave, FiArrowLeft } from "react-icons/fi"
import medicalRecordService, { type MedicalRecord } from "../services/medicalRecordService"
import patientService, { type Patient } from "../services/patientService"
import userService, { type User } from "../services/userService"
import authService from "../services/authService"

const MedicalRecordForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const patientIdFromQuery = queryParams.get("patientId")

  const isEditMode = !!id

  const [formData, setFormData] = useState<MedicalRecord>({
    patient_id: patientIdFromQuery ? Number.parseInt(patientIdFromQuery) : 0,
    user_id: 0,
    record_date: new Date().toISOString().split("T")[0],
    diagnosis: "",
    treatment: "",
    doctor_name:"",
    notes: "",
    vitals: {
      blood_pressure: "",
      heart_rate: undefined,
      temperature: undefined,
      weight: undefined,
      blood_sugar: "",
    },
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [initialLoading, setInitialLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true)

        // Fetch patients
        const patientsData = await patientService.getAllPatients()
        setPatients(patientsData)

        // Fetch doctors (users with role 'doctor')
        const usersData = await userService.getAllUsers()
        const doctorsData = usersData.filter((user) => user.role === "doctor")
        setDoctors(doctorsData)

        // If editing, fetch medical record data
        if (isEditMode && id) {
          const recordData = await medicalRecordService.getMedicalRecordById(id)

          // Format date for date input (YYYY-MM-DD)
          const recordDate = new Date(recordData.record_date)
          const formattedDate = recordDate.toISOString().split("T")[0]

          // Extract vital signs if available
          const vitalSigns =
            recordData.VitalSigns && recordData.VitalSigns.length > 0 ? recordData.VitalSigns[0] : undefined

          setFormData({
            ...recordData,
            record_date: formattedDate,
            vitals: {
              blood_pressure: vitalSigns?.blood_pressure || "",
              heart_rate: vitalSigns?.heart_rate,
              temperature: vitalSigns?.temperature,
              weight: vitalSigns?.weight,
              blood_sugar: vitalSigns?.blood_sugar || "",
            },
          })
        } else {
          // Set default user_id to current user if they are a doctor
          const currentUser = authService.getCurrentUser()
          if (currentUser && currentUser.role === "doctor") {
            setFormData((prev) => ({
              ...prev,
              user_id: currentUser.id,
            }))
          }
        }

        setError(null)
      } catch (err) {
        setError("Failed to load form data. Please try again later.")
        console.error("Error loading form data:", err)
        toast.error("Failed to load form data")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchInitialData()
  }, [id, isEditMode, patientIdFromQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.startsWith("vitals.")) {
      const vitalKey = name.split(".")[1] as keyof typeof formData.vitals
      setFormData((prev) => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [vitalKey]:
            value === ""
              ? undefined
              : vitalKey === "heart_rate" || vitalKey === "temperature" || vitalKey === "weight"
                ? Number.parseFloat(value)
                : value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "patient_id" || name === "user_id" ? Number.parseInt(value) : value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient_id || !formData.user_id || !formData.record_date || !formData.diagnosis) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
const doctorData = await userService.getUserById(formData.user_id)

      // Prepare data for submission - IMPORTANT: Don't include VitalSigns here
      // We'll handle them separately after creating/updating the medical record
      const recordData: MedicalRecord = {
        patient_id: formData.patient_id,
        user_id: formData.user_id,
        record_date: formData.record_date,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        doctor_name: "Dr. "+doctorData.first_name+" "+doctorData.last_name,
        notes: formData.notes,
        vitals: {
          blood_pressure: formData.vitals.blood_pressure || "",
          heart_rate: formData.vitals.heart_rate,
          temperature: formData.vitals.temperature,
          weight: formData.vitals.weight,
          blood_sugar: formData.vitals.blood_sugar || "",
        }
      }

      let savedRecord: MedicalRecord

      if (isEditMode && id) {

        // Update the medical record
        const response = await medicalRecordService.updateMedicalRecord(id, recordData)
        savedRecord = response.record

        // Now update the vital signs separately
        // In a real implementation, you would have an API endpoint to update vital signs
        // For now, we'll assume the backend handles this correctly
        toast.success("Medical record updated successfully")
      } else {
        // Create the medical record first
        const response = await medicalRecordService.createMedicalRecord(recordData)
        savedRecord = response.record

        // Now create the vital signs with the new record_id
        // In a real implementation, you would have an API endpoint to create vital signs
        // For now, we'll assume the backend handles this correctly
        toast.success("Medical record created successfully")
      }

      navigate("/medical-records")
    } catch (err) {
      console.error("Error saving medical record:", err)
      toast.error(isEditMode ? "Failed to update medical record" : "Failed to create medical record")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-700">
          {isEditMode ? "EDIT MEDICAL RECORD" : "ADD NEW MEDICAL RECORD"}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {isEditMode ? "Update medical record details" : "Create a new medical record"}
        </p>
      </div>

      {error && <div className="mx-4 bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
              disabled={!!patientIdFromQuery}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
              Doctor *
            </label>
            <select
              id="user_id"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.user_id} value={doctor.user_id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="record_date" className="block text-sm font-medium text-gray-700 mb-1">
            Record Date *
          </label>
          <input
            type="date"
            id="record_date"
            name="record_date"
            value={formData.record_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Vital Signs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="vitals.blood_pressure" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Pressure
              </label>
              <input
                type="text"
                id="vitals.blood_pressure"
                name="vitals.blood_pressure"
                value={formData.vitals?.blood_pressure || ""}
                onChange={handleChange}
                placeholder="e.g. 120/80"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="vitals.heart_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                id="vitals.heart_rate"
                name="vitals.heart_rate"
                value={formData.vitals?.heart_rate || ""}
                onChange={handleChange}
                placeholder="e.g. 75"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="vitals.temperature" className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                id="vitals.temperature"
                name="vitals.temperature"
                value={formData.vitals?.temperature || ""}
                onChange={handleChange}
                placeholder="e.g. 37.0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="vitals.weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                id="vitals.weight"
                name="vitals.weight"
                value={formData.vitals?.weight || ""}
                onChange={handleChange}
                placeholder="e.g. 70"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="vitals.blood_sugar" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Sugar
              </label>
              <input
                type="text"
                id="vitals.blood_sugar"
                name="vitals.blood_sugar"
                value={formData.vitals?.blood_sugar || ""}
                onChange={handleChange}
                placeholder="e.g. 100 mg/dL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
            Diagnosis *
          </label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
            Treatment
          </label>
          <textarea
            id="treatment"
            name="treatment"
            value={formData.treatment || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          ></textarea>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <FiArrowLeft className="inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <FiSave className="inline mr-2" />
            {loading ? (isEditMode ? "Updating..." : "Saving...") : isEditMode ? "Update Record" : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicalRecordForm

