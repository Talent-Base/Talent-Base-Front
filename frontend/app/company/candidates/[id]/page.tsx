"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"
import { Loader2, ArrowLeft, Mail, MapPin, Briefcase, GraduationCap, Building2, User } from "lucide-react"
// import type { Candidato, Experiencia } from "@/lib/types"
import { Candidato } from "@/app/profile/interface/candidato"
import { Experiencia } from "@/app/experiences/interface/experiencia"

export default function CandidateDetailPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [candidate, setCandidate] = useState<Candidato | null>(null)
  const [experiences, setExperiences] = useState<Experiencia[]>([])

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "gestor")) {
      router.push("/login")
    } else if (user) {
      loadCandidateData()
    }
  }, [user, authLoading])

  const loadCandidateData = async () => {
    try {
      const [candidateRes, experiencesRes] = await Promise.all([
        api.get(`/candidatos/${params.id}`),
        api.get(`/experiencias/${params.id}`), //getExperienciasByCandidatoId
      ])
      setCandidate(candidateRes.data)
      setExperiences(experiencesRes.data)
    } catch (error) {
      console.error("Error loading candidate data:", error)
      toast({
        title: "Erro ao carregar dados do candidato",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
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

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl font-bold mb-4">Candidato não encontrado</h1>
            <Button asChild>
              <Link href="/company/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const professionalExperiences = experiences.filter((exp) => !exp.nome_curso)
  const academicExperiences = experiences.filter((exp) => exp.nome_curso)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{candidate.nome}</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>
                        {candidate.titulo_profissional || "Profissional"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                        {candidate.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {candidate.cidade}, {candidate.estado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidate.situacao_empregaticia && 
                (<div>
                  <h3 className="font-semibold mb-2">Situação Empregatícia</h3>
                  <p className="text-sm text-muted-foreground">{candidate.situacao_empregaticia}</p>
                </div>
                )}

                {candidate.resumo && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Sobre</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {candidate.resumo}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Experiences */}
          {professionalExperiences.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Experiências Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {professionalExperiences.map((experience, index) => (
                    <div key={experience.id_experiencia}>
                      {index > 0 && <Separator className="my-6" />}
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{experience.cargo}</h4>
                        <p className="text-muted-foreground font-medium mb-1">{experience.nome_instituicao}</p>
                        <p className="text-sm text-muted-foreground mb-3">{experience.periodo_experiencia}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {experience.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Academic Experiences */}
          {academicExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formação Acadêmica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {academicExperiences.map((experience, index) => (
                    <div key={experience.id_experiencia}>
                      {index > 0 && <Separator className="my-6" />}
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{experience.cargo}</h4>
                        <p className="text-muted-foreground font-medium mb-1">{experience.nome_instituicao}</p>
                        {experience.nome_curso && (
                          <p className="text-sm text-muted-foreground mb-1">{experience.nome_curso}</p>
                        )}
                        {experience.grau_obtido && (
                          <p className="text-sm text-muted-foreground mb-1">{experience.grau_obtido}</p>
                        )}
                        <p className="text-sm text-muted-foreground mb-3">{experience.periodo_experiencia}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {experience.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {experiences.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Este candidato ainda não adicionou experiências</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
