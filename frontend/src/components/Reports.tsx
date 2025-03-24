"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, subMonths, subDays, subYears } from "date-fns"
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
  LineChart,
  Line,
} from "recharts"
import { toast } from "react-hot-toast"

import dashboardService from "../services/dashboardService"
import patientService from "../services/patientService"
import appointmentService from "../services/appointmentService"
import prescriptionService from "../services/prescriptionService"
import billingService from "../services/billingService"

const Reports: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [reportType, setReportType] = useState<string>("patients")
  const [dateRange, setDateRange] = useState<string>("month")
  const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 1), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  // Chart data
  const [patientData, setPatientData] = useState<any>(null)
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [billingData, setBillingData] = useState<any>(null)
  const [prescriptionData, setPrescriptionData] = useState<any>(null)

  useEffect(() => {
    generateReports()
  }, [reportType, dateRange, startDate, endDate])

  const generateReports = async () => {
    try {
      setLoading(true)

      // Update date range based on selection
      updateDateRange()

      // Generate reports based on type
      switch (reportType) {
        case "patients":
          await generatePatientReports()
          break
        case "appointments":
          await generateAppointmentReports()
          break
        case "billings":
          await generateBillingReports()
          break
        case "prescriptions":
          await generatePrescriptionReports()
          break
        default:
          await generatePatientReports()
      }

      setError(null)
    } catch (err) {
      setError("Failed to generate reports. Please try again later.")
      console.error("Error generating reports:", err)
      toast.error("Failed to generate reports")
    } finally {
      setLoading(false)
    }
  }

  const updateDateRange = () => {
    const today = new Date()

    switch (dateRange) {
      case "week":
        setStartDate(format(subDays(today, 7), "yyyy-MM-dd"))
        setEndDate(format(today, "yyyy-MM-dd"))
        break
      case "month":
        setStartDate(format(subMonths(today, 1), "yyyy-MM-dd"))
        setEndDate(format(today, "yyyy-MM-dd"))
        break
      case "quarter":
        setStartDate(format(subMonths(today, 3), "yyyy-MM-dd"))
        setEndDate(format(today, "yyyy-MM-dd"))
        break
      case "year":
        setStartDate(format(subYears(today, 1), "yyyy-MM-dd"))
        setEndDate(format(today, "yyyy-MM-dd"))
        break
      // Custom range is handled by the date inputs directly
    }
  }

  const generatePatientReports = async () => {
    try {
      // Get dashboard stats for overall numbers
      const dashboardStats = await dashboardService.getDashboardStats()

      // Get all patients to analyze
      const patients = await patientService.getAllPatients()

      // Gender distribution
      const malePatients = patients.filter((p) => p.gender === "Male").length
      const femalePatients = patients.filter((p) => p.gender === "Female").length
      const otherPatients = patients.filter((p) => p.gender === "Other").length

      const genderData = [
        { name: "Male", value: malePatients },
        { name: "Female", value: femalePatients },
        { name: "Other", value: otherPatients },
      ]

      // Patient status
      const activePatients = patients.filter((p) => p.status === "Active").length
      const inactivePatients = patients.filter((p) => p.status === "Inactive").length

      const statusData = [
        { name: "Active", value: activePatients },
        { name: "Inactive", value: inactivePatients },
      ]

      // Monthly new patients (mock data for now)
      // In a real implementation, this would come from an API endpoint with proper date filtering
      const monthlyData = [
        { name: "Jan", count: 5 },
        { name: "Feb", count: 8 },
        { name: "Mar", count: 12 },
        { name: "Apr", count: 7 },
        { name: "May", count: 10 },
        { name: "Jun", count: 15 },
        { name: "Jul", count: 9 },
        { name: "Aug", count: 11 },
        { name: "Sep", count: 14 },
        { name: "Oct", count: 8 },
        { name: "Nov", count: 6 },
        { name: "Dec", count: 10 },
      ]

      setPatientData({
        genderData,
        statusData,
        monthlyData,
        totalPatients: dashboardStats.totalPatients,
        activePatients,
        inactivePatients,
      })
    } catch (error) {
      console.error("Error generating patient reports:", error)
      throw error
    }
  }

  const generateAppointmentReports = async () => {
    try {
      // Get all appointments to analyze
      const appointments = await appointmentService.getAllAppointments()

      // Appointment status
      const scheduledAppointments = appointments.filter((a) => a.status === "Scheduled").length
      const completedAppointments = appointments.filter((a) => a.status === "Completed").length
      const cancelledAppointments = appointments.filter((a) => a.status === "Cancelled").length

      const statusData = [
        { name: "Scheduled", value: scheduledAppointments },
        { name: "Completed", value: completedAppointments },
        { name: "Cancelled", value: cancelledAppointments },
      ]

      // Appointment types
      const appointmentTypes: Record<string, number> = {}
      appointments.forEach((appointment) => {
        const type = appointment.appointment_type
        appointmentTypes[type] = (appointmentTypes[type] || 0) + 1
      })

      const typeData = Object.entries(appointmentTypes).map(([name, value]) => ({
        name,
        value,
      }))

      // Monthly appointments (mock data for now)
      // In a real implementation, this would come from an API endpoint with proper date filtering
      const monthlyData = [
        { name: "Jan", count: 15 },
        { name: "Feb", count: 18 },
        { name: "Mar", count: 22 },
        { name: "Apr", count: 17 },
        { name: "May", count: 20 },
        { name: "Jun", count: 25 },
        { name: "Jul", count: 19 },
        { name: "Aug", count: 21 },
        { name: "Sep", count: 24 },
        { name: "Oct", count: 18 },
        { name: "Nov", count: 16 },
        { name: "Dec", count: 20 },
      ]

      setAppointmentData({
        statusData,
        typeData,
        monthlyData,
        totalAppointments: appointments.length,
        scheduledAppointments,
        completedAppointments,
        cancelledAppointments,
      })
    } catch (error) {
      console.error("Error generating appointment reports:", error)
      throw error
    }
  }

  const generateBillingReports = async () => {
    try {
      // Get all billings to analyze
      const billings = await billingService.getAllBillings()

      // Billing status
      const paidBillings = billings.filter((b) => b.payment_status === "Paid").length
      const pendingBillings = billings.filter((b) => b.payment_status === "Pending").length
      const cancelledBillings = billings.filter((b) => b.payment_status === "Cancelled").length

      const statusData = [
        { name: "Paid", value: paidBillings },
        { name: "Pending", value: pendingBillings },
        { name: "Cancelled", value: cancelledBillings },
      ]

      // Total revenue
      const totalRevenue = billings
        .filter((b) => b.payment_status === "Paid")
        .reduce((sum, billing) => sum + billing.total_amount, 0)

      // Monthly revenue (mock data for now)
      // In a real implementation, this would come from an API endpoint with proper date filtering
      const monthlyData = [
        { name: "Jan", revenue: 1500 },
        { name: "Feb", revenue: 1800 },
        { name: "Mar", revenue: 2200 },
        { name: "Apr", revenue: 1700 },
        { name: "May", revenue: 2000 },
        { name: "Jun", revenue: 2500 },
        { name: "Jul", revenue: 1900 },
        { name: "Aug", revenue: 2100 },
        { name: "Sep", revenue: 2400 },
        { name: "Oct", revenue: 1800 },
        { name: "Nov", revenue: 1600 },
        { name: "Dec", revenue: 2000 },
      ]

      setBillingData({
        statusData,
        monthlyData,
        totalBillings: billings.length,
        paidBillings,
        pendingBillings,
        cancelledBillings,
        totalRevenue,
      })
    } catch (error) {
      console.error("Error generating billing reports:", error)
      throw error
    }
  }

  const generatePrescriptionReports = async () => {
    try {
      // Get all prescriptions to analyze
      const prescriptions = await prescriptionService.getAllPrescriptions()

      // Prescription status
      const activePrescriptions = prescriptions.filter((p) => p.status === "Active").length
      const completedPrescriptions = prescriptions.filter((p) => p.status === "Completed").length

      const statusData = [
        { name: "Active", value: activePrescriptions },
        { name: "Completed", value: completedPrescriptions },
      ]

      // Most prescribed medications (count occurrences)
      const medicationCounts: Record<string, number> = {}
      prescriptions.forEach((prescription) => {
        const medication = prescription.medication
        medicationCounts[medication] = (medicationCounts[medication] || 0) + 1
      })

      const medicationData = Object.entries(medicationCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) // Top 5 medications

      // Monthly prescriptions (mock data for now)
      // In a real implementation, this would come from an API endpoint with proper date filtering
      const monthlyData = [
        { name: "Jan", count: 10 },
        { name: "Feb", count: 12 },
        { name: "Mar", count: 15 },
        { name: "Apr", count: 11 },
        { name: "May", count: 14 },
        { name: "Jun", count: 18 },
        { name: "Jul", count: 13 },
        { name: "Aug", count: 16 },
        { name: "Sep", count: 19 },
        { name: "Oct", count: 12 },
        { name: "Nov", count: 10 },
        { name: "Dec", count: 14 },
      ]

      setPrescriptionData({
        statusData,
        medicationData,
        monthlyData,
        totalPrescriptions: prescriptions.length,
        activePrescriptions,
        completedPrescriptions,
      })
    } catch (error) {
      console.error("Error generating prescription reports:", error)
      throw error
    }
  }

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReportType(e.target.value)
  }

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value)
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
    setDateRange("custom")
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
    setDateRange("custom")
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

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
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Reports & Analytics</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-48">
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={handleReportTypeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="patients">Patients</option>
            <option value="appointments">Appointments</option>
            <option value="billings">Billing</option>
            <option value="prescriptions">Prescriptions</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full md:w-48">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {reportType === "patients" && patientData ? (
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Demographics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender Distribution */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Gender Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={patientData.genderData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {patientData.genderData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Patient Status */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Patient Status</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={patientData.statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#82ca9d"
                        label
                      >
                        {patientData.statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly New Patients */}
{/*               <div className="bg-gray-50 rounded-lg p-4 shadow-md mt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Monthly New Patients</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={patientData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
 */}            </motion.div>
          ) : reportType === "appointments" && appointmentData ? (
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Appointment Statistics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appointment Status */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Appointment Status</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appointmentData.statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {appointmentData.statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Appointment Types */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Appointment Types</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={appointmentData.typeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Appointments */}
{/*               <div className="bg-gray-50 rounded-lg p-4 shadow-md mt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Monthly Appointments</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={appointmentData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
 */}            </motion.div>
          ) : reportType === "billings" && billingData ? (
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Billing Overview</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Status */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Billing Status</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={billingData.statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {billingData.statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Total Revenue */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Total Revenue</h4>
                  <p className="text-3xl font-bold text-green-600">${billingData.totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              {/* Monthly Revenue */}
{/*               <div className="bg-gray-50 rounded-lg p-4 shadow-md mt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Monthly Revenue</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={billingData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
 */}            </motion.div>
          ) : reportType === "prescriptions" && prescriptionData ? (
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Prescription Analysis</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prescription Status */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Prescription Status</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prescriptionData.statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {prescriptionData.statusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top 5 Medications */}
                <div className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Top 5 Medications</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prescriptionData.medicationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Prescriptions */}
{/*               <div className="bg-gray-50 rounded-lg p-4 shadow-md mt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-2">Monthly Prescriptions</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={prescriptionData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
 */}            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <p>No data to display for the selected report type.</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default Reports

