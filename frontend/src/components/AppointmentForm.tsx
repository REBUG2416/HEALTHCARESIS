"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiSave, FiArrowLeft } from "react-icons/fi"
import appointmentService, { type Appointment } from "../services/appointmentService"
import patientService, { type Patient } from "../services/patientService"
import userService, { type User } from "../services/userService"
import authService from "../services/authService"

const AppointmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const patientIdFromQuery = queryParams.get("patientId")

  const isEditMode = !!id

  const [formData, setFormData] = useState<Appointment>({
    patient_id: patientIdFromQuery ? Number.parseInt(patientIdFromQuery) : 0,
    user_id: 0,
    appointment_date: new Date().toISOString().slice(0, 16),
    appointment_type: "Consultation",
    notes: "",
    status: "Scheduled",
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

        // If editing, fetch appointment data
        if (isEditMode && id) {
          const appointmentData = await appointmentService.getAppointmentById(id)

          // Format date for datetime-local input
          const appointmentDate = new Date(appointmentData.appointment_date)
          const formattedDate = appointmentDate.toISOString().slice(0, 16)

          setFormData({
            ...appointmentData,
            appointment_date: formattedDate,
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

    if (!formData.patient_id || !formData.user_id || !formData.appointment_date || !formData.appointment_type) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      if (isEditMode && id) {
        await appointmentService.updateAppointment(id, formData)
        toast.success("Appointment updated successfully")
      } else {
        await appointmentService.createAppointment(formData)
        toast.success("Appointment scheduled successfully")
      }

      navigate("/appointments")
    } catch (err) {
      console.error("Error saving appointment:", err)
      toast.error(isEditMode ? "Failed to update appointment" : "Failed to schedule appointment")
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
          {isEditMode ? "EDIT APPOINTMENT" : "SCHEDULE NEW APPOINTMENT"}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {isEditMode ? "Update appointment details" : "Create a new appointment"}
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
            <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date & Time *
            </label>
            <input
              type="datetime-local"
              id="appointment_date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type *
            </label>
            <select
              id="appointment_type"
              name="appointment_type"
              value={formData.appointment_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
            >
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
              <option value="Routine Check">Routine Check</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
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
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No-show">No-show</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
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
            {loading
              ? isEditMode
                ? "Updating..."
                : "Scheduling..."
              : isEditMode
                ? "Update Appointment"
                : "Schedule Appointment"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AppointmentForm

