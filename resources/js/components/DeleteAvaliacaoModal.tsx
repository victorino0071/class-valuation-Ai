// resources/js/components/DeleteAvaliacaoModal.tsx (VERSÃO FINAL CORRIGIDA)

import { useState } from 'react';
// IMPORTANTE: Importar o 'router'
import { router } from '@inertiajs/react'; 
import { route } from 'ziggy-js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface AvaliacaoEvento {
  materia_id: number;
  materia_nome: string;
  data_avaliacao: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  turmaId: number;
  avaliacoesDaTurma: AvaliacaoEvento[];
}

export default function DeleteAvaliacaoModal({ isOpen, onClose, turmaId, avaliacoesDaTurma }: Props) {
  // Vamos gerir o estado de 'processing' manualmente
  const [processing, setProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (avaliacao: AvaliacaoEvento) => {
    const uniqueId = `${avaliacao.materia_id}-${avaliacao.data_avaliacao}`;
    
    if (confirm(`Tem certeza que deseja apagar a avaliação de "${avaliacao.materia_nome}" do dia ${new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} para TODOS os alunos?`)) {
      setDeletingId(uniqueId);
      
      // USANDO router.delete EM VEZ DE 'destroy' DO useForm
      router.delete(route('avaliacoes.destroyBulk'), {
        // A sintaxe correta com a propriedade 'data'
        data: {
          turma_id: turmaId,
          materia_id: avaliacao.materia_id,
          data_avaliacao: avaliacao.data_avaliacao,
        },
        preserveScroll: true,
        onStart: () => setProcessing(true), // Ativa o 'processing' no início
        onFinish: () => { // Desativa o 'processing' no fim (sucesso ou erro)
          setProcessing(false);
          setDeletingId(null);
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deletar Conjunto de Avaliações</DialogTitle>
          <DialogDescription>
            Clique no ícone de lixo para remover o conjunto de avaliações correspondente.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-2">
          {avaliacoesDaTurma?.length > 0 ? (
            avaliacoesDaTurma.map((avaliacao) => {
              const uniqueId = `${avaliacao.materia_id}-${avaliacao.data_avaliacao}`;
              const isDeleting = processing && deletingId === uniqueId;
              
              return (
                <div key={uniqueId} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-semibold">{avaliacao.materia_nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(avaliacao)}
                    disabled={isDeleting}
                    aria-label={`Deletar avaliação de ${avaliacao.materia_nome}`}
                  >
                    {isDeleting ? (
                      <span className="animate-spin h-4 w-4 rounded-full border-2 border-current border-t-transparent"></span>
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma avaliação encontrada para esta turma.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}