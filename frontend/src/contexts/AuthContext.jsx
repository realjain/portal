import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      
      const response = await axios.get('/api/auth/me')
      console.log('User fetched successfully:', { name: response.data.name, role: response.data.role })
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error.response?.data || error.message)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email)
      
      const response = await axios.post('/api/auth/login', { email, password })
      console.log('Login response received:', { 
        success: true, 
        userRole: response.data.user?.role,
        hasToken: !!response.data.token 
      })
      
      const { token, user } = response.data
      
      if (!token || !user) {
        throw new Error('Invalid response from server')
      }
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      console.log('User set in context:', { name: user.name, role: user.role })
      return user
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '[HIDDEN]' })
      
      const response = await axios.post('/api/auth/register', userData)
      console.log('Registration response received:', { 
        success: true, 
        userRole: response.data.user?.role,
        hasToken: !!response.data.token 
      })
      
      const { token, user } = response.data
      
      if (!token || !user) {
        throw new Error('Invalid response from server')
      }
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      console.log('User set in context:', { name: user.name, role: user.role })
      return user
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message)
      throw error
    }
  }

  const logout = () => {
    console.log('Logging out user')
    localStorage.removeItem('token')
    sessionStorage.clear()
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}