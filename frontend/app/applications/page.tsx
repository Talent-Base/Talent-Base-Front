"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import api from "@/lib/axios-config"
import { Loader2, Building2, Search, Filter, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CandidaturaWithJob } from "./interface/candidatura_with_job"
// interface Application {
//   id_candidatura: string
//   id_vaga_de_emprego: string
//   status: string
//   applied_at: string
//   job_title: string
//   company_name: string
//   updated_at: string
// }

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<CandidaturaWithJob[]>([])
  const [filteredApplications, setFilteredApplications] = useState<CandidaturaWithJob[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "candidato")) {
      router.push("/login")
    } else if (user) {
      loadApplications()
    }
  }, [user, authLoading])

  useEffect(() => {
    filterApplications()
  }, [searchQuery, statusFilter, applications])

  const loadApplications = async () => {
    try {
      const response = await api.get(`/candidatos/${user?.id}/candidaturas`)
      setApplications(response.data)
      setFilteredApplications(response.data)
    } catch (error) {
      console.error("Error loading applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.vaga.nome_vaga_de_emprego.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.vaga.empresa.nome_empresa.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status.toLowerCase() === statusFilter.toLocaleLowerCase())
    }

    setFilteredApplications(filtered)
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minhas Candidaturas</h1>
            <p className="text-muted-foreground">Acompanhe o status de todas as suas candidaturas</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por vaga ou empresa..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em análise">Em Análise</SelectItem>
                    <SelectItem value="Aceito">Aceito</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {applications.length === 0
                    ? "Você ainda não se candidatou a nenhuma vaga"
                    : "Nenhuma candidatura encontrada com os filtros aplicados"}
                </p>
                <Button asChild>
                  <Link href="/jobs">Buscar Vagas</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id_candidatura} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{application.vaga.nome_vaga_de_emprego}</h3>
                          {/* <p className="text-sm text-muted-foreground mb-2">{application.company_name}</p> */}
                          <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
                            <span>Candidatura: {new Date(application.data).toLocaleDateString("pt-BR")}</span>
                            {application.data_atualizacao && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span>
                                  Atualizado:{" "}
                                  {new Date(application.data_atualizacao).toLocaleDateString("pt-BR")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${application.id_vaga_de_emprego}`}>Ver Vaga</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
