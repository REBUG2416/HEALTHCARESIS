"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { FiRefreshCw, FiSettings, FiCheck, FiX, FiAlertTriangle, FiInfo, FiEye } from "react-icons/fi"
import ehrService, { type EHRConfig, type EHRStatus, type EHRPatientMapping } from "../services/ehrService"
import patientService, { type Patient } from "../services/patientService"

const EHRIntegration: React.FC = () => {
  const [ehrConfig, setEhrConfig] = useState<EHRConfig | null>(null)
  const [ehrStatus, setEhrStatus] = useState<EHRStatus | null>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [syncingAll, setSyncingAll] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [mappings, setMappings] = useState<EHRPatientMapping[]>([])
  const [syncingPatient, setSyncingPatient] = useState<number | null>(null)
  const [showSyncDetails, setShowSyncDetails] = useState<boolean>(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [formData, setFormData] = useState<EHRConfig>({
    apiUrl: "",
    apiKey: "",
    enabled: false,
    syncFrequency: "daily",
    autoSync: false,
  })

  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)
  const [previewLoading, setPreviewLoading] = useState<boolean>(false)

  // Fetch EHR data and patient data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Get EHR configuration and status
      const config = await ehrService.getConfig()
      const status = await ehrService.getStatus()
      const patientList = await patientService.getAllPatients()
      const patientMappings = await ehrService.getPatientMappings()

      setEhrConfig(config)
      setEhrStatus(status)
      setPatients(patientList)
      setMappings(patientMappings)

      // Initialize form data
      setFormData({
        apiUrl: config.apiUrl || "",
        apiKey: "", // API key is typically not returned for security
        enabled: config.enabled || false,
        syncFrequency: config.syncFrequency || "daily",
        autoSync: config.autoSync || false,
      })

      setError(null)
    } catch (err) {
      setError("Failed to fetch EHR configuration. Please try again later.")
      console.error("Error fetching EHR data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Update EHR configuration
      await ehrService.updateConfig(formData)

      // Refresh data
      await fetchData()

      setEditMode(false)
      toast.success("EHR configuration updated successfully")
    } catch (err) {
      setError("Failed to update EHR configuration. Please check your inputs and try again.")
      console.error("Error updating EHR configuration:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncAll = async () => {
    try {
      setSyncingAll(true)
      setError(null)
      setShowSyncDetails(false)
      setSyncResult(null)

      // Sync all patients
      const result = await ehrService.syncAllPatients()
      setSyncResult(result)

      // Refresh data
      await fetchData()

      toast.success(`Successfully synchronized ${result.syncStats.syncedPatients} patients with EHR system`)
      setShowSyncDetails(true)
    } catch (err: any) {
      setError(`Failed to synchronize with EHR system: ${err.message || "Unknown error"}`)
      console.error("Error synchronizing with EHR:", err)
      toast.error("Synchronization failed")
    } finally {
      setSyncingAll(false)
    }
  }

  const handleSyncPatient = async (patient_id: number) => {
    try {
      setSyncingPatient(patient_id)
      await ehrService.syncPatient(patient_id)

      // Refresh mappings
      const patientMappings = await ehrService.getPatientMappings()
      setMappings(patientMappings)

      toast.success("Patient synchronized successfully")
    } catch (err) {
      toast.error("Failed to synchronize patient")
    } finally {
      setSyncingPatient(null)
    }
  }

  const handlePreviewTransform = async (patient_id: number) => {
    try {
      setPreviewLoading(true)
      const data = await ehrService.previewTransformedData(patient_id)
      setPreviewData(data)
      setShowPreviewModal(true)
    } catch (err) {
      toast.error("Failed to preview transformed data")
      console.error("Error previewing transformed data:", err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"

    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getPatientById = (id: number) => {
    return patients.find((p) => p.patient_id === id)
  }

  const getPatientMapping = (id: number) => {
    return mappings.find((m) => m.patient_id === id)
  }

  if (loading && !ehrConfig && !ehrStatus) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">EHR System Integration</h2>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

      {editMode ? (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
                EHR API URL
              </label>
              <input
                type="text"
                id="apiUrl"
                name="apiUrl"
                value={formData.apiUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ehr-api.example.com"
              />
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API Key {ehrConfig?.apiKey ? "(leave blank to keep current)" : ""}
              </label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your API key"
              />
            </div>

            <div>
              <label htmlFor="syncFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                Sync Frequency
              </label>
              <select
                id="syncFrequency"
                name="syncFrequency"
                value={formData.syncFrequency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                Enable EHR Integration
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSync"
                name="autoSync"
                checked={formData.autoSync}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoSync" className="ml-2 block text-sm text-gray-700">
                Enable Automatic Synchronization
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">EHR Integration Status</h3>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ehrStatus?.status === "operational" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {ehrStatus?.status === "operational" ? "Connected" : "Disconnected"}
                </span>
                {ehrConfig?.lastUpdated && (
                  <span className="ml-2 text-xs text-gray-500">
                    Updated: {new Date(ehrConfig.lastUpdated).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-sm">API URL:</span>
                <span className="ml-2 font-medium">{ehrStatus?.apiUrl || "Not configured"}</span>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Last Synchronization:</span>
                <span className="ml-2 font-medium">{formatDate(ehrStatus?.lastSync)}</span>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Integration Enabled:</span>
                <span className="ml-2 font-medium">{ehrStatus?.enabled ? "Yes" : "No"}</span>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Auto-Sync:</span>
                <span className="ml-2 font-medium">{ehrStatus?.autoSync ? "Enabled" : "Disabled"}</span>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Sync Frequency:</span>
                <span className="ml-2 font-medium capitalize">{ehrStatus?.syncFrequency || "Not set"}</span>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Hours Since Last Sync:</span>
                <span className="ml-2 font-medium">
                  {ehrStatus?.timeSinceLastSync !== null ? ehrStatus?.timeSinceLastSync : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Synchronization Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{ehrStatus?.totalPatients || 0}</div>
                <div className="text-sm text-gray-500">Total Patients</div>
              </div>

              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="text-3xl font-bold text-green-600">{ehrStatus?.totalMappedPatients || 0}</div>
                <div className="text-sm text-gray-500">Mapped to EHR</div>
              </div>

              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="text-3xl font-bold text-yellow-600">{ehrStatus?.unmappedPatients || 0}</div>
                <div className="text-sm text-gray-500">Unmapped Patients</div>
              </div>
            </div>
          </div>

          {/* Patient Mapping Table */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient EHR Mappings</h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EHR ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Synced
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.slice(0, 5).map((patient) => {
                    const mapping =  mappings?.find((map)=>{return Number(patient.patient_id) === Number(map.patient_id)}) || null;                 
                    console.log(mapping);
                    
                    return (
                      <tr key={patient.patient_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {patient.student_id || patient.patient_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mapping?.ehr_id || "Not mapped"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {mapping ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                mapping.status === "mapped"
                                  ? "bg-green-100 text-green-800"
                                  : mapping.status === "error"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {mapping.status === "mapped"
                                ? "Synced"
                                : mapping.status === "error"
                                  ? "Error"
                                  : "Pending"}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Not Mapped
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mapping ? formatDate(mapping.last_synced) : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSyncPatient(patient.patient_id!)}
                              disabled={syncingPatient === patient.patient_id || !ehrStatus?.enabled}
                              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                            >
                              {syncingPatient === patient.patient_id ? (
                                <span className="flex items-center">
                                  <FiRefreshCw className="animate-spin mr-1" /> Syncing...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <FiRefreshCw className="mr-1" /> Sync
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => handlePreviewTransform(patient.patient_id!)}
                              disabled={previewLoading || !ehrStatus?.enabled}
                              className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                              title="Preview EHR Transform"
                            >
                              {previewLoading ? (
                                <span className="flex items-center">
                                  <FiEye className="animate-pulse mr-1" />
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <FiEye className="mr-1" />
                                </span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {patients.length > 5 && (
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-500">Showing 5 of {patients.length} patients</span>
              </div>
            )}
          </div>

          {/* Data Transformation Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Data Transformation</h3>

            <div className="flex items-start">
              <FiInfo className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700 mb-2">
                  Patient data is automatically transformed to match the EHR system's requirements before
                  synchronization. You can preview how each patient's data will be transformed by clicking the{" "}
                  <FiEye className="inline" /> icon.
                </p>
                <p className="text-sm text-blue-700">
                  Field mappings and transformations can be configured in the system settings. Contact your
                  administrator if you need to modify how data is mapped to your EHR system.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Results */}
          {showSyncDetails && syncResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Last Synchronization Results</h3>
                <button onClick={() => setShowSyncDetails(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{syncResult.syncStats.syncedPatients}</div>
                  <div className="text-sm text-gray-500">Synced Patients</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{syncResult.syncStats.failedPatients}</div>
                  <div className="text-sm text-gray-500">Failed Patients</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{syncResult.syncStats.newMappings}</div>
                  <div className="text-sm text-gray-500">New Mappings</div>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">{syncResult.syncStats.updatedRecords}</div>
                  <div className="text-sm text-gray-500">Updated Records</div>
                </div>
              </div>

              {syncResult.details.failedPatients.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-red-600 mb-2 flex items-center">
                    <FiAlertTriangle className="mr-1" /> Failed Synchronizations
                  </h4>
                  <div className="bg-red-50 p-3 rounded-md border border-red-200">
                    <ul className="list-disc list-inside">
                      {syncResult.details.failedPatients.map((patient: any) => (
                        <li key={patient.id} className="text-sm text-red-700">
                          {patient.name} - {patient.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {syncResult.details.successfulPatients.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-green-600 mb-2 flex items-center">
                    <FiCheck className="mr-1" /> Successful Synchronizations
                  </h4>
                  <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <p className="text-sm text-green-700 mb-2">
                      Successfully synchronized {syncResult.details.successfulPatients.length} patients with the EHR
                      system.
                    </p>
                    {syncResult.details.successfulPatients.length <= 10 ? (
                      <ul className="list-disc list-inside">
                        {syncResult.details.successfulPatients.map((patient: any) => (
                          <li key={patient.id} className="text-sm text-green-700">
                            {patient.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-700 italic">
                        Showing first 10 of {syncResult.details.successfulPatients.length} patients
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiSettings className="mr-2" /> Edit Configuration
            </button>

            <button
              onClick={handleSyncAll}
              disabled={syncingAll || !ehrStatus?.enabled}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {syncingAll ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" /> Synchronizing...
                </>
              ) : (
                <>
                  <FiRefreshCw className="mr-2" /> Synchronize All Patients
                </>
              )}
            </button>
          </div>

          {!ehrStatus?.enabled && (
            <div className="mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-200 flex items-start">
              <FiInfo className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">EHR Integration is Disabled</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  To enable synchronization with your Electronic Health Record system, click "Edit Configuration" and
                  enable the integration.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">EHR Data Transformation Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                This preview shows how patient data will be transformed before being sent to the EHR system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Data */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-700 mb-2">Original Patient Data</h4>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  {previewData.originalData && (
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(previewData.originalData, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              {/* Transformed Data */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-md font-medium text-blue-700 mb-2">Transformed EHR Data</h4>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  {previewData.transformedData && (
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(previewData.transformedData, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>

            {/* Field Mappings */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">Field Mappings</h4>
              <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Local Field
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EHR Field
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transformation
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.fieldMappings &&
                      previewData.fieldMappings.map((mapping: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm text-gray-900">{mapping.localField}</td>
                          <td className="px-4 py-2 text-sm text-blue-600">{mapping.ehrField}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {mapping.transformation || "Direct mapping"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">{mapping.description || ""}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EHRIntegration

