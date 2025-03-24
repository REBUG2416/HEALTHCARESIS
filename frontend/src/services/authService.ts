import api from "./api"

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
  role: string
  phoneNumber: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    username: string
    role: string
    email: string
    firstName: string
    lastName: string
  }
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/login", credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<{ message: string; user: any }> => {
    const response = await api.post("/register", data)
    return response.data
  },

  logout: (): void => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getCurrentUser: (): any => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      return JSON.parse(userStr)
    }
    return null
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token")
  },
}

export default authService

