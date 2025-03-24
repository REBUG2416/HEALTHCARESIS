import api from "./api"

export interface User {
  user_id?: number
  username: string
  password?: string
  role: string
  email: string
  first_name?: string
  last_name?: string
  phone_number?: string
  status?: string
  created_at?: string
  updated_at?: string
}

const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get("/users")
    return response.data
  },

  getUserById: async (id: string | number): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: string | number, userData: User): Promise<{ message: string; user: User }> => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id: string | number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}

export default userService

