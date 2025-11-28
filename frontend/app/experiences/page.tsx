"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"
import { Loader2, Plus, ArrowLeft, Pencil, Trash2, Building2, GraduationCap, Briefcase } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Experiencia } from "./interface/experiencia"

export default function ExperiencesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [experiences, setExperiences] = useState<Experiencia[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experiencia | null>(null)
  const [experienceType, setExperienceType] = useState<"profissional" | "academica">("profissional")
  const regexPeriodo = /^(Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez) \d{4} - (Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez) \d{4}$/;

  const [formData, setFormData] = useState({
    nome_instituicao: "",
    cargo: "",
    periodo_experiencia: "",
    descricao: "",
    nome_curso: "",
    grau_obtido: "",
  })

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "candidato")) {
      router.push("/login")
    } else if (user) {
      loadExperiences()
    }
  }, [user, authLoading])

  const loadExperiences = async () => {
    try {
      const response = await api.get(`/experiencias/${user?.id}`)
      setExperiences(response.data)
    } catch (error) {
      console.error("Error loading experiences:", error)
      toast({
        title: "Erro ao carregar experiências",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!regexPeriodo.test(formData.periodo_experiencia))
      throw new Error("Use o formato: Jan 2020 - Dez 2023")
      const payload = {
        nome_instituicao: formData.nome_instituicao,
        cargo: formData.cargo,
        periodo_experiencia: formData.periodo_experiencia,
        descricao: formData.descricao,
        ...(experienceType === "academica" && {
          nome_curso: formData.nome_curso,
          grau_obtido: formData.grau_obtido,
        }),
      }

      if (editingExperience) {
        await api.put(`/experiencias/${editingExperience.id_experiencia}`, payload)
        toast({
          title: "Experiência atualizada",
          description: "Suas alterações foram salvas com sucesso.",
        })
      } else {
        await api.post(`/experiencias/${user?.id}`, payload)
        toast({
          title: "Experiência adicionada",
          description: "Sua experiência foi adicionada com sucesso.",
        })
      }

      loadExperiences()
      handleCloseDialog()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar experiência",
        description: error.response?.data?.message || error?.message || "Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/experiencias/${id}`)
      toast({
        title: "Experiência excluída",
        description: "A experiência foi removida com sucesso.",
      })
      loadExperiences()
    } catch (error) {
      toast({
        title: "Erro ao excluir experiência",
        description: "Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (experience: Experiencia) => {
    setEditingExperience(experience)
    setExperienceType(experience.nome_curso ? "academica" : "profissional")
    setFormData({
      nome_instituicao: experience.nome_instituicao,
      cargo: experience.cargo,
      periodo_experiencia: experience.periodo_experiencia,
      descricao: experience.descricao,
      nome_curso: experience.nome_curso || "",
      grau_obtido: experience.grau_obtido || "",
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingExperience(null)
    setExperienceType("profissional")
    setFormData({
      nome_instituicao: "",
      cargo: "",
      periodo_experiencia: "",
      descricao: "",
      nome_curso: "",
      grau_obtido: "",
    })
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
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>

          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Minhas Experiências</h1>
              <p className="text-muted-foreground">Gerencie suas experiências profissionais e acadêmicas</p>
            </div>

            <Dialog 
                open={isDialogOpen} 
                onOpenChange={(open) => {
                    if (open) {
                    setIsDialogOpen(true);
                    } else {
                    handleCloseDialog();
                    }
                }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Experiência
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingExperience ? "Editar Experiência" : "Nova Experiência"}</DialogTitle>
                  <DialogDescription>
                    {editingExperience ? "Mantenha suas experiências sempre atualizadas para enriquecer seu perfil." : "Adicione suas experiências profissionais ou acadêmicas para enriquecer seu perfil."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div>
                    <Label>Tipo de Experiência</Label>
                    <Select
                      value={experienceType}
                      onValueChange={(value: "profissional" | "academica") => setExperienceType(value)}
                      disabled={!!editingExperience}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profissional">Profissional</SelectItem>
                        <SelectItem value="academica">Acadêmica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nome_instituicao">
                      {experienceType === "profissional" ? "Nome da Empresa" : "Nome da Instituição"}
                    </Label>
                    <Input
                      id="nome_instituicao"
                      value={formData.nome_instituicao}
                      onChange={(e) => setFormData({ ...formData, nome_instituicao: e.target.value })}
                      placeholder={experienceType === "profissional" ? "Ex: Google Brasil" : "Ex: Universidade Federal"}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargo">{experienceType === "profissional" ? "Cargo" : "Área de Estudo"}</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      placeholder={
                        experienceType === "profissional" ? "Ex: Desenvolvedor Full Stack" : "Ex: Ciência da Computação"
                      }
                      required
                    />
                  </div>

                  {experienceType === "academica" && (
                    <>
                      <div>
                        <Label htmlFor="nome_curso">Nome do Curso</Label>
                        <Input
                          id="nome_curso"
                          value={formData.nome_curso}
                          onChange={(e) => setFormData({ ...formData, nome_curso: e.target.value })}
                          placeholder="Ex: Bacharelado em Ciência da Computação"
                        />
                      </div>

                      <div>
                        <Label htmlFor="grau_obtido">Grau Obtido</Label>
                        <Select
                          value={formData.grau_obtido}
                          onValueChange={(value) => setFormData({ ...formData, grau_obtido: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o grau" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                            <SelectItem value="Técnico">Técnico</SelectItem>
                            <SelectItem value="Graduação">Graduação</SelectItem>
                            <SelectItem value="Pós-Graduação">Pós-Graduação</SelectItem>
                            <SelectItem value="Mestrado">Mestrado</SelectItem>
                            <SelectItem value="Doutorado">Doutorado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="periodo_experiencia">Período</Label>
                    <Input
                      id="periodo_experiencia"
                      value={formData.periodo_experiencia}
                      onChange={(e) => setFormData({ ...formData, periodo_experiencia: e.target.value })}
                      placeholder="Ex: Jan 2020 - Dez 2023"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva suas responsabilidades e conquistas..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingExperience ? "Salvar Alterações" : "Adicionar"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {experiences.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhuma experiência cadastrada</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione suas experiências profissionais e acadêmicas para destacar seu perfil
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeira Experiência
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {experiences.map((experience) => {
                const isAcademic = !!experience.nome_curso
                return (
                  <Card key={experience.id_experiencia}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isAcademic ? "bg-blue-100 dark:bg-blue-900" : "bg-primary/10"
                            }`}
                          >
                            {isAcademic ? (
                              <GraduationCap
                                className={`h-6 w-6 ${isAcademic ? "text-blue-600 dark:text-blue-400" : "text-primary"}`}
                              />
                            ) : (
                              <Building2 className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-1">{experience.cargo}</CardTitle>
                            <p className="text-muted-foreground font-medium mb-1">{experience.nome_instituicao}</p>
                            {isAcademic && experience.nome_curso && (
                              <p className="text-sm text-muted-foreground mb-1">{experience.nome_curso}</p>
                            )}
                            {isAcademic && experience.grau_obtido && (
                              <p className="text-sm text-muted-foreground mb-1">{experience.grau_obtido}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{experience.periodo_experiencia}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(experience)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta experiência? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(experience.id_experiencia)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {experience.descricao}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
