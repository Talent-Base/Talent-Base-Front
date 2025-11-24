"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState(searchParams.get("type") || "candidato")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type) setUserType(type)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(email, password, name, userType)
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao TalentBase.",
      })
      router.push("/jobs")
    } catch (error: any) {

      console.log("ERRO COMPLETO:", error)
      console.log("RESPONSE:", error.response)
      console.log("DATA:", error.response?.data)
      
      toast({
        title: "Erro ao criar conta",
        description: error.response?.data?.detail || "Erro inesperado. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">TB</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Criar Conta no TalentBase</CardTitle>
          <CardDescription>Preencha seus dados para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <RadioGroup value={userType} onValueChange={setUserType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="candidato" id="candidato" />
                  <Label htmlFor="candidato" className="font-normal cursor-pointer">
                    Candidato - Buscar Vagas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gestor" id="gestor" />
                  <Label htmlFor="gestor" className="font-normal cursor-pointer">
                    Empresa - Divulgar Vagas
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{userType === "gestor" ? "Nome da Empresa" : "Nome Completo"}</Label>
              <Input
                id="name"
                type="text"
                placeholder={userType === "gestor" ? "Empresa LTDA" : "João Silva"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
