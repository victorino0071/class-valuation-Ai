// Em: resources/js/components/ViewRelatorioModal.tsx

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Aluno, Periodo, Relatorio } from '@/types';
import { Calendar, Check, Copy, FileText, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

// ATUALIZADO: A interface agora recebe mais contexto para uma exibição mais rica.
interface Props {
    isOpen: boolean;
    onClose: () => void;
    relatorio: (Relatorio & { periodo?: Periodo }) | null; // O relatório pode vir com o período
    aluno: Aluno | null;
}

export default function ViewRelatorioModal({ isOpen, onClose, relatorio, aluno }: Props) {
    const [hasCopied, setHasCopied] = useState(false);

    if (!relatorio || !aluno) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(relatorio.texto);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000); // Reseta o estado após 2 segundos
    };

    // Formata a data de criação para melhor leitura.
    const dataCriacao = new Date(relatorio.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <DialogTitle className="text-xl">Relatório Pedagógico Individual</DialogTitle>
                    </div>
                    <DialogDescription>Abaixo estão os detalhes do relatório gerado para o aluno.</DialogDescription>
                </DialogHeader>

                {/* SEÇÃO DE METADADOS: Para dar contexto rápido */}
                <div className="space-y-3 rounded-md border bg-muted/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <User className="h-4 w-4" />
                            Aluno
                        </div>
                        <span className="text-muted-foreground">{aluno.nome}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <Calendar className="h-4 w-4" />
                            Período Letivo
                        </div>
                        <span className="text-muted-foreground">{relatorio.periodo?.nome ?? `${relatorio.periodo_id}º Bimestre`}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <Calendar className="h-4 w-4" />
                            Data de Criação
                        </div>
                        <span className="text-muted-foreground">{dataCriacao}</span>
                    </div>
                </div>

                {/* CORPO DO RELATÓRIO: Com estilo para melhor legibilidade e scroll */}
                <div className="prose prose-sm dark:prose-invert max-h-[40vh] overflow-y-auto rounded-md border p-4">
                    <p>{relatorio.texto}</p>
                </div>

                {/* RODAPÉ COM AÇÕES */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={handleCopy}>
                        {hasCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                        {hasCopied ? 'Copiado!' : 'Copiar Texto'}
                    </Button>
                    <Button onClick={onClose}>Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
