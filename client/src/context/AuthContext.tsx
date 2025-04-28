import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import api from '../services/api'

interface AuthContextType {
    user: any
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children } : { children : ReactNode }) => {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadUser = async() => {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const response = await api.get('/users/me')
                    setUser(response.data)
                } catch (err) {
                    localStorage.removeItem('token')
                }
            }
            setLoading(false)
        }
        loadUser()
    }, [])

    const login = async (email: string, password: string) => {
        const response = await api.post('/users/login', { email, password })
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
    }

    const register = async (name: string, email: string, password: string) => {
        const response = await api.post('/users/register', { name, email, password })
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}