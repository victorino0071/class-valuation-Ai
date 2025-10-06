// resources/js/layouts/TurmaLayout.tsx

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { PropsWithChildren, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function TurmaLayout({ children }: PropsWithChildren) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        // ==== CONTAINER PRINCIPAL COM FUNDO ANIMADO ====
        // Adicionamos 'relative' para conter o fundo e trocamos o bg-muted
        <div className="relative h-screen w-full overflow-hidden bg-background">
            {/* Fundo animado, o mesmo da página de boas-vindas, agora serve de base para todo o app */}
            <div className="absolute top-0 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]">
                <div className="animate-spin-slow absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,#2176ff_0%,#34d399_50%,#2176ff_100%)] opacity-20"></div>
            </div>

            {/* A estrutura flex principal agora fica sobre o fundo animado */}
            <div className="relative z-10 flex h-full w-full">
                {/* Sidebar para Desktop (agora sem estilos de fundo ou borda próprios) */}
                <div className="hidden md:flex md:w-[220px] lg:w-[280px]">
                    <Sidebar />
                </div>

                {/* Sidebar para Mobile (o SheetContent agora é transparente) */}
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetContent
                        side="left"
                        className="border-none bg-transparent p-0 shadow-none" // Remove o estilo padrão do Sheet
                    >
                        <Sidebar />
                    </SheetContent>
                </Sheet>

                {/* Conteúdo Principal (sem alterações na estrutura, já está ótima) */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header onMenuClick={() => setIsSidebarOpen(true)} />

                    <main className="flex-1 overflow-y-auto p-4 lg:gap-6 lg:p-6">
                        {/* Adicionamos um efeito de fade-in para a entrada do conteúdo */}
                        <div className="mx-auto w-full max-w-7xl animate-[fade-in_0.5s_ease-in-out]">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
