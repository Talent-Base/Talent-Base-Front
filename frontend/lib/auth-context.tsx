"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "./axios-config"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  nome: string
  email: string
  papel: "candidato" | "gestor" | "admin"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register_candidato: (email: string, password: string, name: string, userType: string) => Promise<void>
  register_gestor: (email: string, password: string, name: string, userType: string, empresa: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        const response = await api.get("/auth/me")
        setUser(response.data)
      }
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const params = new URLSearchParams()
      params.append("username", email)
      params.append("password", password)

      const response = await api.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })

      const { access_token, refresh_token, user: userData } = response.data

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)

      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
      setUser(userData)
    } catch (error: any) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const refreshToken = async () => {
    const refresh_token = localStorage.getItem("refresh_token")
    if (!refresh_token) {
      logout()
      return
    }

    try {
      const response = await api.post("/auth/refresh", { refresh_token })
      const { access_token } = response.data
      localStorage.setItem("access_token", access_token)
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
      return access_token
    } catch (error) {
      logout()
      return null
    }
  }

  const register_candidato = async (email: string, password: string, nome: string, userType: string) => {
    const response = await api.post("/usuarios/candidato", {
      email,
      senha: password,
      nome,
      papel: userType,
    })
    const { access_token, refresh_token, user: userData } = response.data

    localStorage.setItem("access_token", access_token)
    localStorage.setItem("refresh_token", refresh_token)
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
    setUser(userData)
  }

  const register_gestor = async (email: string, password: string, nome: string, userType: string, empresa: any) => {
    const response = await api.post("/usuarios/gestor", {
      email,
      senha: password,
      nome,
      papel: userType,
      empresa: empresa
    })
    const { access_token, refresh_token, user: userData } = response.data

    localStorage.setItem("access_token", access_token)
    localStorage.setItem("refresh_token", refresh_token)
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register_candidato, register_gestor}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
