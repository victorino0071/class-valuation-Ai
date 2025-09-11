// resources/js/components/EditRelatorioModal.tsx (CORREÇÃO DEFINITIVA)

import { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Relatorio } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    relatorio: Relatorio | null;
}

export default function EditRelatorioModal({ isOpen, onClose, relatorio }: Props) {
    // PONTO CHAVE 1: Inicialize o formulário com valores estáticos e previsíveis.
    // O aluno_id pode ser 0 ou null, pois será preenchido corretamente no useEffect.
    const { data, setData, patch, processing, errors, reset } = useForm({
        aluno_id: 0,
        texto: '',
        bimestre: '1',
    });

    // PONTO CHAVE 2: O useEffect é o lugar correto para popular o formulário.
    // Agora ele define TODOS os campos, incluindo o aluno_id.
    useEffect(() => {
        if (relatorio) {
            setData({
                aluno_id: relatorio.aluno_id, 
                texto: relatorio.texto,
                bimestre: String(relatorio.bimestre),
            });
        }
    }, [relatorio]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!relatorio) return;

        patch(route('relatorios.update', relatorio.id), {
            onSuccess: () => handleClose(),
            preserveScroll: true,
        });
    };
    
    const handleClose = () => {
        onClose();
        reset();
    };

    if (!relatorio) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Relatório</DialogTitle>
                    <DialogDescription>
                        Altere as informações do relatório abaixo.
                    </DialogDescription>
                </DialogHeader>
                
                <form id="edit-relatorio-form" onSubmit={submit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="texto" className="text-right">Relatório</Label>
                            <Textarea id="texto" value={data.texto} onChange={(e) => setData('texto', e.target.value)} className="col-span-3" required />
                            {errors.texto && <p className="col-span-4 text-sm text-red-600 text-right">{errors.texto}</p>}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bimestre" className="text-right">Bimestre</Label>
                            <div className="col-span-3">
                                <Select value={data.bimestre} onValueChange={(value) => setData('bimestre', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1º Bimestre</SelectItem>
                                        <SelectItem value="2">2º Bimestre</SelectItem>
                                        <SelectItem value="3">3º Bimestre</SelectItem>
                                        <SelectItem value="4">4º Bimestre</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.bimestre && <p className="text-sm text-red-600 mt-2">{errors.bimestre}</p>}
                            </div>
                        </div>
                        {errors.aluno_id && <p className="col-span-4 text-sm text-red-600 text-center">{errors.aluno_id}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}