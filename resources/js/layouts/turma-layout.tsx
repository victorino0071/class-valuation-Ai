import { PropsWithChildren } from 'react';

export default function TurmaLayout({ children }: PropsWithChildren) {
    

    return (
        // MUDANÇA: O fundo agora usa a variável 'background', que se ajusta ao tema.
        <div className="min-h-screen bg-background text-foreground">
            {/* Aqui pode adicionar sua navegação, header, etc. */}
            
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}