// resources/js/components/EditAvaliacaoModal.tsx
import { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Avaliacao } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  avaliacao: (Avaliacao & { materia: { nome: string } }) | null;
}

export default function EditAvaliacaoModal({ isOpen, onClose, avaliacao }: Props) {
  // note: renomeei submit para formSubmit pra não conflitar com handler
  const { data, setData, submit: formSubmit, processing, errors, reset } = useForm({
    nota: 0,
  });

  useEffect(() => {
    // Quando o modal abre, definimos o valor inicial da nota.
    if (avaliacao) {
      setData('nota', avaliacao.nota);
    }
  }, [avaliacao]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (!avaliacao) return;

    // DEBUG: verifique no console o que será enviado
    console.log('Enviando PATCH para update:', route('avaliacoes.update', avaliacao.id), data);

    // usa formSubmit pra garantir que o método será PATCH e que o data interno será enviado
    formSubmit('patch', route('avaliacoes.update', avaliacao.id), {
      preserveScroll: true,
      onSuccess: () => handleClose()
      ,
      onError: (errs) => console.log('Erros de validação:', errs),
    });
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  if (!avaliacao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Nota</DialogTitle>
          <DialogDescription>
            Editando a nota de <span className="font-semibold">{avaliacao.materia.nome}</span>.
          </DialogDescription>
        </DialogHeader>

        <form id="edit-avaliacao-form" onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nota" className="text-right">Nota</Label>
              <Input
                id="nota"
                type="number"
                step="0.01"
                min="0"
                value={data.nota ?? ''}
                onChange={(e) => setData('nota', Number(e.target.value))}
                className="col-span-3"
                autoFocus
                required
              />
              {errors.nota && <p className="col-span-4 text-sm text-red-600 text-right">{errors.nota}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Salvando...' : 'Salvar Nota'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
