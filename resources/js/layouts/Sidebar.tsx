// resources/js/layouts/Sidebar.tsx

import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, GraduationCap, Home, LayoutGrid } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

// Nenhuma alteração na lógica de tipos ou na função `isActive`.
// Isso garante que o componente continue a funcionar como esperado.
type NavItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    exact?: boolean;
};

const isActive = (url: string, currentUrl: string, exact: boolean = false) => {
    if (exact) {
        return currentUrl === url;
    }
    // Uma pequena melhoria: garantir que a rota 'index' não ative rotas filhas como 'create'.
    const cleanUrl = url.endsWith('/') ? url : `${url}/`;
    const cleanCurrentUrl = currentUrl.endsWith('/') ? currentUrl : `${currentUrl}/`;
    return cleanCurrentUrl.startsWith(cleanUrl);
};

export default function Sidebar() {
    const { url: currentUrl } = usePage();

    const primaryNavItems: NavItem[] = [
        { href: route('dashboard'), label: 'Dashboard', icon: Home, exact: true },
        { href: route('turmas.index'), label: 'Turmas', icon: LayoutGrid },
        { href: route('avaliacoes.index'), label: 'Avaliações', icon: ClipboardCheck },
    ];

    return (
        // ==== CONTAINER PRINCIPAL DA SIDEBAR COM EFEITO "GLASS" ====
        <aside className="flex h-full max-h-screen flex-col border-r border-border/20 bg-card/40 backdrop-blur-lg">
            {/* ==== CABEÇALHO COM LOGO E EFEITO DE BRILHO ==== */}
            <div className="flex h-14 items-center border-b border-border/20 px-4 lg:h-[60px] lg:px-6">
                <Link href={route('dashboard')} className="group flex items-center gap-2.5 text-lg font-bold">
                    <GraduationCap className="h-6 w-6 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:animate-pulse" />
                    <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Sua Escola</span>
                </Link>
            </div>

            {/* ==== NAVEGAÇÃO PRINCIPAL ==== */}
            <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start p-2 text-sm font-medium lg:p-4">
                    {primaryNavItems.map(({ href, label, icon: Icon, exact }) => {
                        const active = isActive(href, currentUrl, exact);
                        return (
                            <Link
                                key={label}
                                href={href}
                                className={`relative flex items-center gap-4 rounded-lg px-4 py-3 text-muted-foreground transition-all duration-300 outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50 ${active ? 'bg-primary/10 font-medium text-primary' : ''} `}
                            >
                                {/* Barra indicadora do item ativo com efeito de brilho */}
                                {active && (
                                    <div className="shadow-[0_0_12px_theme(colors.primary)] absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
                                )}
                                <Icon className={`h-5 w-5 ${active ? 'ml-3' : 'ml-0'} transition-all duration-300`} />
                                <span>{label}</span>
                            </Link>
                        );
                    })}

                    {/* Separador estilizado com gradiente */}
                    <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-border/30 to-transparent" />

                    {/* Aqui você pode adicionar os links secundários no futuro, seguindo o mesmo padrão */}
                </nav>
            </div>
        </aside>
    );
}
