"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/axios-config"
import { Loader2, Building2, MapPin, ArrowLeft, Briefcase, Clock, Mail } from "lucide-react"
import { Empresa } from "../interface/empresa"
import { JobWithEmpresa } from "@/app/jobs/interface/jobs"

export default function CompanyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [company, setCompany] = useState<Empresa | null>(null)
    const [jobs, setJobs] = useState<JobWithEmpresa[] | null>([])

    useEffect(() => {
        loadCompany()
    }, [params.id])

    const loadCompany = async () => {
        try {
            const companyRes = await api.get(`/empresas/${params.id}`)
            setCompany(companyRes.data)

            try {
                const jobsRes = await api.get(`/empresas/${params.id}/vagas_de_emprego`)
                setJobs(jobsRes.data)
            } catch (err) {
                console.warn("Empresa sem vagas ou erro ao buscar vagas:", err)
                setJobs([])
            }

        } catch (error) {
            console.error("Error loading company:", error)
            router.push("/companies")
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
        return typeMap[type] || type
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!company) {
        return null
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 py-8 px-4">
                <div className="container mx-auto max-w-6xl">
                    <Button variant="ghost" asChild className="mb-6">
                        <Link href="/companies">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para Empresas
                        </Link>
                    </Button>

                    {/* Company Header */}
                    <Card className="mb-8">
                        <CardContent className="pt-8">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-12 w-12 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold mb-3">{company.nome_empresa}</h1>
                                    <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>
                                                {company.cidade}, {company.estado}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span>
                                                {company?.email_contato}
                                            </span>
                                        </div>  
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            <span>
                                                {jobs?.length} {jobs?.length === 1 ? "vaga" : "vagas"}
                                            </span>
                                        </div>
                                        
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">{company.descricao}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Company Jobs */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Vagas Disponíveis</h2>
                        <p className="text-muted-foreground">
                            {jobs?.length === 0
                                ? "Esta empresa não tem vagas ativas no momento"
                                : `${jobs?.length} ${jobs?.length === 1 ? "vaga disponível" : "vagas disponíveis"}`}
                        </p>
                    </div>

                    {jobs?.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">Nenhuma vaga disponível no momento</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {jobs?.map((job) => (
                                <Link key={job.id_vaga_de_emprego} href={`/jobs/${job.id_vaga_de_emprego}`}>
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                                                        {job.nome_vaga_de_emprego}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                                                        {job.descricao}
                                                    </p>
                                                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {job.cidade}, {job.estado}
                                                        </div>
                                                        <span>•</span>
                                                        <Badge variant="secondary">{getJobTypeLabel(job.tipo_contrato)}</Badge>
                                                        {job.salario && (
                                                            <>
                                                                <span>•</span>
                                                                <span>R$ {job.salario}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{new Date(job.data).toLocaleDateString("pt-BR")}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
