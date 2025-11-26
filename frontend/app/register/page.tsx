// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { useAuth } from "@/lib/auth-context"
// import { useToast } from "@/hooks/use-toast"

// export default function RegisterPage() {
//   const searchParams = useSearchParams()
//   const [name, setName] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [userType, setUserType] = useState(searchParams.get("type") || "candidato")
//   const [loading, setLoading] = useState(false)
//   const { register } = useAuth()
//   const router = useRouter()
//   const { toast } = useToast()

//   useEffect(() => {
//     const type = searchParams.get("type")
//     if (type) setUserType(type)
//   }, [searchParams])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       await register(email, password, name, userType)
//       toast({
//         title: "Conta criada com sucesso!",
//         description: "Bem-vindo ao TalentBase.",
//       })
//       router.push("/jobs")
//     } catch (error: any) {

//       console.log("ERRO COMPLETO:", error)
//       console.log("RESPONSE:", error.response)
//       console.log("DATA:", error.response?.data)
      
//       toast({
//         title: "Erro ao criar conta",
//         description: error.response?.data?.detail || "Erro inesperado. Tente novamente mais tarde.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-primary/5 to-background">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center mb-4">
//             <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
//               <span className="text-primary-foreground font-bold text-xl">TB</span>
//             </div>
//           </div>
//           <CardTitle className="text-2xl">Criar Conta no TalentBase</CardTitle>
//           <CardDescription>Preencha seus dados para começar</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label>Tipo de Conta</Label>
//               <RadioGroup value={userType} onValueChange={setUserType}>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="candidato" id="candidato" />
//                   <Label htmlFor="candidato" className="font-normal cursor-pointer">
//                     Candidato - Buscar Vagas
//                   </Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="gestor" id="gestor" />
//                   <Label htmlFor="gestor" className="font-normal cursor-pointer">
//                     Empresa - Divulgar Vagas
//                   </Label>
//                 </div>
//               </RadioGroup>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="name">{userType === "gestor" ? "Nome da Empresa" : "Nome Completo"}</Label>
//               <Input
//                 id="name"
//                 type="text"
//                 placeholder={userType === "gestor" ? "Empresa LTDA" : "João Silva"}
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">E-mail</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="seu@email.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Senha</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 minLength={6}
//               />
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? "Criando conta..." : "Criar Conta"}
//             </Button>
//           </form>

//           <div className="mt-6 text-center text-sm">
//             <span className="text-muted-foreground">Já tem uma conta? </span>
//             <Link href="/login" className="text-primary hover:underline font-medium">
//               Faça login
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
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
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/axios-config"


export default function RegisterPage() {
  const searchParams = useSearchParams()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState(searchParams.get("type") || "candidato")
  const [loading, setLoading] = useState(false)

  const [empresaNome, setEmpresaNome] = useState("")
  const [empresaCnpj, setEmpresaCnpj] = useState("")
  const [empresaCidade, setEmpresaCidade] = useState("")
  const [empresaEstado, setEmpresaEstado] = useState("")
  const [empresaDescricao, setEmpresaDescricao] = useState("")

  const { register_candidato, register_gestor } = useAuth()
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
      const userData: any = {
        email,
        password,
        name,
        userType,
      }

      if (userType === "candidato"){
        await register_candidato(userData.email, userData.password, userData.name, userData.userType)
      }
      else if (userType === "gestor") {
        userData.empresa = {
          nome_empresa: empresaNome,
          cnpj: empresaCnpj,
          cidade: empresaCidade,
          estado: empresaEstado,
          descricao: empresaDescricao,
        }
        await register_gestor(userData.email, userData.password, userData.name, userData.userType, userData.empresa)
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao TalentBase.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.log("ERRO COMPLETO:", error)
      console.log("RESPONSE:", error.response)
      console.log("DATA:", error.response?.data)
      toast({
        title: "Erro ao criar conta",
        description: error.response?.data?.detail || "Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-2xl">
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
                    Gestor de Empresa - Divulgar Vagas
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dados do Gestor/Candidato */}
            <div className="space-y-2">
              <Label htmlFor="name">{userType === "gestor" ? "Nome do Gestor" : "Nome Completo"}</Label>
              <Input
                id="name"
                type="text"
                placeholder={userType === "gestor" ? "Maria Silva" : "João Silva"}
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

            {userType === "gestor" && (
              <>
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Dados da Empresa</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="empresaNome">Nome da Empresa</Label>
                      <Input
                        id="empresaNome"
                        type="text"
                        placeholder="Empresa LTDA"
                        value={empresaNome}
                        onChange={(e) => setEmpresaNome(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="empresaCnpj">CNPJ</Label>
                        <Input
                          id="empresaCnpj"
                          type="text"
                          placeholder="00.000.000/0000-00"
                          value={empresaCnpj}
                          onChange={(e) => setEmpresaCnpj(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="empresaCidade">Cidade</Label>
                        <Input
                          id="empresaCidade"
                          placeholder="São Paulo"
                          value={empresaCidade}
                          onChange={(e) => setEmpresaCidade(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="empresaEstado">Estado</Label>
                      <Input
                        id="empresaEstado"
                        placeholder="SP"
                        maxLength={2}
                        value={empresaEstado}
                        onChange={(e) => setEmpresaEstado(e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="empresaDescricao">Sobre a Empresa</Label>
                      <Textarea
                        id="empresaDescricao"
                        placeholder="Descreva o setor de atuação, história, valores da empresa..."
                        rows={4}
                        value={empresaDescricao}
                        onChange={(e) => setEmpresaDescricao(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

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
