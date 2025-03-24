"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiSave, FiArrowLeft } from "react-icons/fi"
import prescriptionService, { type Prescription } from "../services/prescriptionService"
import patientService, { type Patient } from "../services/patientService"
import userService, { type User } from "../services/userService"
import authService from "../services/authService"

const PrescriptionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const patientIdFromQuery = queryParams.get("patientId")

  const isEditMode = !!id

  const [formData, setFormData] = useState<Prescription>({
    patient_id: patientIdFromQuery ? Number.parseInt(patientIdFromQuery) : 0,
    user_id: 0,
    prescription_date: new Date().toISOString().split("T")[0],
    medication: "",
    dosage: "",
    frequency: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    instructions: "",
    status: "Active",
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

        // If editing, fetch prescription data
        if (isEditMode && id) {
          const prescriptionData = await prescriptionService.getPrescriptionById(id)
          setFormData({
            ...prescriptionData,
            prescription_date: new Date(prescriptionData.prescription_date).toISOString().split("T")[0],
            start_date: new Date(prescriptionData.start_date).toISOString().split("T")[0],
            end_date: prescriptionData.end_date ? new Date(prescriptionData.end_date).toISOString().split("T")[0] : "",
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

    setFormData((prev) => ({
      ...prev,
      [name]: name === "patient_id" || name === "user_id" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient_id || !formData.user_id || !formData.medication || !formData.dosage || !formData.start_date) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      if (isEditMode && id) {
        await prescriptionService.updatePrescription(id, formData)
        toast.success("Prescription updated successfully")
      } else {
        await prescriptionService.createPrescription(formData)
        toast.success("Prescription created successfully")
      }

      navigate("/prescriptions")
    } catch (err) {
      console.error("Error saving prescription:", err)
      toast.error(isEditMode ? "Failed to update prescription" : "Failed to create prescription")
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
          {isEditMode ? "EDIT PRESCRIPTION" : "CREATE NEW PRESCRIPTION"}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {isEditMode ? "Update prescription details" : "Create a new prescription"}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="prescription_date" className="block text-sm font-medium text-gray-700 mb-1">
              Prescription Date *
            </label>
            <input
              type="date"
              id="prescription_date"
              name="prescription_date"
              value={formData.prescription_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
            Medication *
          </label>
          <input
            type="text"
            id="medication"
            name="medication"
            value={formData.medication}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
              Dosage *
            </label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
              placeholder="e.g., 500mg"
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <input
              type="text"
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="e.g., Twice daily"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="Special instructions for the patient"
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
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Prescription"
                : "Create Prescription"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PrescriptionForm

