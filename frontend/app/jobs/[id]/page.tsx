"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"
import { Loader2, Building2, MapPin, Clock, DollarSign, CheckCircle2, ArrowLeft, Send, Bookmark } from "lucide-react"
import { JobWithEmpresa } from "@/app/jobs/interface/jobs"

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [job, setJob] = useState<JobWithEmpresa | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    loadJob()
  }, [params.id])

  useEffect(() => {
    if (job && (user && user.papel === "candidato")) {
      checkIfApplied()
    }
  }, [job, user])

  const loadJob = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/vagas_de_emprego/${params.id}`)
      setJob(response.data)
    } catch (error) {
      toast({
        title: "Erro ao carregar vaga",
        description: "Não foi possível carregar os detalhes da vaga.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async () => {
    try {
      const appliedRes = await api.get(`/candidaturas/${job?.id_vaga_de_emprego}/${user?.id}`) //candidaturaExists
      setHasApplied(appliedRes.data.has_applied)
    } catch (error) {
      console.error("Erro ao verificar candidatura:", error)
    }
  }

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para se candidatar.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (user.papel !== "candidato") {
      toast({
        title: "Acesso negado",
        description: "Apenas candidatos podem se candidatar a vagas.",
        variant: "destructive",
      })
      return
    }

    setApplying(true)
    try {
      const body = {
        id_candidato: user.id,
        id_vaga_de_emprego: params.id,
        status: "Pendente",
        data: new Date().toISOString()
      }
      await api.post(`/candidaturas`, body) //createCandidatura
      setHasApplied(true)
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao candidatar",
        description: error.response?.data?.detail || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
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

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "hibrido":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "presencial":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "contract":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "internship":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "remoto":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Vaga não encontrada</p>
              <Button asChild>
                <Link href="/jobs">Voltar para Vagas</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para vagas
            </Link>
          </Button>

          {/* Job Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{job.nome_vaga_de_emprego}</h1>
                    <p className="text-xl text-muted-foreground mb-4">{job.empresa.nome_empresa}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {job.cidade}
                      </div>
                      {job.salario && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          R$ {job.salario}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Publicado em {formatDate(job.data)}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Badge className={getJobTypeColor(job.modalidade)}>{getJobTypeLabel(job.modalidade)}</Badge>
                    </div>
                  </div>
                </div>
                {user?.papel === "candidato" && (
                  <div className="flex flex-col gap-3">
                    {hasApplied ? (
                      <Button disabled className="w-full md:w-auto">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Já Candidatado
                      </Button>
                    ) : (
                      <Button onClick={handleApply} disabled={applying} className="w-full md:w-auto">
                        {applying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Candidatando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Candidatar-se
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Descrição da Vaga</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.descricao}</p>
              </CardContent>
            </Card>
          </div>

          {/* Apply Section (Bottom) */}
          {user?.papel === "candidato" && !hasApplied && (
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Interessado nesta vaga?</h3>
                    <p className="text-sm text-muted-foreground">Candidate-se agora e não perca esta oportunidade</p>
                  </div>
                  <Button onClick={handleApply} disabled={applying} size="lg">
                    {applying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Candidatando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Candidatar-se Agora
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
