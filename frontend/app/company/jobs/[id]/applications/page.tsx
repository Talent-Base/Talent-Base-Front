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
import { useToast } from "@/job-board/hooks/use-toast"
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

interface Application {
  id: string
  candidate_id: string
  candidate_name: string
  candidate_email: string
  candidate_phone: string
  candidate_location: string
  candidate_title: string
  candidate_bio: string
  candidate_skills: string
  candidate_linkedin: string
  candidate_github: string
  candidate_portfolio: string
  status: string
  applied_at: string
  updated_at: string
}

interface Job {
  title: string
  location: string
  job_type: string
}

export default function JobApplicationsPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.user_type !== "company")) {
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
        api.get(`/companies/jobs/${params.id}`),
        api.get(`/companies/jobs/${params.id}/applications`),
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
          app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status.toLowerCase() === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      await api.patch(`/companies/applications/${applicationId}/status`, {
        status: newStatus,
      })

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app,
        ),
      )

      if (selectedApplication?.id === applicationId) {
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
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "reviewing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
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
                {job.title} - {job.location}
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
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewing">Em Análise</SelectItem>
                    <SelectItem value="accepted">Aceito</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
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
                  {applications.filter((a) => a.status.toLowerCase() === "pending").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Em Análise</p>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status.toLowerCase() === "reviewing").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Aceitos</p>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status.toLowerCase() === "accepted").length}
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
                  key={application.id}
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
                          <h3 className="font-semibold text-lg mb-1">{application.candidate_name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {application.candidate_title || "Profissional"}
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {application.candidate_location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {application.candidate_location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(application.applied_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                        <div className="flex gap-2">
                          {application.status.toLowerCase() !== "accepted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateApplicationStatus(application.id, "accepted")
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aceitar
                            </Button>
                          )}
                          {application.status.toLowerCase() !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateApplicationStatus(application.id, "rejected")
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
            <DialogTitle className="text-2xl">{selectedApplication?.candidate_name}</DialogTitle>
            <DialogDescription>{selectedApplication?.candidate_title || "Profissional"}</DialogDescription>
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
                  {selectedApplication.status.toLowerCase() === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(selectedApplication.id, "reviewing")}
                    >
                      Marcar Em Análise
                    </Button>
                  )}
                  {selectedApplication.status.toLowerCase() !== "accepted" && (
                    <Button size="sm" onClick={() => updateApplicationStatus(selectedApplication.id, "accepted")}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                  )}
                  {selectedApplication.status.toLowerCase() !== "rejected" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
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
                    <a href={`mailto:${selectedApplication.candidate_email}`} className="text-primary hover:underline">
                      {selectedApplication.candidate_email}
                    </a>
                  </div>
                  {selectedApplication.candidate_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedApplication.candidate_phone}</span>
                    </div>
                  )}
                  {selectedApplication.candidate_location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedApplication.candidate_location}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Bio */}
              {selectedApplication.candidate_bio && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3">Sobre</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedApplication.candidate_bio}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Skills */}
              {selectedApplication.candidate_skills && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3">Habilidades</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedApplication.candidate_skills}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Links */}
              <div>
                <h3 className="font-semibold mb-3">Links Profissionais</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedApplication.candidate_linkedin && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedApplication.candidate_linkedin} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {selectedApplication.candidate_github && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedApplication.candidate_github} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {selectedApplication.candidate_portfolio && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedApplication.candidate_portfolio} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Application Date */}
              <div className="text-xs text-muted-foreground">
                <p>
                  Candidatura enviada em{" "}
                  {new Date(selectedApplication.applied_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  Última atualização em{" "}
                  {new Date(selectedApplication.updated_at).toLocaleDateString("pt-BR", {
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
