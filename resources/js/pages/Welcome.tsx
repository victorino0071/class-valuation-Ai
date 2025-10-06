// resources/js/Pages/Welcome.tsx (Arquivo Atualizado com paleta de azuis)

import { DynamicBackground } from '@/components/ui/DynamicBackground';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookMarked, BrainCircuit, LayoutDashboard, Users } from 'lucide-react';

// --- DEFINIÇÃO DE CORES (AQUI ESTÃO OS AZUIS QUE VAMOS USAR) ---
// Vamos definir o azul principal e um azul secundário/claro para os gradientes

const AppLogo = () => (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm">
        <BookMarked className="h-6 w-6 text-primary" />
    </div>
);

const DashboardVisual = () => (
    <div className="group relative w-full max-w-md rounded-2xl bg-black/30 p-6 shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
        {/* Efeito de brilho atualizado para tons de azul */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/50 to-[#6aafff]/50 opacity-0 transition-opacity duration-500 group-hover:opacity-70"></div>

        <div className="relative">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">Análise de Desempenho</p>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-end gap-2 rounded-lg bg-black/20 p-3">
                    <div
                        className="animate-grow h-12 w-full rounded-t-md bg-gradient-to-b from-primary/30 to-transparent"
                        style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                        className="animate-grow h-20 w-full rounded-t-md bg-gradient-to-b from-primary/50 to-transparent"
                        style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                        className="animate-grow h-10 w-full rounded-t-md bg-gradient-to-b from-primary/20 to-transparent"
                        style={{ animationDelay: '0.3s' }}
                    ></div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-black/20 p-3 transition hover:bg-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500"></div>
                        <span className="text-sm font-medium text-white/80">Ana Silva</span>
                    </div>
                    <div className="h-4 w-16 rounded-full bg-primary/30"></div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-black/20 p-3 transition hover:bg-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400"></div>
                        <span className="text-sm font-medium text-white/80">Carlos Pereira</span>
                    </div>
                    <div className="h-4 w-20 rounded-full bg-primary/30"></div>
                </div>
            </div>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-black/30 p-6 text-center shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
        {/* Efeito de brilho atualizado para tons de azul/ciano */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary to-[#00f7d0] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
        <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">{icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-white/70">{children}</p>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bem-vindo ao Gestor de Turmas" />
            <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white">
                <DynamicBackground />

                {/* HEADER */}
                <header className="relative z-20 mx-auto mt-6 flex max-w-7xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <AppLogo />
                        <span className="text-lg font-semibold">Gestor de Turmas</span>
                    </Link>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/20"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="h-10 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                                >
                                    Entrar
                                </Link>

                                {/* --- BOTÃO CRIAR CONTA (PRIMÁRIO) - GRADIENTE AZUL --- */}
                                <Link
                                    href={register()}
                                    className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#2176ff] to-[#6aafff] px-5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:brightness-110"
                                >
                                    <span className="relative z-10">Criar Conta</span>
                                    <ArrowRight className="relative z-10 ml-2 h-4 w-4" />
                                    <div className="absolute inset-0 translate-x-[-100%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent)] transition-transform duration-700 group-hover:translate-x-[100%]" />
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* HERO */}
                <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 sm:py-32">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="animate-fade-in-up text-center lg:text-left">
                            {/* --- TÍTULO HERO - GRADIENTE AZUL --- */}
                            <h1 className="bg-gradient-to-r from-[#2176ff] to-[#6aafff] bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
                                Organize as Suas Turmas com Facilidade
                            </h1>
                            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70 lg:mx-0">
                                Plataforma definitiva para gestão de alunos, notas e atividades. Simplifique o seu dia a dia e foque no que realmente
                                importa: o ensino.
                            </p>
                            {!auth.user && (
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                                    {/* --- BOTÃO COMECE AGORA (PRIMÁRIO) - GRADIENTE AZUL --- */}
                                    <Link
                                        href={register()}
                                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#2176ff] to-[#6aafff] px-6 font-semibold text-white shadow-lg shadow-primary/50 transition-all duration-300 hover:brightness-110"
                                    >
                                        <span className="relative z-10">Comece Agora - É Grátis</span>
                                        <div className="absolute inset-0 translate-x-[-100%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent)] transition-transform duration-700 group-hover:translate-x-[100%]" />
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="flex animate-[fade-in_1s_ease-in-out] items-center justify-center">
                            <DashboardVisual />
                        </div>
                    </div>
                </main>

                {/* FEATURES */}
                <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 sm:pb-32">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold sm:text-4xl">Tudo o que você precisa em um só lugar</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">Desde a gestão de alunos até análises pedagógicas com IA.</p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3">
                        <FeatureCard icon={<Users className="h-6 w-6 text-primary" />} title="Gestão Simplificada">
                            Organize alunos, notas e frequência em poucos cliques.
                        </FeatureCard>
                        <FeatureCard icon={<LayoutDashboard className="h-6 w-6 text-primary" />} title="Relatórios Completos">
                            Gere relatórios de desempenho individuais ou da turma com visuais claros.
                        </FeatureCard>
                        <FeatureCard icon={<BrainCircuit className="h-6 w-6 text-primary" />} title="Análises com IA">
                            Obtenha insights e sugestões pedagógicas baseadas nos dados da turma.
                        </FeatureCard>
                    </div>
                </section>
            </div>
        </>
    );
}
