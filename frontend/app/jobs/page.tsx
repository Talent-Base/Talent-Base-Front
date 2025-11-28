"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/axios-config"
import { Search, MapPin, Briefcase, Clock, Building2, Filter, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobWithEmpresa } from "@/app/jobs/interface/jobs"
import { ESTADOS_BR } from "@/lib/constants"

export default function JobsPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<JobWithEmpresa[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobWithEmpresa[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchQuery, locationFilter, jobTypeFilter, jobs])

  const loadJobs = async () => {
    try {
      const response = await api.get("/vagas_de_emprego_com_empresas")
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
          job.nome_vaga_de_emprego.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.empresa.nome_empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.descricao.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((job) => job.estado.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    if (jobTypeFilter !== "all") {
      filtered = filtered.filter((job) => job.modalidade.toLowerCase() === jobTypeFilter.toLowerCase())
    }

    setFilteredJobs(filtered)
  }

  const getJobTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      full_time: "Tempo Integral",
      part_time: "Meio Período",
      contract: "Contrato",
      internship: "Estágio",
      remote: "Remoto",
    }
    return typeMap[type] || type
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "full_time":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "part_time":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "contract":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "internship":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Híbrido":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoje"
    if (diffDays === 1) return "Ontem"
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
    return date.toLocaleDateString("pt-BR")
  }

  if (loading) {
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Buscar Vagas</h1>
            <p className="text-muted-foreground">Encontre a oportunidade perfeita para você</p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cargo, empresa ou palavra-chave..."
                    className="pl-10 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="flex-1">
                      <MapPin className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Localização">
                        {(locationFilter == "all") ? "Todas as localidades" : locationFilter || "Localização"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      <SelectItem key="Todas as localidades" value="all">
                        Todas as localidades
                      </SelectItem>
                      {ESTADOS_BR.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                    <SelectTrigger className="flex-1">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Tipo de vaga" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                      <SelectItem value="Remoto">Remoto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <p className="text-muted-foreground mb-4">Nenhuma vaga encontrada com os filtros aplicados</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setLocationFilter("all")
                    setJobTypeFilter("all")
                  }}
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id_vaga_de_emprego} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <Link href={`/jobs/${job.id_vaga_de_emprego}`}>
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                              {job.nome_vaga_de_emprego}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">{job.empresa.nome_empresa}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.cidade}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(job.data)}
                              </div>
                              {job.salario && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  R$ {job.salario}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.descricao}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-3">
                          <Badge className={getJobTypeColor(job.modalidade)}>{getJobTypeLabel(job.modalidade)}</Badge>
                          <Button size="sm">Ver Detalhes</Button>
                        </div>
                      </div>
                    </Link>
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
