// resources/js/components/shared/PageHeader.tsx

import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    children?: React.ReactNode; // Para os botões de ação
}

const PageHeader = ({ title, description, children }: PageHeaderProps) => {
    return (
        // ==== CONTAINER PRINCIPAL SEM BORDA E COM LAYOUT APRIMORADO ====
        // Removemos a borda inferior (border-b) e o padding inferior (pb-4) para um look mais limpo.
        // O espaçamento agora é controlado apenas pela margem inferior (mb-8).
        <div className="mb-8 md:flex md:items-end md:justify-between">
            {/* ==== ÁREA DE TEXTO COM TIPOGRAFIA DE DESTAQUE ==== */}
            <div className="flex-auto">
                {/* O título agora usa o efeito de gradiente para maior impacto visual */}
                <h1 className="bg-gradient-to-br from-foreground to-muted-foreground/70 bg-clip-text text-4xl font-bold tracking-tighter text-transparent">
                    {title}
                </h1>

                {/* A descrição tem um tamanho de fonte ligeiramente maior para melhor legibilidade */}
                <p className="mt-2 max-w-2xl text-base text-muted-foreground">{description}</p>
            </div>

            {/* ==== ÁREA DAS AÇÕES (BOTÕES) ==== */}
            {/* Usamos 'gap' para um espaçamento mais consistente entre os botões */}
            <div className="mt-6 flex shrink-0 items-center gap-3 md:mt-0">{children}</div>
        </div>
    );
};

export default PageHeader;
