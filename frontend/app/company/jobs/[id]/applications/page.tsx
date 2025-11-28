"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"
import {
  Loader2,
  Search,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { JobWithEmpresa } from "@/app/jobs/interface/jobs"
import { CandidaturaWithCandidato } from "@/app/applications/interface/candidatura_with_candidato"


export default function JobApplicationsPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<JobWithEmpresa | null>(null)
  const [applications, setApplications] = useState<CandidaturaWithCandidato[]>([])
  const [filteredApplications, setFilteredApplications] = useState<CandidaturaWithCandidato[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<CandidaturaWithCandidato | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "gestor")) {
      router.push("/login")
    } else if (user) {
      loadData()
    }
  }, [user, authLoading])

  useEffect(() => {
    filterApplications()
  }, [searchQuery, statusFilter, applications])

  const loadData = async () => {
    try {
      const [jobRes, applicationsRes] = await Promise.all([
        api.get(`/vagas_de_emprego/${params.id}`), //job itself
        api.get(`/candidaturas/vaga_de_emprego/${Number(params.id)}`) //getCandidaturasFromVagaDeEmpregoId
      ])
      setJob(jobRes.data)
      setApplications(applicationsRes.data)
      setFilteredApplications(applicationsRes.data)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro ao carregar candidaturas",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.candidato.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.candidato.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status.toLowerCase() === statusFilter.toLocaleLowerCase())
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await api.put(`/candidaturas/${applicationId}`, { //updateCandidaturaById
        status: newStatus,
        data_atualizacao: new Date().toISOString()
      })

      setApplications((prev) =>
        prev.map((app) =>
          app.id_candidatura.toString() === applicationId ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app,
        ),
      )

      if (selectedApplication?.id_candidatura.toString() === applicationId) {
        setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null))
      }

      toast({
        title: "Status atualizado",
        description: "O status da candidatura foi atualizado com sucesso.",
      })
    } catch (error: any) {

      toast({
        title: "Erro ao atualizar status",
        description: error.response?.data?.message || "Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "Pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Em Análise":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Aceito":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Rejeitado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      Pendente: "Pendente",
      reviewing: "Em Análise",
      Aceito: "Aceito",
      Rejeitado: "Rejeitado",
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
        <div className="container mx-auto max-w-7xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/company/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para vagas
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Candidaturas</h1>
            {job && (
              <p className="text-muted-foreground">
                {job.nome_vaga_de_emprego} - {job.cidade} - {job.estado}
              </p>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Aceito">Aceito</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status.toLowerCase() === "pendente").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Em Análise</p>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status.toLowerCase() === "em análise").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Aceitos</p>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status.toLowerCase() === "aceito").length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredApplications.length} {filteredApplications.length === 1 ? "candidatura" : "candidaturas"}
            </p>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {applications.length === 0
                    ? "Ainda não há candidaturas para esta vaga"
                    : "Nenhuma candidatura encontrada com os filtros aplicados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card
                  key={application.id_candidatura}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedApplication(application)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{application.candidato.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {application.candidato.titulo_profissional || "Profissional"}
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {application.candidato.cidade && application.candidato.estado && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {application.candidato.cidade} - {application.candidato.estado}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(application.data).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/company/candidates/${application.id_candidato}`}>
                              <User className="h-4 w-4 mr-1" />
                              Ver Perfil
                            </Link>
                          </Button>
                          {application.status.toLowerCase() !== "Em análise" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateApplicationStatus(application.id_candidatura.toString(), "Em análise")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Em análise
                            </Button>
                          )}
                          {application.status.toLowerCase() !== "Aceito" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateApplicationStatus(application.id_candidatura.toString(), "Aceito")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aceitar
                            </Button>
                          )}
                          {application.status.toLowerCase() !== "Rejeitado" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateApplicationStatus(application.id_candidatura.toString(), "Rejeitado")
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedApplication?.candidato.nome}</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Status Actions */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium mb-1">Status da Candidatura</p>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {getStatusLabel(selectedApplication.status)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {selectedApplication.status.toLowerCase() === "Em análise" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id_candidatura.toString(), "Em análise")}
                    >
                      Marcar Em Análise
                    </Button>
                  )}
                  {selectedApplication.status.toLowerCase() !== "Aceito" && (
                    <Button size="sm" onClick={() => updateApplicationStatus(selectedApplication.id_candidatura.toString(), "Aceito")}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                  )}
                  {selectedApplication.status.toLowerCase() !== "Rejeitado" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateApplicationStatus(selectedApplication.id_candidatura.toString(), "Rejeitado")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-3">Informações de Contato</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedApplication.candidato.email}`} className="text-primary hover:underline">
                      {selectedApplication.candidato.email}
                    </a>
                  </div>
                  {selectedApplication.candidato.cidade && selectedApplication.candidato.estado && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedApplication.candidato.cidade} - {selectedApplication.candidato.estado}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Bio */}
              {selectedApplication.candidato.resumo && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3">Sobre</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedApplication.candidato.resumo}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Application Date */}
              <div className="text-xs text-muted-foreground">
                <p>
                  Candidatura enviada em{" "}
                  {new Date(selectedApplication.data).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  Última atualização em{" "}
                  {new Date(selectedApplication.data_atualizacao).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
