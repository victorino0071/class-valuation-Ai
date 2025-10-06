// resources/js/layouts/auth/auth-simple-layout.tsx

import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        // ==== FUNDO DARK E CONTAINER PRINCIPAL ====
        // Esta é a mesma estrutura base das páginas de Login e Registo.
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4 font-sans text-foreground sm:p-6 md:p-10">
            {/* Gradiente radial para o efeito de luz */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(217.2_91.2%_18%),transparent_70%)] opacity-70"></div>

            {/* ==== CARD DE AUTENTICAÇÃO ESTILO "GLASSMORPHISM" ==== */}
            {/* Este é o "cartão de vidro" que irá conter todo o conteúdo de autenticação. */}
            <div className="relative z-10 w-full max-w-md rounded-xl border border-border/60 bg-card/70 p-10 shadow-lg backdrop-blur-xl transition-all hover:shadow-[0_0_25px_rgba(80,150,255,0.2)]">
                {/* Cabeçalho do Card */}
                <div className="mb-8 text-center">
                    {/* Link com o Logo */}
                    <Link href={home()} className="mb-6 inline-block transition-transform hover:scale-110">
                        {/* Ícone da aplicação, agora com a cor primária */}
                        <AppLogoIcon className="size-10 text-primary" />
                        <span className="sr-only">Página Inicial</span>
                    </Link>

                    {/* Título e Descrição */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>

                {/* Conteúdo da Página (ex: o formulário) */}
                {/* A variável 'children' irá renderizar qualquer conteúdo que for passado para o layout. */}
                {children}
            </div>
        </div>
    );
}
