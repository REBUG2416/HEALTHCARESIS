"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FiEdit2, FiPrinter, FiArrowLeft } from "react-icons/fi"
import billingService, { type Billing } from "../services/billingService"
import patientService, { type Patient } from "../services/patientService"
import { toast } from "react-hot-toast"

const BillingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [billing, setBilling] = useState<Billing | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchBillingData(id)
    }
  }, [id])

  const fetchBillingData = async (billingId: string) => {
    try {
      setLoading(true)

      // Get billing details
      const billingData = await billingService.getBillingById(billingId)
      setBilling(billingData)

      // Get patient data
      if (billingData.patient_id) {
        const patientData = await patientService.getPatientById(billingData.patient_id)
        setPatient(patientData)
      }

      setError(null)
    } catch (err) {
      setError("Failed to fetch billing data. Please try again later.")
      console.error("Error fetching billing data:", err)
      toast.error("Failed to load billing data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (billing && id) {
      try {
        const updatedBilling = {
          ...billing,
          payment_status: newStatus,
          payment_date: newStatus === "Paid" ? new Date().toISOString() : null,
        }

        await billingService.updateBilling(id, updatedBilling)
        setBilling(updatedBilling)
        toast.success(`Billing status updated to ${newStatus}`)
      } catch (err) {
        console.error("Error updating billing status:", err)
        toast.error("Failed to update billing status")
      }
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !billing) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
        {error || "Billing record not found"}
        <div className="mt-4">
          <button
            onClick={() => navigate("/billings")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Billings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Billing Header */}
      <div className="bg-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Billing Record</h2>
            <div className="flex flex-col md:flex-row md:space-x-4 text-blue-100 mt-2">
              <span>Invoice: {billing.invoice_number}</span>
              <span>• ${billing.total_amount}</span>
              <span>• {billing.payment_status}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to={`/billings/${billing.billing_id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
            >
              <FiEdit2 className="inline mr-2" />
              Edit Bill
            </Link>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              <FiPrinter className="inline mr-2" />
              Print Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Billing Information */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Invoice Number</span>
                  <span className="font-medium text-gray-600">{billing.invoice_number}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-600">${billing.amount}</span>
                </div>
                {billing.tax !== undefined && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium text-gray-600">
                      ${billing.tax} ({((billing.tax / billing.amount) * 100)}%)
                    </span>
                  </div>
                )}
                {billing.discount !== undefined && billing.discount > 0 && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-gray-600">
                      -${billing.discount} ({((billing.discount / billing.amount) * 100)}%)
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-medium text-gray-600">${billing.total_amount}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Service Description</span>
                  <span className="font-medium text-gray-600">{billing.service_description || "N/A"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${
                      billing.payment_status === "Paid"
                        ? "text-green-600"
                        : billing.payment_status === "Pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {billing.payment_status}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Created Date</span>
                  <span className="font-medium text-gray-600">{formatDate(billing.created_at)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-medium text-gray-600">{formatDate(billing.due_date)}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Payment Date</span>
                  <span className="font-medium text-gray-600">
                    {billing.payment_date ? formatDateTime(billing.payment_date) : "Not paid yet"}
                  </span>
                </div>
                {billing.notes && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Notes</span>
                    <span className="font-medium text-gray-600">{billing.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
              {patient ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-600">
                      <Link to={`/patients/${patient.patient_id}`} className="text-blue-600 hover:underline">
                        {patient.first_name} {patient.last_name}
                      </Link>
                    </span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">ID</span>
                    <span className="font-medium text-gray-600">{patient.student_id || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Contact</span>
                    <span className="font-medium text-gray-600">{patient.phone_number}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-600">{patient.email || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Patient information not available</p>
              )}
            </div>
          </div>

          {/* Payment Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status</h3>
              <div className="flex flex-col items-center">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                    billing.payment_status === "Paid"
                      ? "bg-green-500"
                      : billing.payment_status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                >
                  {billing.payment_status === "Paid"
                    ? "PAID"
                    : billing.payment_status === "Pending"
                      ? "DUE"
                      : "CANCELLED"}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  {billing.payment_status === "Paid"
                    ? `Paid on ${formatDate(billing.payment_date)}`
                    : billing.payment_status === "Pending"
                      ? billing.due_date
                        ? `Due by ${formatDate(billing.due_date)}`
                        : "Payment pending"
                      : "This bill has been cancelled"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <div className="space-y-3">
                {billing.payment_status === "Pending" && (
                  <button
                    onClick={() => handleStatusChange("Paid")}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
                {billing.payment_status === "Paid" && (
                  <button
                    onClick={() => handleStatusChange("Pending")}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Mark as Unpaid
                  </button>
                )}
                {billing.payment_status !== "Cancelled" && (
                  <button
                    onClick={() => handleStatusChange("Cancelled")}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel Bill
                  </button>
                )}
                {billing.payment_status === "Cancelled" && (
                  <button
                    onClick={() => handleStatusChange("Pending")}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Reactivate Bill
                  </button>
                )}
                <Link
                  to={`/billings/new?patientId=${billing.patient_id}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create New Bill
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <FiArrowLeft className="inline mr-2" />
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default BillingDetail

