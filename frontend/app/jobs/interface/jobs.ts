import { Empresa } from "@/app/companies/interface/empresa"

export interface Job {
  id_vaga_de_emprego: string
  nome_vaga_de_emprego: string
  id_empresa: string
  cidade: string
  estado: string
  modalidade: string
  cargo: string
  salario: string
  descricao: string
  nivel: string
  tipo_contrato: string
  data: string
  is_active: boolean
  empresa: Empresa
}