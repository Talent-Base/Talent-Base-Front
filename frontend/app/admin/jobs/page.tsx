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
import { useToast } from "@/job-board/hooks/use-toast"
import api from "@/lib/axios-config"
import { Loader2, Search, ArrowLeft, Briefcase, Eye, EyeOff, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Job {
  id: string
  title: string
  company_name: string
  location: string
  job_type: string
  is_active: boolean
  created_at: string
  applications_count: number
}

export default function AdminJobsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.user_type !== "admin")) {
      router.push("/login")
    } else if (user) {
      loadJobs()
    }
  }, [user, authLoading])

  useEffect(() => {
    filterJobs()
  }, [searchQuery, statusFilter, jobs])

  const loadJobs = async () => {
    try {
      const response = await api.get("/admin/jobs")
      setJobs(response.data)
      setFilteredJobs(response.data)
    } catch (error) {
      console.error("Error loading jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((job) => job.is_active)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((job) => !job.is_active)
    }

    setFilteredJobs(filtered)
  }

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/jobs/${jobId}/status`, {
        is_active: !currentStatus,
      })

      setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, is_active: !currentStatus } : job)))

      toast({
        title: "Status atualizado",
        description: `Vaga ${!currentStatus ? "ativada" : "desativada"} com sucesso.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.response?.data?.message || "Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const deleteJob = async (jobId: string) => {
    try {
      await api.delete(`/admin/jobs/${jobId}`)
      setJobs((prev) => prev.filter((job) => job.id !== jobId))
      toast({
        title: "Vaga excluída",
        description: "A vaga foi removida com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.response?.data?.message || "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setDeleteJobId(null)
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
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao painel
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gerenciar Vagas</h1>
            <p className="text-muted-foreground">Modere e gerencie todas as vagas da plataforma</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cargo ou empresa..."
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
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="inactive">Inativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length} {filteredJobs.length === 1 ? "vaga encontrada" : "vagas encontradas"}
            </p>
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma vaga encontrada com os filtros aplicados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge variant={job.is_active ? "default" : "secondary"}>
                            {job.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{job.company_name}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{getJobTypeLabel(job.job_type)}</span>
                          <span>•</span>
                          <span>{job.applications_count} candidaturas</span>
                          <span>•</span>
                          <span>Publicada em {new Date(job.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${job.id}`}>Ver Vaga</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleJobStatus(job.id, job.is_active)}>
                          {job.is_active ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteJobId(job.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita e todas as candidaturas
              associadas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && deleteJob(deleteJobId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
