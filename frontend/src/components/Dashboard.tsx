"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import { FiUsers, FiUserPlus, FiCalendar, FiFileText, FiMessageSquare } from "react-icons/fi"
import dashboardService, { type DashboardStats } from "../services/dashboardService"
import appointmentService, { type Appointment } from "../services/appointmentService"
import { toast } from "react-hot-toast"
import { userInfo } from "os"
import authService from "../services/authService"

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    activePrescriptions: 0,
    totalUsers: 0,
    totalDoctors: 0,
  })

  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const[user, setUser] = useState<any>()


  // Chart data
  const [genderDistribution, setGenderDistribution] = useState<any[]>([])
  const [appointmentsByType, setAppointmentsByType] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setLoading(true)

      // Get dashboard stats
      const dashboardStats = await dashboardService.getDashboardStats()
      setStats(dashboardStats)

      // Get upcoming appointments
      const appointments = await appointmentService.getAllAppointments()
      console.log(appointments);
      
      const upcomingAppointments = appointments
        .filter((a) => a.status === "Scheduled" && new Date(a.appointment_date) > new Date())
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        .slice(0, 5)

      setRecentAppointments(upcomingAppointments)

      // Process gender distribution for chart
      // This would ideally come from an API endpoint, but we'll construct it here
      const genderData = [
        { name: "Male", value: Math.round(dashboardStats.totalPatients * 0.48) }, // Approximation
        { name: "Female", value: Math.round(dashboardStats.totalPatients * 0.49) }, // Approximation
        { name: "Other", value: Math.round(dashboardStats.totalPatients * 0.03) }, // Approximation
      ]
      setGenderDistribution(genderData)

      // Process appointment types for chart
      // This would ideally come from an API endpoint, but we'll construct it here
      const appointmentTypes = {
        Consultation: Math.round(dashboardStats.totalAppointments * 0.4),
        "Follow-up": Math.round(dashboardStats.totalAppointments * 0.3),
        Emergency: Math.round(dashboardStats.totalAppointments * 0.1),
        "Routine Check": Math.round(dashboardStats.totalAppointments * 0.2),
      }

      const typeData = Object.entries(appointmentTypes).map(([name, value]) => ({
        name,
        value,
      }))
      setAppointmentsByType(typeData)

      setError(null)
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again later.")
      console.error("Error fetching dashboard data:", err)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">ADMIN | DASHBOARD</h2>

{ user.role ==="admin" &&    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Manage Users Card */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white mb-4">
              <FiUsers size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Manage Users</h3>
            <p className="text-sm text-blue-500 mb-1">
              Total Users: <span className="font-medium">{stats.totalUsers}</span>
            </p>
            <Link to="/users" className="text-blue-500 text-sm hover:underline">
              View All Users
            </Link>
          </div>
        </div>

        {/* Manage Doctors Card */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white mb-4">
              <FiUserPlus size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Manage Doctors</h3>
            <p className="text-sm text-blue-500 mb-1">
              Total Doctors: <span className="font-medium">{stats.totalDoctors}</span>
            </p>
            <Link to="/users" className="text-blue-500 text-sm hover:underline">
              View All Doctors
            </Link>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white mb-4">
              <FiCalendar size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Appointments</h3>
            <p className="text-sm text-blue-500 mb-1">
              Total Appointments: <span className="font-medium">{stats.totalAppointments}</span>
            </p>
            <Link to="/appointments" className="text-blue-500 text-sm hover:underline">
              View All Appointments
            </Link>
          </div>
        </div>

        {/* Manage Patients Card */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white mb-4">
              <FiUsers size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Manage Patients</h3>
            <p className="text-sm text-blue-500 mb-1">
              Total Patients: <span className="font-medium">{stats.totalPatients}</span>
            </p>
            <Link to="/patients" className="text-blue-500 text-sm hover:underline">
              View All Patients
            </Link>
          </div>
        </div>

        {/* Prescriptions Card */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white mb-4">
              <FiFileText size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Prescriptions</h3>
            <p className="text-sm text-blue-500 mb-1">
              Active Prescriptions: <span className="font-medium">{stats.activePrescriptions}</span>
            </p>
            <Link to="/prescriptions" className="text-blue-500 text-sm hover:underline">
              View All Prescriptions
            </Link>
          </div>
        </div>

        {/* New Queries Card */}
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white mb-4">
              <FiMessageSquare size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">New Queries</h3>
            <p className="text-sm text-blue-500 mb-1">
              Total New Queries: <span className="font-medium">1</span>
            </p>
            <Link to="/reports" className="text-blue-500 text-sm hover:underline">
              View All Queries
            </Link>
          </div>
        </div>
      </div>
}      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Gender Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments by Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={appointmentsByType}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Recent Appointments */}
        <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>

          {recentAppointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.appointment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patientName}
                        <div className="text-xs text-gray-500">ID: {appointment.patient_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(appointment.appointment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.appointment_type}
                      </td>
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
                        <Link
                          to={`/appointments/${appointment.appointment_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Dashboard

