"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/axios-config"
import { Loader2, Briefcase, FileText, TrendingUp, Eye, User, Building2 } from "lucide-react"

interface DashboardStats {
  applications: number
  interviews: number
  profile_views: number
  saved_jobs: number
}

interface RecentApplication {
  id: string
  job_title: string
  company_name: string
  status: string
  applied_at: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    applications: 0,
    interviews: 0,
    profile_views: 0,
    saved_jobs: 0,
  })
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      loadDashboardData()
    }
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      const [statsRes, applicationsRes] = await Promise.all([
        api.get("/candidates/dashboard/stats"),
        api.get(`/candidatos/${user?.id}/candidaturas`),
      ])
      console.log(applicationsRes)

      setStats(statsRes.data)
      setRecentApplications(applicationsRes.data)
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "reviewing":
      case "em análise":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "accepted":
      case "aceito":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
      case "rejeitado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      reviewing: "Em Análise",
      accepted: "Aceito",
      rejected: "Rejeitado",
    }
    return statusMap[status.toLowerCase()] || status
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Redirect based on user type
  if (user?.papel === "gestor") {
    router.push("/company/dashboard")
    return null
  }

  if (user?.papel === "admin") {
    router.push("/admin")
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Olá, {user?.nome?.split(" ")[0] || "Candidato"}!</h1>
              <p className="text-muted-foreground">Acompanhe suas candidaturas e oportunidades</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
              <Button asChild>
                <Link href="/jobs">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Buscar Vagas
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Candidaturas</p>
                    <p className="text-3xl font-bold mt-2">{stats.applications}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entrevistas</p>
                    <p className="text-3xl font-bold mt-2">{stats.interviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visualizações</p>
                    <p className="text-3xl font-bold mt-2">{stats.profile_views}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vagas Salvas</p>
                    <p className="text-3xl font-bold mt-2">{stats.saved_jobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Candidaturas Recentes</CardTitle>
                  <CardDescription>Últimas vagas que você se candidatou</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/applications">Ver Todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Você ainda não se candidatou a nenhuma vaga</p>
                  <Button asChild>
                    <Link href="/jobs">Buscar Vagas</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{application.job_title}</h3>
                          <p className="text-sm text-muted-foreground">{application.company_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Candidatura enviada em {new Date(application.applied_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(application.status)}>{getStatusLabel(application.status)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
