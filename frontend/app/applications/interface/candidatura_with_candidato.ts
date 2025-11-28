import { Candidato } from "@/app/profile/interface/candidato"

export interface CandidaturaWithCandidato {
    id_candidatura: number
    id_candidato: number
    id_vaga_de_emprego: number
    status: string
    data: string
    data_atualizacao: string
    candidato: Candidato
}
