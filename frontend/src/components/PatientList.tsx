"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi"
import patientService, { type Patient } from "../services/patientService"
import { userInfo } from "os"
import authService from "../services/authService"

const PatientList: React.FC = () => {
  const [patientList, setPatientList] = useState<Patient[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const[user, setUser] = useState<any>()


  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    try {
      setLoading(true)
      const patients = await patientService.getAllPatients()
      setPatientList(patients)
      setError(null)
    } catch (err) {
      setError("Failed to fetch patients. Please try again later.")
      console.error("Error fetching patients:", err)
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const patients = await patientService.searchPatients(searchTerm, genderFilter, statusFilter)
      setPatientList(patients)
      setError(null)
    } catch (err) {
      setError("Failed to search patients. Please try again later.")
      console.error("Error searching patients:", err)
      toast.error("Failed to search patients")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this patient? This will also delete all related records.")) {
      try {
        await patientService.deletePatient(id)
        setPatientList(patientList.filter((patient) => patient.patient_id !== id))
        toast.success("Patient deleted successfully")
      } catch (err) {
        setError("Failed to delete patient. Please try again later.")
        console.error("Error deleting patient:", err)
        toast.error("Failed to delete patient")
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-700">DOCTOR | MANAGE PATIENTS</h2>
      </div>

      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleSearch}
              className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiSearch className="inline mr-2" />
              Search
            </button>
          </div>
        </div>

      {user?.role !== "doctor" && <div className="mb-4 flex justify-end">
          <Link
            to="/patients/new"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiPlus className="inline mr-2" />
            Add New Patient
          </Link>
        </div>
}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
        ) : patientList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No patients found. Please try a different search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Patient Name</th>
                  <th className="text-left py-2">Mobile Number</th>
                  <th className="text-left py-2">Gender</th>
                  <th className="text-left py-2">Date of Birth</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientList.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link to={`/patients/${patient.patient_id}`} className="text-blue-500 hover:underline">
                        {patient.first_name} {patient.last_name}
                      </Link>
                    </td>
                    <td className="py-3">{patient.phone_number}</td>
                    <td className="py-3">{patient.gender}</td>
                    <td className="py-3">{formatDate(patient.date_of_birth)}</td>
                    <td className="py-3">{patient.email}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          patient.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link
                          to={`/patients/${patient.patient_id}/edit`}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(patient.patient_id!)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientList

