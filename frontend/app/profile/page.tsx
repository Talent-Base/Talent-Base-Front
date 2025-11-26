"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"

// interface CandidateProfile {
//   name: string
//   email: string
//   phone: string
//   location: string
//   title: string
//   bio: string
//   skills: string
//   experience: string
//   education: string
//   linkedin: string
//   github: string
//   portfolio: string
// }

interface Candidato {
  id_candidato: number
  nome: string
  email: string
  cidade: string
  estado: string
  resumo: string
  situacao_empregaticia: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Candidato>({
    id_candidato: 0,
    nome: "",
    email: "",
    cidade: "",
    estado: "",
    resumo: "",
    situacao_empregaticia: ""
  })
  // const [profile, setProfile] = useState<CandidateProfile>({
  //   name: "",
  //   email: "",
  //   phone: "",
  //   location: "",
  //   title: "",
  //   bio: "",
  //   skills: "",
  //   experience: "",
  //   education: "",
  //   linkedin: "",
  //   github: "",
  //   portfolio: "",
  // })

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "candidato")) {
      router.push("/login")
    } else if (user) {
      loadProfile()
    }
  }, [user, authLoading])

  const loadProfile = async () => {
    try {
      const response = await api.get(`candidatos/${user?.id}`)
      setProfile(response.data)
      console.log(response)
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put(`/candidatos/${profile?.id_candidato}`, profile)
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // const handleChange = (field: keyof CandidateProfile, value: string) => {
  const handleChange = (field: keyof Candidato, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
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
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
          </Link>
        </Button>
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Mantenha suas informações atualizadas para aumentar suas chances de ser contratado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Dados básicos sobre você</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={profile.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={profile.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      placeholder="São Paulo, SP"
                      value={profile?.cidade ?? ""}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                    />
                  </div>
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="title">Título Profissional</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Desenvolvedor Full Stack"
                    value={profile.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre Você</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre sua trajetória profissional e objetivos..."
                    rows={4}
                    value={profile?.resumo ?? ""}
                    onChange={(e) => handleChange("resumo", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>Suas habilidades e experiência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Habilidades</Label>
                  <Textarea
                    id="skills"
                    placeholder="Ex: JavaScript, React, Node.js, Python, SQL..."
                    rows={3}
                    value={profile.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experiência Profissional</Label>
                  <Textarea
                    id="experience"
                    placeholder="Descreva suas experiências anteriores..."
                    rows={5}
                    value={profile.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Formação Acadêmica</Label>
                  <Textarea
                    id="education"
                    placeholder="Seus cursos, graduações e certificações..."
                    rows={4}
                    value={profile.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card> */}

            {/* Links */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Links Profissionais</CardTitle>
                <CardDescription>Compartilhe seus perfis e portfólio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/seu-perfil"
                    value={profile.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    type="url"
                    placeholder="https://github.com/seu-usuario"
                    value={profile.github}
                    onChange={(e) => handleChange("github", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio / Website</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    placeholder="https://seu-portfolio.com"
                    value={profile.portfolio}
                    onChange={(e) => handleChange("portfolio", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card> */}

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Perfil
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
