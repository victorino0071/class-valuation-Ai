import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Turma {
    id: number;
    nome: string;
    descricao: string;
    created_at: string;
    updated_at: string;
}
export interface AnaliseAluno {
    estatisticas: {
        nome_aluno: string;
        estatisticas_gerais: {
            media_geral: number;
            melhor_materia: string;
            pior_materia: string;
            total_avaliacoes: number;
        };
        evolucao_bimestral: {
            periodo: string;
            media: number;
        }[];
        relatorios_pedagogicos: {
            periodo: string;
            relatorio: string;
        }[];
    };
    insights: {
        resumo_geral: string;
        analise_evolucao: string;
        analise_relatorios: string;
        pontos_fortes: string[];
        pontos_a_melhorar: string[];
    };
}

export interface Aluno {
    id: number;
    nome: string;
    email: string;
    turma_id: number;
    created_at: string;
    updated_at: string;
}

export interface Avaliacao {
    id: number;
    nota: number;
    data_avaliacao: string;
    aluno_id: number;
    materia_id: number;
    turma_id: number;
    periodo_id: number;
    created_at: string;
    updated_at: string;
}

export type AvaliacaoEvento = {
    materia_id: number;
    materia_nome: string;
    data_avaliacao: string;
};

export interface Materia {
    id: number;
    nome: string;
    created_at: string;
    updated_at: string;
}

export interface Periodo {
    id: number;
    nome: string;
    data_inicio: string;
    data_fim: string;
    created_at: string;
    updated_at: string;
}

export interface Relatorio {
    id: number;
    texto: string;
    periodo_id: number;
    aluno_id: number;
    created_at: string;
    updated_at: string;
}

export interface FlashProps {
    success?: string;
    error?: string;
}
export interface PageProps {
    auth: Auth;
    flash: FlashProps;
    sidebarOpen: boolean;
    [key: string]: unknown; // This allows for additional properties...
}

export interface IaAnalysis {
    resumo_geral: string;
    metricas_chave: {
        total_turmas: number;
        total_alunos: number;
        media_alunos_por_turma: number;
        turma_com_mais_alunos: {
            nome: string;
            quantidade: number;
        };
    };
    analise_individual: Array<{
        id_turma: number;
        nome_turma: string;
        numero_alunos: number;
        insight: string;
    }>;
}

export interface DesempenhoAlunos {
    aprovados: number;
    recuperacao: number;
    reprovados: number;
}

export interface DesempenhoMateria {
    materia: string;
    media_turma: number;
}
export interface TurmaResumo {
    id: number;
    turma_id: number;

    // Este campo JSON é desserializado para o tipo 'AnaliseTurma'
    dados_analise_json: AnaliseTurma;

    // Este campo JSON é desserializado, pode ser null
    dados_originais: null;

    // Campos de data/hora padrão
    created_at: string;
    updated_at: string;
}
export interface AnaliseTurma {
    // RENOMEADO: De 'resumo_geral' para 'resumo_pedagogico'
    resumo_pedagogico: string;

    estatisticas_gerais: {
        quantidade_alunos: number;
        quantidade_avaliacoes: number;
        // RENOMEADO: de 'media_notas' para 'media_geral' para consistência
        media_geral: number;
        mediana_geral: number;
        desvio_padrao_geral: number;
        aprovados_geral: number;
        reprovados_geral: number;
    };

    materias: {
        materia: string;
        media: number;
        mediana: number;
        desvio_padrao: number;
        maior_nota: number;
        menor_nota: number;
        insight: string;
        // ADICIONADO: O novo campo com dicas práticas
        sugestao_pedagogica: string;
    }[];

    alunos_destaque: {
        melhor_aluno: {
            id: number | string;
            nome: string;
            media: number;
            // REMOVIDO: materia_forte não existe mais na nova estrutura
        };
        aluno_com_dificuldade: {
            id: number | string;
            nome: string;
            media: number;
            // REMOVIDO: materia_fraca não existe mais na nova estrutura
        };
    };

    // RENOMEADO: De 'tendencias' para 'pontos_de_atencao'
    pontos_de_atencao: string[];
}
