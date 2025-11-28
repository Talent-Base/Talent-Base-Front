export interface Experiencia {
  id_experiencia: number
  id_candidato: number
  nome_instituicao: string
  cargo: string
  periodo_experiencia: string
  descricao: string
  nome_curso?: string
  grau_obtido?: string
}