// resources/js/components/RelatorioFormModal.tsx (CORREÇÃO ESTRUTURAL)

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Aluno, periodo } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { route } from 'ziggy-js';

interface RelatorioFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    aluno: Aluno;
    periodos: periodo[]; // Novo prop para os períodos
}

export default function RelatorioFormModal({ isOpen, onClose, aluno, periodos }: RelatorioFormModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        aluno_id: aluno.id,
        texto: '',
        periodo_id: '', // Novo campo para o período
    });

    const handleClose = () => {
        onClose();
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('relatorios.store'), {
            onSuccess: () => handleClose(),
            preserveScroll: true,
        });
    };

    // Este useEffect garante que se o prop 'aluno' mudar por algum motivo,
    // o formulário usará o ID correto. É uma boa prática de robustez.
    useEffect(() => {
        setData('aluno_id', aluno.id);
    }, [aluno]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Relatório para {aluno.nome}</DialogTitle>
                    <DialogDescription>Preencha as informações do relatório abaixo.</DialogDescription>
                </DialogHeader>

                {/* PONTO CHAVE: O formulário agora envolve o rodapé */}
                <form id="relatorio-form" onSubmit={submit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="texto" className="text-right">
                                Relatório
                            </Label>
                            <Textarea
                                id="texto"
                                value={data.texto}
                                onChange={(e) => setData('texto', e.target.value)}
                                className="col-span-3"
                                required
                            />
                            {errors.texto && <p className="col-span-4 text-right text-sm text-red-600">{errors.texto}</p>}
                        </div>
                    </div>
                    <label htmlFor="periodo_id" className="block text-sm font-medium text-muted-foreground">
                        Periodo
                    </label>
                    <select
                        id="periodo_id"
                        value={data.periodo_id}
                        onChange={(e) => setData('periodo_id', e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                    >
                        <option value="" disabled>
                            Selecione o período
                        </option>
                        {periodos.map((periodo: periodo) => (
                            <option key={periodo.id} value={periodo.id}>
                                {periodo.nome}
                            </option>
                        ))}
                    </select>
                    {errors.periodo_id && <p className="mt-2 text-sm text-destructive">{errors.periodo_id}</p>}
                    <div></div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar Relatório'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
