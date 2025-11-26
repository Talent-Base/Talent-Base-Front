"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"
import { Loader2, Search, ArrowLeft, User, Ban, Shield } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Usuario } from "../interface/usuario"

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Usuario[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [banUserId, setBanUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.papel !== "admin")) {
      router.push("/login")
    } else if (user) {
      loadUsers()
    }
  }, [user, authLoading])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, typeFilter, users])

  const loadUsers = async () => {
    try {
      const response = await api.get("/usuarios")
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((u) => u.papel === typeFilter)
    }

    setFilteredUsers(filtered)
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/toggle_user_status/${userId}`, {
        new_status: !currentStatus,
      })

      setUsers((prev) => prev.map((u) => (u.id.toString() === userId ? { ...u, ativo: !currentStatus } : u)))

      toast({
        title: "Status atualizado",
        description: `Usuário ${!currentStatus ? "ativado" : "banido"} com sucesso.`,
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.response?.data?.message || "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setBanUserId(null)
    }
  }

  const getUserTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      candidato: "Candidato",
      company: "Gestor",
      admin: "Admin",
    }
    return typeMap[type] || type
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "candidato":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "gestor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
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
        <div className="container mx-auto max-w-7xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao painel
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Visualize e modere todos os usuários da plataforma</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="candidato">Candidatos</SelectItem>
                    <SelectItem value="gestor">Gestores</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} {filteredUsers.length === 1 ? "usuário encontrado" : "usuários encontrados"}
            </p>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((userData) => (
                <Card key={userData.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">{userData.nome}</h3>
                            {!userData.ativo && <Badge variant="destructive">Banido</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{userData.email}</p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <Badge className={getUserTypeColor(userData.papel)}>
                              {getUserTypeLabel(userData.papel)}
                            </Badge>
                            {/* <span className="text-muted-foreground">
                              Cadastrado em {new Date(userData.created_at).toLocaleDateString("pt-BR")}
                            </span> */}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {userData.ativo ? (
                          <Button variant="outline" size="sm" onClick={() => setBanUserId(userData.id.toString())}>
                            <Ban className="h-4 w-4 mr-2 text-destructive" />
                            Banir
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(userData.id.toString(), userData.ativo)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Ativar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={!!banUserId} onOpenChange={() => setBanUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Banimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja banir este usuário? Ele não poderá mais acessar a plataforma até que seja
              reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const userData = users.find((u) => u.id.toString() === banUserId)
                if (userData) {
                  toggleUserStatus(userData.id.toString(), userData.ativo)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Banir Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
