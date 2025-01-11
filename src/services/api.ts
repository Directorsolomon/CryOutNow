import axios, { AxiosError } from 'axios'

interface ApiError {
  message?: string;
}

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    if (error.response?.status === 422) {
      const message = error.response.data?.message || 'Validation error. Please check your input.'
      return Promise.reject(new Error(message))
    }

    return Promise.reject(error)
  }
)

export default api 