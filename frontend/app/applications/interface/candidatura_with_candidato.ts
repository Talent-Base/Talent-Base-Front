// interface Application {
//   id: string
//   candidate_id: string
//   candidate_name: string
//   candidate_email: string
//   candidate_phone: string
//   candidate_location: string
//   candidate_title: string
//   candidate_bio: string
//   candidate_skills: string
//   candidate_linkedin: string
//   candidate_github: string
//   candidate_portfolio: string
//   status: string
//   applied_at: string
//   updated_at: string

// }
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
