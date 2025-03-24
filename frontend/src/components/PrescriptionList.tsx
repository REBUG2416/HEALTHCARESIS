"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFileText } from "react-icons/fi"
import prescriptionService, { type Prescription } from "../services/prescriptionService"
import authService from "../services/authService"

const PrescriptionList: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [FilteredPrescriptions, setFilteredprescriptionList] = useState<Prescription[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const[user, setUser] = useState<any>()


  useEffect(() => {
    fetchPrescriptions()
  }, [])


  useEffect(()=>{
    if(prescriptions && user){ 
      if(user.role === "patient"){           
      const filteredPrescriptions = prescriptions.filter((a)=>{ 
        return a.patientName === user.firstName+" "+ user.lastName})
        setFilteredprescriptionList(filteredPrescriptions)
      }
      else if(user.role === "doctor"){
      const filteredPrescriptions = prescriptions.filter((a)=>{ 
        return a.user_id === user.id})
        setFilteredprescriptionList(filteredPrescriptions)
      }
      else 
      setFilteredprescriptionList(prescriptions)
  
    }  
  },[prescriptions,user])
  

  const fetchPrescriptions = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    try {
      setLoading(true)
      const data = await prescriptionService.getAllPrescriptions()
      setPrescriptions(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch prescriptions. Please try again later.")
      console.error("Error fetching prescriptions:", err)
      toast.error("Failed to load prescriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const filteredPrescriptions = await prescriptionService.searchPrescriptions(searchTerm, statusFilter)
      setFilteredprescriptionList(filteredPrescriptions)
      setError(null)
    } catch (err) {
      setError("Failed to search prescriptions. Please try again later.")
      console.error("Error searching prescriptions:", err)
      toast.error("Failed to search prescriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      try {
        await prescriptionService.deletePrescription(id)
        setPrescriptions(prescriptions.filter((prescription) => prescription.prescription_id !== id))
        toast.success("Prescription deleted successfully")
      } catch (err) {
        setError("Failed to delete prescription. Please try again later.")
        console.error("Error deleting prescription:", err)
        toast.error("Failed to delete prescription")
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
        <h2 className="text-xl font-semibold text-gray-700">DOCTOR | MANAGE PRESCRIPTIONS</h2>
      </div>

      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by medication or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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

{ user?.role !=="patient"  &&    <div className="mb-4 flex justify-end">
          <Link
            to="/prescriptions/new"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiPlus className="inline mr-2" />
            Add New Prescription
          </Link>
        </div>
}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
        ) : FilteredPrescriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No prescriptions found. Please try a different search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Patient Name</th>
                  <th className="text-left py-2">Doctor</th>
                  <th className="text-left py-2">Medication</th>
                  <th className="text-left py-2">Dosage</th>
                  <th className="text-left py-2">Start Date</th>
                  <th className="text-left py-2">End Date</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {FilteredPrescriptions.map((prescription) => (
                  <tr key={prescription.prescription_id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link to={`/patients/${prescription.patient_id}`} className="text-blue-500 hover:underline">
                        {prescription.patientName || "Unknown Patient"}
                      </Link>
                    </td>
                    <td className="py-3">{prescription.doctorName || "Unknown Doctor"}</td>
                    <td className="py-3">{prescription.medication}</td>
                    <td className="py-3">{prescription.dosage}</td>
                    <td className="py-3">{formatDate(prescription.start_date)}</td>
                    <td className="py-3">{prescription.end_date ? formatDate(prescription.end_date) : "N/A"}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          prescription.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : prescription.status === "Completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {prescription.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link
                          to={`/prescriptions/${prescription.prescription_id}`}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="View"
                        >
                          <FiFileText size={18} />
                        </Link>
                        <Link
                          to={`/prescriptions/${prescription.prescription_id}/edit`}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(prescription.prescription_id!)}
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

export default PrescriptionList

