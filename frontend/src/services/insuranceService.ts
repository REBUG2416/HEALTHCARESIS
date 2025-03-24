import axios from "axios"

// Service for handling insurance-related operations
export const insuranceService = {
  // Get all insurance providers
  getAllProviders: async () => {
    try {
      const response = await axios.get("/api/insurance/providers")
      return response.data
    } catch (error) {
      console.error("Error fetching insurance providers:", error)
      throw error
    }
  },

  // Get insurance information for a patient
  getPatientInsurance: async (patientId: string) => {
    try {
      const response = await axios.get(`/api/insurance/patients/${patientId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching patient insurance:", error)
      throw error
    }
  },

  // Submit an insurance claim
  submitClaim: async (claimData: any) => {
    try {
      const response = await axios.post("/api/insurance/claims", claimData)
      return response.data
    } catch (error) {
      console.error("Error submitting insurance claim:", error)
      throw error
    }
  },

  // Get all claims for a patient
  getPatientClaims: async (patientId: string) => {
    try {
      const response = await axios.get(`/api/insurance/claims/patient/${patientId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching patient claims:", error)
      throw error
    }
  },

  // Get claim details
  getClaimById: async (claimId: string) => {
    try {
      const response = await axios.get(`/api/insurance/claims/${claimId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching claim details:", error)
      throw error
    }
  },

  // Update claim status
  updateClaimStatus: async (claimId: string, status: string, notes = "") => {
    try {
      const response = await axios.put(`/api/insurance/claims/${claimId}/status`, {
        status,
        notes,
      })
      return response.data
    } catch (error) {
      console.error("Error updating claim status:", error)
      throw error
    }
  },
}

