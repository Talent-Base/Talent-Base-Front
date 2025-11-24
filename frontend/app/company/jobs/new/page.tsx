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
import { useToast } from "@/job-board/hooks/use-toast"
import api from "@/lib/axios-config"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewJobPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    job_type: "full_time",
    salary_range: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
  })

  useEffect(() => {
    if (!authLoading && (!user || user.user_type !== "company")) {
      router.push("/login")
    }
  }, [user, authLoading])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.post("/companies/jobs", formData)
      toast({
        title: "Vaga criada!",
        description: "Sua vaga foi publicada com sucesso.",
      })
      router.push("/company/jobs")
    } catch (error: any) {
      toast({
        title: "Erro ao criar vaga",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
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
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/company/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Nova Vaga</h1>
            <p className="text-muted-foreground">Preencha os detalhes da vaga que deseja publicar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Detalhes principais da vaga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Vaga</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Desenvolvedor Full Stack"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      placeholder="São Paulo, SP"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Tipo de Vaga</Label>
                    <Select value={formData.job_type} onValueChange={(value) => handleChange("job_type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Tempo Integral</SelectItem>
                        <SelectItem value="part_time">Meio Período</SelectItem>
                        <SelectItem value="contract">Contrato</SelectItem>
                        <SelectItem value="internship">Estágio</SelectItem>
                        <SelectItem value="remote">Remoto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Faixa Salarial</Label>
                    <Input
                      id="salary_range"
                      placeholder="R$ 5.000 - R$ 8.000"
                      value={formData.salary_range}
                      onChange={(e) => handleChange("salary_range", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descrição da Vaga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a vaga, o que o candidato irá fazer..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsabilidades</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="Liste as principais responsabilidades do cargo..."
                    rows={4}
                    value={formData.responsibilities}
                    onChange={(e) => handleChange("responsibilities", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requisitos</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Liste os requisitos necessários ou desejáveis..."
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => handleChange("requirements", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefícios</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Liste os benefícios oferecidos..."
                    rows={3}
                    value={formData.benefits}
                    onChange={(e) => handleChange("benefits", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/company/jobs">Cancelar</Link>
              </Button>
              <Button type="submit" size="lg" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Publicar Vaga
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
