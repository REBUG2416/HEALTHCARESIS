"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiFileText } from "react-icons/fi"
import billingService, { type Billing } from "../services/billingService"
import authService from "../services/authService"

const BillingList: React.FC = () => {
  const [billings, setBillings] = useState<Billing[]>([])
  const [filteredBillings, setFilteredBillings] = useState<Billing[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const[user, setUser] = useState<any>()


  useEffect(() => {
    fetchBillings()
  }, [])

  useEffect(()=>{
    if(billings && user){ 

      if(user.role === "patient"){           
      const filteredbilling = billings.filter((a)=>{ 
        return a.patientName === user.firstName+" "+ user.lastName})
        setFilteredBillings(filteredbilling)
      }
      else 
      setFilteredBillings(billings)
  
    }  
  },[billings,user])


  const fetchBillings = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    try {
      setLoading(true)
      const data = await billingService.getAllBillings()
      setBillings(data)
      setError(null)
    } catch (err) {
      setError("Failed to fetch billing records. Please try again later.")
      console.error("Error fetching billing records:", err)
      toast.error("Failed to load billing records")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // Filter billings based on search term and status
    const filteredbillings = filteredBillings.filter((billing) => {
      const matchesSearch =
        searchTerm === "" ||
        (billing.patientName && billing.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        billing.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (billing.service_description && billing.service_description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || billing.payment_status === statusFilter

      return matchesSearch && matchesStatus
    })

    return filteredbillings
  }

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this billing record?")) {
      try {
        await billingService.deleteBilling(id)
        setBillings(billings.filter((billing) => billing.billing_id !== id))
        toast.success("Billing record deleted successfully")
      } catch (err) {
        setError("Failed to delete billing record. Please try again later.")
        console.error("Error deleting billing record:", err)
        toast.error("Failed to delete billing record")
      }
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const displayedBillings = searchTerm || statusFilter !== "all" ? handleSearch() : filteredBillings

  return (
    <div className="bg-white">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-700">ADMIN | MANAGE BILLING</h2>
      </div>

      <div className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by patient name, invoice number..."
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
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => {}} // Search is handled in real-time
              className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiSearch className="inline mr-2" />
              Search
            </button>
          </div>
        </div>
        { (user?.role === "staff" || user?.role === "admin" ) && <div className="mb-4 flex justify-end">
          <Link
            to="/billings/new"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiPlus className="inline mr-2" />
            Add New Billing
          </Link>
        </div>}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>
        ) : displayedBillings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No billing records found. Please try a different search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Invoice #</th>
                  <th className="text-left py-2">Patient</th>
                  <th className="text-left py-2">Service</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBillings.map((billing) => (
                  <tr key={billing.billing_id} className="hover:bg-gray-50">
                    <td className="py-3">{billing.invoice_number}</td>
                    <td className="py-3">
                      <Link to={`/patients/${billing.patient_id}`} className="text-blue-500 hover:underline">
                        {billing.patientName || "Unknown Patient"}
                      </Link>
                    </td>
                    <td className="py-3">{billing.service_description || "General Service"}</td>
                    <td className="py-3">{formatCurrency(billing.total_amount)}</td>
                    <td className="py-3">{formatDate(billing.due_date)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          billing.payment_status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : billing.payment_status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : billing.payment_status === "Overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {billing.payment_status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link
                          to={`/billings/${billing.billing_id}`}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="View"
                        >
                          <FiFileText size={18} />
                        </Link>
                        <Link
                          to={`/billings/${billing.billing_id}/edit`}
                          className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(billing.billing_id!)}
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

export default BillingList

