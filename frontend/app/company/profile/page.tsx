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

interface CompanyProfile {
  name: string
  email: string
  description: string
  location: string
  website: string
  industry: string
  company_size: string
  founded_year: string
}

export default function CompanyProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile>({
    name: "",
    email: "",
    description: "",
    location: "",
    website: "",
    industry: "",
    company_size: "",
    founded_year: "",
  })

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "gestor")) {
      router.push("/login")
    } else if (user) {
      loadProfile()
    }
  }, [user, authLoading])

  const loadProfile = async () => {
    try {
      const response = await api.get("/companies/profile")
      setProfile(response.data)
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
      await api.put("/companies/profile", profile)
      toast({
        title: "Perfil atualizado!",
        description: "As informações da empresa foram salvas com sucesso.",
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

  const handleChange = (field: keyof CompanyProfile, value: string) => {
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
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/company/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Perfil da Empresa</h1>
            <p className="text-muted-foreground">Mantenha as informações da sua empresa atualizadas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais da empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Empresa</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      placeholder="São Paulo, SP"
                      value={profile.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://empresa.com.br"
                      value={profile.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Sobre a Empresa</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a missão, visão e valores da sua empresa..."
                    rows={5}
                    value={profile.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes Adicionais</CardTitle>
                <CardDescription>Informações complementares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor</Label>
                    <Input
                      id="industry"
                      placeholder="Ex: Tecnologia, Saúde, Educação"
                      value={profile.industry}
                      onChange={(e) => handleChange("industry", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Tamanho da Empresa</Label>
                    <Input
                      id="company_size"
                      placeholder="Ex: 10-50, 51-200, 200+"
                      value={profile.company_size}
                      onChange={(e) => handleChange("company_size", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded_year">Ano de Fundação</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      placeholder="2020"
                      value={profile.founded_year}
                      onChange={(e) => handleChange("founded_year", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
