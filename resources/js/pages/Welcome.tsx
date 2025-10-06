// resources/js/Pages/Welcome.tsx

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookMarked, LayoutDashboard } from 'lucide-react';

// Componente para o Logo da Aplicação (pode ser substituído pelo seu SVG)
const AppLogo = () => (
    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
        <BookMarked className="size-5 text-primary" />
    </div>
);

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bem-vindo" />
            <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background font-sans text-foreground">
                {/* ==== FUNDO ANIMADO COM GRADIENTE RADIAL ==== */}
                <div className="absolute top-0 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]">
                    <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#2176ff_0%,#34d399_50%,#2176ff_100%)] opacity-20"></div>
                </div>

                {/* ==== HEADER MODERNIZADO ==== */}
                <header className="relative z-20 mt-6 w-full max-w-7xl px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <AppLogo />
                            <span className="text-lg font-semibold">Gestor de Turmas</span>
                        </Link>

                        {/* Navegação */}
                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="group hover:shadow-[0_0_20px_theme(colors.primary/0.3)] flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/20"
                                >
                                    <LayoutDashboard className="size-4" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/10"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="group flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:brightness-110"
                                    >
                                        <span>Criar Conta</span>
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ==== SEÇÃO PRINCIPAL (HERO) ==== */}
                <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="w-full max-w-3xl animate-[fade-in-up_1s_ease-in-out] rounded-xl border border-border/60 bg-card/60 p-10 shadow-lg backdrop-blur-xl">
                        <h1 className="bg-gradient-to-br from-foreground to-muted-foreground/70 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-6xl">
                            Organize suas Turmas com Facilidade
                        </h1>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                            A plataforma definitiva para gestão de alunos, notas e atividades. Simplifique seu dia a dia e foque no que realmente
                            importa: o ensino.
                        </p>

                        {/* Botões Call-to-Action */}
                        {!auth.user && (
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href={register()}
                                    className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-2)] px-6 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:brightness-110"
                                >
                                    <span className="relative z-10">Comece Agora - É Grátis</span>
                                    {/* Efeito de brilho */}
                                    <div className="absolute inset-0 translate-x-[-100%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent)] transition-transform duration-700 group-hover:translate-x-[100%]" />
                                </Link>
                                <Link
                                    href={login()}
                                    className="group flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-colors hover:bg-foreground/10"
                                >
                                    <span>Já tenho uma conta</span>
                                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
