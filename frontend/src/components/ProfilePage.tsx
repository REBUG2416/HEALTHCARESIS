"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiLogOut } from "react-icons/fi"
import authService from "../services/authService"
import userService from "../services/userService"
import { motion } from "framer-motion"
import patientService,  { type Patient }  from "../services/patientService"

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [patient, setPatient] = useState<Patient>(null)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const currentUser = await authService.getCurrentUser()
        const patients = await patientService.getAllPatients()
        setPatient(patients.find((patient)=>{ console.log(patient.first_name +" "+patient.last_name); return patient.first_name +" "+patient.last_name === currentUser.firstName +" "+currentUser.lastName}))
        if (!currentUser) {
          navigate("/login")
          return
        }

        // Fetch full user details if we have an ID
        if (currentUser.id) {
          const userData = await userService.getUserById(currentUser.id)
          setUser(userData)

          // Initialize form data
          setFormData({
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            phone_number: userData.phone_number || "",
            current_password: "",
            new_password: "",
            confirm_password: "",
          })
        } else {
          setUser(currentUser)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to load user profile")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password if changing
    if (formData.new_password) {
      if (formData.new_password !== formData.confirm_password) {
        toast.error("New passwords do not match")
        return
      }

      if (!formData.current_password) {
        toast.error("Current password is required to set a new password")
        return
      }
    }

    try {
      setSaving(true)

      // Prepare update data
      const updateData = {
        user_id: user.user_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        username: user.username,
        role: user.role
      }

      // Add password if changing
      if (formData.new_password) {
        // In a real app, you'd verify the current password on the server
        // and then update with the new password
        Object.assign(updateData, { password: formData.new_password })
      }

      // Update user
      const result = await userService.updateUser(user.user_id, updateData)

      // Update local user data
      setUser({
        ...user,
        ...updateData,
      })

      // Update stored user info
      const storedUser = authService.getCurrentUser()
      if (storedUser) {
        const updatedStoredUser = {
          ...storedUser,
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
        }
        localStorage.setItem("user", JSON.stringify(updatedStoredUser))
      }

      toast.success("Profile updated successfully")
      setEditMode(false)

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }))
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
    toast.success("Logged out successfully")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">User not found. Please log in again.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <FiLogOut className="mr-2" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user.first_name ? user.first_name.charAt(0) : user.username?.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 ">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-gray-500 ">{user.role}</p>
              <p className="text-gray-500  mt-1">{user.email}</p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setEditMode(!editMode)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {editMode ? "Cancel Editing" : "Edit Profile"}
              </button>
            </div>
          { patient && user?.role === "patient" && <div className="mt-6 flex justify-center">
               <button
                onClick={() => {navigate(`/patients/${patient.patient_id}`)}}
                className=" px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
View Medical Details
              </button>
            </div>}

          </div>
        </div>

        {/* Profile Details / Edit Form */}
        <div className="md:col-span-2">
          {editMode ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="bg-gray-50  rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-800 text-amber-50 mb-4">
                Edit Profile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700  mb-1"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700  mb-1"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 border border-gray-300  rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700  mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phone_number"
                  className="block text-sm font-medium text-gray-700  mb-1"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300  rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <h4 className="text-lg font-medium text-gray-800 mt-6 mb-4">
                Change Password (Optional)
              </h4>

              <div className="mb-4">
                <label
                  htmlFor="current_password"
                  className="block text-sm font-medium text-gray-700  mb-1"
                >
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300  rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="new_password"
                    className="block text-sm font-medium text-gray-700  mb-1"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 border border-gray-300  rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-700  mb-1"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-2 border border-gray-300  rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50  rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-800  mb-4">
                Profile Information
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 ">
                    Username
                  </h4>
                  <p className="text-gray-800 ">{user.username}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 ">
                    Full Name
                  </h4>
                  <p className="text-gray-800 ">
                    {user.first_name} {user.last_name}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 ">
                    Email
                  </h4>
                  <p className="text-gray-800 ">{user.email}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 ">
                    Phone Number
                  </h4>
                  <p className="text-gray-800 ">
                    {user.phone_number || "Not provided"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 ">
                    Role
                  </h4>
                  <p className="text-gray-800  capitalize">{user.role}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 ">
                    Account Status
                  </h4>
                  <p className="text-gray-800 ">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800 "
                          : "bg-red-100 text-red-800 "
                      }`}
                    >
                      {user.status || "Active"}
                    </span>
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 ">
                    Member Since
                  </h4>
                  <p className="text-gray-800 ">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

