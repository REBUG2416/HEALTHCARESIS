"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiSave, FiArrowLeft } from "react-icons/fi"
import billingService, { type Billing } from "../services/billingService"
import patientService, { type Patient } from "../services/patientService"

const BillingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const patientIdFromQuery = queryParams.get("patientId")

  const isEditMode = !!id

  const [formData, setFormData] = useState<Billing>({
    patient_id: patientIdFromQuery ? Number.parseInt(patientIdFromQuery) : 0,
    invoice_number: generateInvoiceNumber(),
    service_description: "",
    amount: 0,
    tax: 0,
    discount: 0,
    total_amount: 0,
    payment_status: "Pending",
    payment_date: "",
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    notes: "",
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [initialLoading, setInitialLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Generate a random invoice number
  function generateInvoiceNumber() {
    const prefix = "INV"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true)

        // Fetch patients
        const patientsData = await patientService.getAllPatients()
        setPatients(patientsData)

        // If editing, fetch billing data
        if (isEditMode && id) {
          const billingData = await billingService.getBillingById(id)

          // Format dates for date inputs
          setFormData({
            ...billingData,
            payment_date: billingData.payment_date
              ? new Date(billingData.payment_date).toISOString().split("T")[0]
              : "",
            due_date: billingData.due_date ? new Date(billingData.due_date).toISOString().split("T")[0] : "",
          })
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

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]:
          name === "patient_id"
            ? Number.parseInt(value)
            : name === "amount" || name === "tax" || name === "discount"
              ? Number.parseFloat(value) || 0
              : value,
      }

      // Recalculate total amount when amount, tax, or discount changes
      if (name === "amount" || name === "tax" || name === "discount") {
        const amount = name === "amount" ? Number.parseFloat(value) || 0 : prev.amount
        const tax = name === "tax" ? Number.parseFloat(value) || 0 : prev.tax
        const discount = name === "discount" ? Number.parseFloat(value) || 0 : prev.discount

        updatedData.total_amount = amount + tax - discount
      }

      return updatedData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.patient_id || formData.amount <= 0) {
      toast.error("Please fill in all required fields and ensure amount is greater than zero")
      return
    }

    try {
      setLoading(true)

      if (isEditMode && id) {
        await billingService.updateBilling(id, formData)
        toast.success("Billing record updated successfully")
      } else {
        await billingService.createBilling(formData)
        toast.success("Billing record created successfully")
      }

      navigate("/billings")
    } catch (err) {
      console.error("Error saving billing record:", err)
      toast.error(isEditMode ? "Failed to update billing record" : "Failed to create billing record")
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
          {isEditMode ? "EDIT BILLING RECORD" : "CREATE NEW BILLING RECORD"}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {isEditMode ? "Update billing details" : "Create a new billing record"}
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
            <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Number *
            </label>
            <input
              type="text"
              id="invoice_number"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
              readOnly={isEditMode} // Invoice number shouldn't be changed once created
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="service_description" className="block text-sm font-medium text-gray-700 mb-1">
            Service Description
          </label>
          <input
            type="text"
            id="service_description"
            name="service_description"
            value={formData.service_description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="e.g., Consultation, Lab Tests, Surgery, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-1">
              Tax
            </label>
            <input
              type="number"
              id="tax"
              name="tax"
              value={formData.tax}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
              Discount
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <input
            type="number"
            id="total_amount"
            name="total_amount"
            value={formData.total_amount}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">Automatically calculated (Amount + Tax - Discount)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              required
            />
          </div>
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
            placeholder="Additional notes or payment instructions"
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
            {loading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Billing" : "Create Billing"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BillingForm

