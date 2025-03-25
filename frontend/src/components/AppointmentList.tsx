"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiCalendar, FiClock, FiUser, FiFilter } from "react-icons/fi"
import appointmentService, { type Appointment } from "../services/appointmentService"
import authService from "../services/authService"


// Import dummy data
/* import { appointments } from "../data/dummyData"
 */

const Appointments: React.FC = () => {
  const [appointments, setAppointmentList] = useState<Appointment[]>([])
  const [FilteredAppointments, setFilteredAppointmentList] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const[user, setUser] = useState<any>()
  

    useEffect(() => {
      const timer = setTimeout(() => {
        fetchAppointments();
      }, 2000); // Wait 2 seconds before fetching
    
      return () => clearTimeout(timer);
    }, []);

useEffect(()=>{
  if(appointments && user){ 
    if(user.role === "patient"){           
    const filteredAppointments = appointments.filter((a)=>{ 
      return a.patientName === user.firstName+" "+ user.lastName})
      setFilteredAppointmentList(filteredAppointments)
    }
    else if(user.role === "doctor"){
    const filteredAppointments = appointments.filter((a)=>{ 
      return a.user_id === user.id})
      setFilteredAppointmentList(filteredAppointments)
    }
    else 
    setFilteredAppointmentList(appointments)

  }  
},[appointments,user])

  const fetchAppointments = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    try {
      setLoading(true)
      const data = await appointmentService.getAllAppointments()
      setAppointmentList(data)
      const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
      setError(null)
    } catch (err) {
      setError("Failed to fetch appointments. Please try again later.")
      console.error("Error fetching appointments:", err)
      toast.error("Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)

      let filteredAppointments = [...FilteredAppointments]

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filteredAppointments = filteredAppointments.filter(
          (appointment) =>
            appointment.patientName.toLowerCase().includes(term) ||
            appointment.doctorName.toLowerCase().includes(term) ||
            appointment.appointment_type.toLowerCase().includes(term),
        )
      }

      if (typeFilter !== "all") {
        filteredAppointments = filteredAppointments.filter((appointment) => appointment.appointment_type === typeFilter)
      }

      if (statusFilter !== "all") {
        filteredAppointments = filteredAppointments.filter((appointment) => appointment.status === statusFilter)
      }

      if (dateFilter) {
        const filterDate = new Date(dateFilter)
        filteredAppointments = filteredAppointments.filter((appointment) => {
          const appointmentDate = new Date(appointment.appointment_date)
          return (
            appointmentDate.getFullYear() === filterDate.getFullYear() &&
            appointmentDate.getMonth() === filterDate.getMonth() &&
            appointmentDate.getDate() === filterDate.getDate()
          )
        })
      }

      setAppointmentList(FilteredAppointments)
      setError(null)
    } catch (err) {
      setError("Failed to search appointments. Please try again later.")
      console.error("Error searching appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await appointmentService.deleteAppointment(id)
        setAppointmentList(appointments.filter((appointment) => appointment.appointment_id !== Number(id)))
        toast.success("Appointment deleted successfully")
      } catch (err) {
        setError("Failed to delete appointment. Please try again later.")
        console.error("Error deleting appointment:", err)
        toast.error("Failed to delete appointment")
      }
    }
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Appointment Records</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
        {user && <input
            type="text"
            placeholder="Search by patient or doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />}
        </div>

        <div className="w-full md:w-48">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Check-up">Check-up</option>
            <option value="Emergency">Emergency</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Surgery">Surgery</option>
            <option value="Consultation">Consultation</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <button
            onClick={handleSearch}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiFilter className="inline mr-2" />
            Filter
          </button>
        </div>
      </div>

{ user?.role !== "patient" &&    <div className="mb-4 flex justify-end">
        <Link
          to="/appointments/schedule"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <FiCalendar className="inline mr-2" />
          Schedule New Appointment
        </Link>
      </div>
}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
      ) : FilteredAppointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No appointments found. Please try a different search.</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
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
              
              {
              FilteredAppointments.map((appointment) => ( 
                <motion.tr key={appointment.appointment_id} variants={itemVariants} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <FiUser className="mr-2 text-blue-500" />
                      {appointment.patientName}
                      <div className="text-xs text-gray-500 ml-2">{appointment.patient_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 text-blue-500" />
                      {formatDate(appointment.appointment_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiClock className="mr-2 text-blue-500" />
                      {formatTime(appointment.appointment_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.appointment_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.doctorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === "Scheduled"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link to={`/appointments/${appointment.appointment_id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                      <Link
                        to={`/appointments/${appointment.appointment_id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(appointment.appointment_id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}

export default Appointments

