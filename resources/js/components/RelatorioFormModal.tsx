// resources/js/components/RelatorioFormModal.tsx (CORREÇÃO ESTRUTURAL)

import { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Aluno } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RelatorioFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    aluno: Aluno;
}

export default function RelatorioFormModal({ isOpen, onClose, aluno }: RelatorioFormModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        aluno_id: aluno.id,
        texto: '',
        bimestre: '1',
    });
    
    const handleClose = () => {
        onClose();
        reset();
    }
    
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
                    <DialogDescription>
                        Preencha as informações do relatório abaixo.
                    </DialogDescription>
                </DialogHeader>
                
                {/* PONTO CHAVE: O formulário agora envolve o rodapé */}
                <form id="relatorio-form" onSubmit={submit}>
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
                                    <SelectTrigger><SelectValue placeholder="Selecione um bimestre" /></SelectTrigger>
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
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar Relatório'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}