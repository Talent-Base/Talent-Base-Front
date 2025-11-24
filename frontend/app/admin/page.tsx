"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/axios-config"
import { Loader2, Users, Briefcase, Building2, TrendingUp } from "lucide-react"

interface AdminStats {
  total_users: number
  total_candidates: number
  total_companies: number
  total_jobs: number
  active_jobs: number
  total_applications: number
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_candidates: 0,
    total_companies: 0,
    total_jobs: 0,
    active_jobs: 0,
    total_applications: 0,
  })

  useEffect(() => {
    if (!authLoading && (!user || user.user_type !== "admin")) {
      router.push("/login")
    } else if (user) {
      loadStats()
    }
  }, [user, authLoading])

  const loadStats = async () => {
    try {
      const response = await api.get("/admin/stats")
      setStats(response.data)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários, vagas e conteúdo da plataforma</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                    <p className="text-3xl font-bold mt-2">{stats.total_users}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.total_candidates} candidatos • {stats.total_companies} empresas
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vagas</p>
                    <p className="text-3xl font-bold mt-2">{stats.total_jobs}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stats.active_jobs} ativas</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Candidaturas</p>
                    <p className="text-3xl font-bold mt-2">{stats.total_applications}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total de aplicações</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="jobs">Vagas</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>Visualize e gerencie todos os usuários da plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <Button asChild className="w-full md:w-auto">
                      <Link href="/admin/users">
                        <Users className="mr-2 h-4 w-4" />
                        Ver Todos os Usuários
                      </Link>
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{stats.total_candidates}</p>
                              <p className="text-sm text-muted-foreground">Candidatos</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{stats.total_companies}</p>
                              <p className="text-sm text-muted-foreground">Empresas</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Vagas</CardTitle>
                  <CardDescription>Modere e gerencie as vagas publicadas na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <Button asChild className="w-full md:w-auto">
                      <Link href="/admin/jobs">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Ver Todas as Vagas
                      </Link>
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{stats.active_jobs}</p>
                              <p className="text-sm text-muted-foreground">Vagas Ativas</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{stats.total_jobs}</p>
                              <p className="text-sm text-muted-foreground">Total de Vagas</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
