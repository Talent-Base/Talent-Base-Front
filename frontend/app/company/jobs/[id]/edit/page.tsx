"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Job } from "@/app/jobs/interface/jobs"
import { ESTADOS_BR } from "@/lib/constants"

export default function EditJobPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Job>>({
    nome_vaga_de_emprego: "",
    cidade: "",
    estado: "",
    salario: "",
    cargo: "",
    nivel: "",
    tipo_contrato: "",
    modalidade: "",
    descricao: "",
  })

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "gestor")) {
      router.push("/login")
    } else if (user) {
      loadJob()
    }
  }, [user, authLoading])

  const loadJob = async () => {
    try {
      const response = await api.get(`/vagas_de_emprego/${params.id}`)
      setFormData(response.data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar vaga",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
      router.push("/company/jobs")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Job, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put(`/vagas_de_emprego/${params.id}`, formData)
      toast({
        title: "Vaga atualizada!",
        description: "Suas alterações foram salvas com sucesso.",
      })
      router.push("/company/jobs")
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar vaga",
        description: error.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

    function formatFaixaSalarial(value: string) {
        value = value.replace(/[^\d\-]/g, "");

        const partes = value.split("-").map((p) => p.trim());

        if (partes.length === 1) {
            return partes[0]; 
        }

        if (partes.length === 2) {
            const inicio = partes[0];
            const fim = partes[1];
            return fim ? `${inicio} - ${fim}` : `${inicio} - `;
        }

        return value;
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
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/company/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Editar Vaga</h1>
            <p className="text-muted-foreground">Atualize as informações da vaga</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Detalhes principais da vaga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_vaga_de_emprego">Título da Vaga</Label>
                  <Input
                    id="nome_vaga_de_emprego"
                    placeholder="Ex: Desenvolvedor Full Stack"
                    value={formData.nome_vaga_de_emprego}
                    onChange={(e) => handleChange("nome_vaga_de_emprego", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    placeholder="Ex: Desenvolvedor"
                    value={formData.cargo}
                    onChange={(e) => handleChange("cargo", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      placeholder="São Paulo"
                      value={formData.cidade}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                        value={formData.estado ?? ""}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="nivel">Nível</Label>
                    <Select value={formData.nivel} onValueChange={(value) => handleChange("nivel", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Pleno">Pleno</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Executivo">Executivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                    <Select
                      value={formData.tipo_contrato}
                      onValueChange={(value) => handleChange("tipo_contrato", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLT">CLT</SelectItem>
                        <SelectItem value="Estagio">Estágio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modalidade">Modalidade</Label>
                    <Select value={formData.modalidade} onValueChange={(value) => handleChange("modalidade", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                        <SelectItem value="Híbrido">Híbrido</SelectItem>
                        <SelectItem value="Remoto">Remoto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                    {/* <div className="space-y-2 w-full">
                      <Label htmlFor="salario">Faixa Salarial</Label>
                      <Input
                        id="salario"
                        placeholder="R$ 5.000 - R$ 8.000"
                        value={formData.salario}
                        onChange={(e) => handleChange("salario", formatFaixaSalarial(e.target.value))}
                      />
                    </div> */}
                <div className="space-y-2">
                  <Label htmlFor="salario">Salário (R$)</Label>
                  <Input
                    id="salario"
                    placeholder="5.000 - R$ 8.000"
                    value={formData.salario}
                    onChange={(e) => handleChange("salario", formatFaixaSalarial(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descrição da Vaga</CardTitle>
                <CardDescription>Detalhe as informações da vaga</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição Completa</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Inclua descrição da vaga, responsabilidades, requisitos, benefícios, etc..."
                    rows={12}
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Inclua descrição da vaga, responsabilidades, requisitos necessários e desejáveis, benefícios
                    oferecidos, etc.
                  </p>
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
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
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