import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { appearance, dashboard } from '@/routes'; // 1. Importar a rota 'dashboard'
import { edit as editPassword } from '@/routes/password';
import { edit } from '@/routes/profile';
import { type NavItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Palette, User } from 'lucide-react'; // 2. Importar o ícone 'ArrowLeft'
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Perfil',
        href: edit(),
        icon: User,
    },
    {
        title: 'Senha',
        href: editPassword(),
        icon: KeyRound,
    },
    {
        title: 'Aparência',
        href: appearance(),
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url: currentPath } = usePage();

    return (
        <>
            <Head title="Configurações" />
            <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden bg-background p-4 font-sans text-foreground sm:p-6 md:p-8">
                <div className="absolute top-0 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]">
                    <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#2176ff_0%,#34d399_50%,#2176ff_100%)] opacity-20"></div>
                </div>

                {/* ==== CARTÃO DE CONFIGURAÇÕES CENTRALIZADO E MAIOR ==== */}
                {/* 3. Aumentado o padding (p-6/p-8 para p-8/p-10) para maior altura */}
                <div className="relative z-10 mt-16 w-full max-w-4xl animate-[fade-in-up_0.8s_ease-in-out] rounded-xl border border-border/60 bg-card/60 p-8 shadow-lg backdrop-blur-xl sm:p-10">
                    {/* 4. Cabeçalho atualizado com botão de voltar */}
                    <div className="relative mb-10 text-center">
                        {/* Botão de Voltar posicionado à esquerda */}
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="absolute top-1/2 left-0 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <Link href={dashboard()}>
                                <ArrowLeft className="size-5" />
                                <span className="sr-only">Voltar para o Dashboard</span>
                            </Link>
                        </Button>

                        {/* Título e Descrição Centralizados */}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Configurações</h1>
                            <p className="mt-1 text-muted-foreground">Gerencie as configurações do seu perfil e da sua conta.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:space-x-8">
                        <aside className="w-full md:w-48">
                            <nav className="flex flex-row space-x-2 md:flex-col md:space-y-1 md:space-x-0">
                                {sidebarNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                                            currentPath === item.href
                                                ? 'bg-primary text-primary-foreground shadow'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </nav>
                        </aside>

                        <main className="mt-8 flex-1 md:mt-0">{children}</main>
                    </div>
                </div>
            </div>
        </>
    );
}
