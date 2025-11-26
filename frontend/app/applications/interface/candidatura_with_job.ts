import { Job } from "@/app/jobs/interface/jobs"

export interface CandidaturaWithJob {
  id_candidatura: string
  id_vaga_de_emprego: string
  status: string
  data: string
  data_atualizacao: string
  vaga: Job
//   job_title: string
//   company_name: string
//   updated_at: string
}
