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
    titulo: string;
    nota: number;
    descricao: string;
    data_avaliacao: string;
    turma_id: number;
    aluno_id: number;
    materia_id: number;
    created_at: string;
    updated_at: string;
}

export type AvaliacaoEvento = {
    materia_id: number;
    materia_nome: string;
    data_avaliacao: string;
}

export interface Materia {
    id: number;
    nome: string;
    created_at: string;
    updated_at: string;
}

export interface Relatorio {
    id: number;
    bimestre: number;
    texto: string;
    aluno_id: number;
    created_at: string;
    updated_at: string;
}

export interface FlashProps{
    success?: string;
    error?: string;
}
export interface PageProps {
    auth: Auth;
    flash: FlashProps;
    sidebarOpen: boolean;
    [key: string]: unknown; // This allows for additional properties...
}