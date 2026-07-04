export interface Job {
  id: string
  titulo: string
  empresa: string
  localizacao: string
  descricao: string
  link: string
  tags: string
  salario_min: number | null
  salario_max: number | null
  moeda: string
  remoto: boolean
  tipo: string
  tecnologia_busca: string
  data_publicacao: string
  data_coleta: string
  fonte: string
}

export interface JobsResponse {
  jobs: Job[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface Stats {
  total: number
  remotas: number
  com_salario: number
  data_coleta: string
  por_tecnologia: Record<string, number>
  por_fonte: Record<string, number>
  por_localizacao: Record<string, number>
  salario_medio_min?: number
  salario_medio_max?: number
  maior_salario?: number
  salary_by_tech: Record<string, { avg_min: number; avg_max: number; count: number }>
  top_companies: Record<string, number>
  jobs_by_type: Record<string, number>
}

export interface Filters {
  technologies: string
  keywords: string
  location: string
  remote_only: boolean
  job_type: string
  exclude_keywords: string
  min_salary: string
  max_salary: string
}
