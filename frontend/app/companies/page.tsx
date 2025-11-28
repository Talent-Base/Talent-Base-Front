"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import api from "@/lib/axios-config"
import { Search, Building2, Loader2, MapPin, Briefcase } from "lucide-react"
import { Empresa } from "./interface/empresa"

interface Company {
  id_empresa: string
  nome_empresa: string
  descricao: string
  cidade: string
  estado: string
  website: string
  active_jobs_count: number
}

export default function CompaniesPage() {
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Empresa[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Empresa[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    filterCompanies()
  }, [searchQuery, companies])

  const loadCompanies = async () => {
    try {
      const response = await api.get("/empresas")
      setCompanies(response.data)
      setFilteredCompanies(response.data)
    } catch (error) {
      console.error("Error loading companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    if (searchQuery) {
      const filtered = companies.filter(
        (company) =>
          company.nome_empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.estado.toLocaleUpperCase().includes(searchQuery.toLocaleUpperCase()) ||
          company.cidade.toLowerCase().includes(searchQuery.toLowerCase()),
          
      )
      setFilteredCompanies(filtered)
    } else {
      setFilteredCompanies(companies)
    }
  }

  if (loading) {
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Empresas</h1>
            <p className="text-muted-foreground">Conheça as empresas que estão contratando</p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas..."
                  className="pl-10 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredCompanies.length}{" "}
              {filteredCompanies.length === 1 ? "empresa encontrada" : "empresas encontradas"}
            </p>
          </div>

          {/* Companies Grid */}
          {filteredCompanies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Link key={company.id_empresa} href={`/companies/${company.id_empresa}`}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                            {company.nome_empresa}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                            {company.descricao}
                          </p>
                          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {company.cidade} - {company.estado}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
