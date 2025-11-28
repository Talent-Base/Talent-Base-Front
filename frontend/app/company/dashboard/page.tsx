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
import { Loader2, Briefcase, Users, Eye, PlusCircle, Building2, Edit } from "lucide-react"

import { JobWithEmpresa } from "@/app/jobs/interface/jobs"

interface CompanyStats {
  vagas_totais: number
  candidatos_totais: number
  candidaturas_pendentes: number
}


export default function CompanyDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CompanyStats>({
    vagas_totais: 0,
    candidatos_totais: 0,
    candidaturas_pendentes: 0,
  })
  const [recentJobs, setRecentJobs] = useState<JobWithEmpresa[]>([])

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "gestor")) {
      router.push("/login")
    } else if (user) {
      loadDashboardData()
    }
  }, [user, authLoading])

  const loadDashboardData = async () => {
    try {
      const gestor = await api.get(`/gestores/${user?.id}`)
      const [statsRes, jobsRes] = await Promise.all([
        api.get(`/empresas/${gestor.data.id_empresa}/stats`),
        api.get(`/empresas/${gestor.data.id_empresa}/vagas_de_emprego?limit=5`),
      ])
      setStats(statsRes.data)
      setRecentJobs(jobsRes.data)
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getJobTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      full_time: "Tempo Integral",
      part_time: "Meio Período",
      contract: "Contrato",
      internship: "Estágio",
      remote: "Remoto",
    }
    return typeMap[type.toLowerCase()] || type
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
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Painel da Empresa</h1>
              <p className="text-muted-foreground">Gerencie suas vagas e candidatos</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/company/profile">
                  <Building2 className="mr-2 h-4 w-4" />
                  Perfil da Empresa
                </Link>
              </Button>
              <Button asChild>
                <Link href="/company/jobs/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova Vaga
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vagas</p>
                    <p className="text-3xl font-bold mt-2">{stats.vagas_totais}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Candidaturas</p>
                    <p className="text-3xl font-bold mt-2">{stats.candidatos_totais}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                    <p className="text-3xl font-bold mt-2">{stats.candidaturas_pendentes}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vagas Recentes</CardTitle>
                  <CardDescription>Gerencie suas vagas publicadas</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/company/jobs">Ver Todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Você ainda não publicou nenhuma vaga</p>
                  <Button asChild>
                    <Link href="/company/jobs/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Criar Primeira Vaga
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id_vaga_de_emprego}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{job.nome_vaga_de_emprego}</h3>
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>{job.cidade} - {job.estado}</span>
                          <span>•</span>
                          <span>{getJobTypeLabel(job.modalidade)}</span>
                          <span>•</span>
                          <span>Publicada em {new Date(job.data).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/company/jobs/${job.id_vaga_de_emprego}/applications`}>Ver Candidatos</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/company/jobs/${job.id_vaga_de_emprego}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
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
