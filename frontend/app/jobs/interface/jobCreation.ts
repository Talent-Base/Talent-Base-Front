enum Nivel {
    JUNIOR = "Junior",
    SENIOR = "Senior",
    PLENO = "Pleno",
    EXECUTIVO = "Executivo"
}

enum Modalidade {
    CLT = "CLT",
    ESTAGIO = "Estagio"
}

enum TipoContrato {
    PRESENCIAL = "Presencial",
    HIBRIDO = "Híbrido",
    REMOTO = "Remoto"
}

export interface JobCreation {
    nome_vaga_de_emprego: string
    id_empresa: number
    data: string
    estado: string
    cidade: string
    salario: number
    cargo: string
    nivel: Nivel
    tipo_contrato: TipoContrato
    modalidade: Modalidade
    descricao: string
}