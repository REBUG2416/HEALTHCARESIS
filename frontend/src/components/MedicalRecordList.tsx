"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFileText } from "react-icons/fi"
import medicalRecordService, { type MedicalRecord } from "../services/medicalRecordService"
import authService from "../services/authService"

const MedicalRecordList: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const[user, setUser] = useState<any>()


  useEffect(() => {
    fetchMedicalRecords()
  }, [])


  useEffect(()=>{
    if(records && user){ 
      if(user.role === "patient"){           
      const filteredrecords = records.filter((a)=>{ 
        return a.patientName === user.firstName+" "+ user.lastName})
        setFilteredRecords(filteredrecords)
      }
      else if(user.role === "doctor"){
      const filteredrecords = records.filter((a)=>{ 
        return a.user_id === user.id})
        setFilteredRecords(filteredrecords)
      }
      else 
      setFilteredRecords(records)
  
    }  
  },[records,user])




  const fetchMedicalRecords = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    try {
      setLoading(true)
      const data = await medicalRecordService.getAllMedicalRecords()
      setRecords(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch medical records. Please try again later.")
      console.error("Error fetching medical records:", err)
      toast.error("Failed to load medical records")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const filteredRecords = await medicalRecordService.searchMedicalRecords(searchTerm, dateFilter)
      setFilteredRecords(filteredRecords)
      setError(null)
    } catch (err) {
      setError("Failed to search medical records. Please try again later.")
      console.error("Error searching medical records:", err)
      toast.error("Failed to search medical records")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this medical record?")) {
      try {
        await medicalRecordService.deleteMedicalRecord(id)
        setRecords(records.filter((record) => record.record_id !== id))
        toast.success("Medical record deleted successfully")
      } catch (err) {
        setError("Failed to delete medical record. Please try again later.")
        console.error("Error deleting medical record:", err)
        toast.error("Failed to delete medical record")
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
        <h2 className="text-xl font-semibold text-gray-700">DOCTOR | MEDICAL RECORDS</h2>
      </div>

      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by diagnosis, treatment, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          <div className="w-full md:w-48">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
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
        { user?.role !=="patient"  && 
        <div className="mb-4 flex justify-end">
          <Link
            to="/medical-records/new"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiPlus className="inline mr-2" />
            Add New Medical Record
          </Link>
        </div>
}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No medical records found. Please try a different search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Patient Name</th>
                  <th className="text-left py-2">Doctor</th>
                  <th className="text-left py-2">Record Date</th>
                  <th className="text-left py-2">Diagnosis</th>
                  <th className="text-left py-2">Treatment</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.record_id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <Link to={`/patients/${record.patient_id}`} className="text-blue-500 hover:underline">
                        {record.patientName || "Unknown Patient"}
                      </Link>
                    </td>
                    <td className="py-3">{record.doctor_name || "Unknown Doctor"}</td>
                    <td className="py-3">{formatDate(record.record_date)}</td>
                    <td className="py-3">{record.diagnosis}</td>
                    <td className="py-3">{record.treatment || "N/A"}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link
                          to={`/medical-records/${record.record_id}`}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="View"
                        >
                          <FiFileText size={18} />
                        </Link>
                        <Link
                          to={`/medical-records/${record.record_id}/edit`}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(record.record_id!)}
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

export default MedicalRecordList

