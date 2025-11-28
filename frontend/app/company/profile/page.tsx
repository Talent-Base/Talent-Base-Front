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

import { Empresa } from "@/app/companies/interface/empresa"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ESTADOS_BR } from "@/lib/constants"

export default function CompanyProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Empresa>({
    id_empresa: 0,
    cnpj: "",
    nome_empresa: "",
    email_contato: "",
    descricao: "",
    estado: "",
    cidade: ""
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
      const gestor = await api.get(`/gestores/${user?.id}`)
      const response = await api.get(`/empresas/${gestor.data.id_empresa}`)
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
      await api.put(`/empresas/${profile.id_empresa}`, profile)
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

  const handleChange = (field: string, value: string) => {
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
                      value={profile.nome_empresa}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email_contato}
                      onChange={(e) => handleChange("email_contato", e.target.value)}
                      
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      placeholder="São Paulo, SP"
                      value={profile.cidade}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={profile.estado ?? ""}
                        onValueChange={(value) => handleChange("estado", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="SP" />
                        </SelectTrigger>

                        <SelectContent className="max-h-48">
                          {ESTADOS_BR.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Sobre a Empresa</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva a missão, visão e valores da sua empresa..."
                    rows={5}
                    value={profile.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                  />
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
