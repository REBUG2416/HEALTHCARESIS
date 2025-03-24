"use client"

import React from "react"
import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Dashboard from "./components/Dashboard"
import PatientList from "./components/PatientList"
import PatientDetail from "./components/PatientDetail"
import PatientForm from "./components/PatientForm"
import AppointmentList from "./components/AppointmentList"
import AppointmentDetail from "./components/AppointmentDetail"
import AppointmentForm from "./components/AppointmentForm"
import PrescriptionList from "./components/PrescriptionList"
import PrescriptionDetail from "./components/PrescriptionDetail"
import PrescriptionForm from "./components/PrescriptionForm"
import MedicalRecordList from "./components/MedicalRecordList"
import MedicalRecordDetail from "./components/MedicalRecordDetail"
import MedicalRecordForm from "./components/MedicalRecordForm"
import BillingList from "./components/BillingList"
import BillingDetail from "./components/BillingDetail"
import BillingForm from "./components/BillingForm"
import Reports from "./components/Reports"
import QRCodeScanner from "./components/QRCodeScanner"
import UserManagement from "./components/UserManagement"
import EHRIntegration from "./components/EHRIntegration"
import ProfilePage from "./components/ProfilePage"
import Login from "./components/Login"
import authService from "./services/authService"
import "./App.css"
import Register from "./components/Register"

// Icons
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiClipboard,
  FiDollarSign,
  FiBarChart2,
  FiSearch,
  FiUser,
  FiDatabase,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
} from "react-icons/fi"

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()

  // Function to determine if a path is active
  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }



  // Get current user role (from auth)
  const user = authService.getCurrentUser()
  const userRole = user?.role || "admin" // Default to admin if not available
  const userName = user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username || "Admin"

  if (currentPath === "/" && user.role === "patient" && user.role === "doctor")
  navigate("/profile")


  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-blue-600">HMS</span>
          </div>
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-gray-400 uppercase">MAIN NAVIGATION</p>
        </div>

        <nav className="p-2">
          <ul className="space-y-1">
            { (user?.role === "admin" || user?.role ==="staff") && <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/") ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiHome className="mr-3 text-lg" />
                Dashboard
              </Link>
            </li>
              }
            <li>
              <Link
                to="/appointments"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/appointments") ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiCalendar className="mr-3 text-lg" />
                Appointment History
              </Link>
            </li>

            {user.role !== "patient" && <li>
              <Link
                to="/patients"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/patients") ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiUser className="mr-3 text-lg" />
                Patients
              </Link>
            </li>}

{      user.role !== "patient" &&    <li>
            <Link
              to="/scan"
              className={`flex items-center px-4 py-2 text-sm rounded-md ${
                isActive("/scan") ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FiSearch className="mr-3 text-lg" />
              Search
            </Link>
          </li>

}            {userRole === "admin" && (
              <li>
                <Link
                  to="/users"
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    isActive("/users") ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiUsers className="mr-3 text-lg" />
                  Users
                </Link>
              </li>
            )}

            <li>
              <Link
                to="/prescriptions"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/prescriptions")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiFileText className="mr-3 text-lg" />
                Prescriptions
              </Link>
            </li>

            <li>
              <Link
                to="/medical-records"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/medical-records")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiClipboard className="mr-3 text-lg" />
                Medical Records
              </Link>
            </li>

            <li>
              <Link
                to="/billings"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/billings") ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiDollarSign className="mr-3 text-lg" />
                Billing
              </Link>
            </li>

           {user.role === "admin" && <li>
              <Link
                to="/reports"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/reports") ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiBarChart2 className="mr-3 text-lg" />
                Reports
              </Link>
            </li>}

            {userRole === "admin" && (
              <li>
                <Link
                  to="/ehr-integration"
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    isActive("/ehr-integration")
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiDatabase className="mr-3 text-lg" />
                  EHR Integration
                </Link>
              </li>
            )}

            <li>
              <Link
                to="/profile"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive("/profile")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    :"text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FiSettings className="mr-3 text-lg" />
                My Profile
              </Link>
            </li>


            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100"
              >
                <FiLogOut className="mr-3 text-lg" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white z-10">
        <div className={"flex items-center justify-between h-16 px-4 px-10"/* + "justify-end gap-5" */}>
            <div className="flex items-center">
              <button className="md:hidden text-gray-500 hover:text-gray-700 mr-2" onClick={() => setSidebarOpen(true)}>
                <FiMenu size={24} />
              </button>
              <h1 className="text-gray-500 text-xl">Hospital Management System</h1>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <span className="hidden md:block text-sm font-medium text-gray-700">{userName}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {userName.charAt(0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <PatientList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/new"
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id/edit"
              element={
                <ProtectedRoute>
                  <PatientForm />
                </ProtectedRoute>
              }
            />

            {/* Appointment Routes */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <AppointmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/schedule"
              element={
                <ProtectedRoute>
                  <AppointmentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id"
              element={
                <ProtectedRoute>
                  <AppointmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id/edit"
              element={
                <ProtectedRoute>
                  <AppointmentForm />
                </ProtectedRoute>
              }
            />

            {/* Prescription Routes */}
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute>
                  <PrescriptionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/new"
              element={
                <ProtectedRoute>
                  <PrescriptionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/:id"
              element={
                <ProtectedRoute>
                  <PrescriptionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/:id/edit"
              element={
                <ProtectedRoute>
                  <PrescriptionForm />
                </ProtectedRoute>
              }
            />

            {/* Medical Records Routes */}
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute>
                  <MedicalRecordList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records/new"
              element={
                <ProtectedRoute>
                  <MedicalRecordForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records/:id"
              element={
                <ProtectedRoute>
                  <MedicalRecordDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records/:id/edit"
              element={
                <ProtectedRoute>
                  <MedicalRecordForm />
                </ProtectedRoute>
              }
            />

            {/* Billing Routes */}
            <Route
              path="/billings"
              element={
                <ProtectedRoute>
                  <BillingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billings/new"
              element={
                <ProtectedRoute>
                  <BillingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billings/:id"
              element={
                <ProtectedRoute>
                  <BillingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billings/:id/edit"
              element={
                <ProtectedRoute>
                  <BillingForm />
                </ProtectedRoute>
              }
            />

            {/* Reports Route */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* QR Code Scanner Route */}
            <Route
              path="/scan"
              element={
                <ProtectedRoute>
                  <QRCodeScanner />
                </ProtectedRoute>
              }
            />

            {/* User Management Route */}
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* EHR Integration Route */}
            <Route
              path="/ehr-integration"
              element={
                <ProtectedRoute>
                  <EHRIntegration />
                </ProtectedRoute>
              }
            />

                        {/* Profile Route */}
                        <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App

