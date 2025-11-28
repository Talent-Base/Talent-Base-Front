export interface Empresa {
  id_empresa: number
  nome_empresa: string
  estado: string
  cidade: string
  cnpj: string
  email_contato: string
  descricao: string
}

export interface UpdateEmpresa {

  nome_empresa: string
  estado: string
  cidade: string
  email_contato: string
  descricao: string
}