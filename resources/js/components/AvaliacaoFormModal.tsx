// resources/js/components/AvaliacaoFormModal.tsx (CORRIGIDO E SIMPLIFICADO)

import { Materia } from '@/types'; // A importação de 'periodo' pode ser removida se não for usada em nenhum outro lugar
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEvent, Fragment, useEffect } from 'react';
import { route } from 'ziggy-js';

// 1. Removemos 'periodos' das props
interface AvaliacaoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    turmaId: number;
    materias: Materia[];
}

export default function AvaliacaoFormModal({ isOpen, onClose, turmaId, materias }: AvaliacaoFormModalProps) {
    // 2. Removemos 'periodo_id' do estado do formulário
    const { data, setData, post, processing, errors, reset } = useForm({
        turma_id: turmaId,
        materia_id: '',
        data_avaliacao: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        setData('turma_id', turmaId);
        if (!isOpen) {
            reset();
        }
    }, [isOpen, turmaId]);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('avaliacoes.store'), {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    const buttonBaseClasses =
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    const primaryButtonClasses = `${buttonBaseClasses} bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2`;
    const secondaryButtonClasses = `${buttonBaseClasses} border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2`;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* ... (código do TransitionChild e do Dialog) ... */}

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl border bg-card p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" className="text-lg leading-6 font-medium text-foreground">
                                    Criar Nova Avaliação
                                </DialogTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Esta ação criará um registro de avaliação para todos os alunos desta turma.
                                </p>

                                <form onSubmit={submit} className="mt-4 space-y-6">
                                    {/* Campo Matéria */}
                                    <div>
                                        <label htmlFor="materia_id" className="block text-sm font-medium text-muted-foreground">
                                            Matéria
                                        </label>
                                        <select
                                            id="materia_id"
                                            value={data.materia_id}
                                            onChange={(e) => setData('materia_id', e.target.value)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="" disabled>
                                                Selecione uma matéria
                                            </option>
                                            {materias.map((materia) => (
                                                <option key={materia.id} value={materia.id}>
                                                    {materia.nome}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.materia_id && <p className="mt-2 text-sm text-destructive">{errors.materia_id}</p>}
                                    </div>

                                    {/* 3. REMOVIDO O CAMPO DE SELEÇÃO DE PERÍODO */}

                                    {/* Campo Data da Avaliação */}
                                    <div>
                                        <label htmlFor="data_avaliacao" className="block text-sm font-medium text-muted-foreground">
                                            Data da Avaliação
                                        </label>
                                        <input
                                            id="data_avaliacao"
                                            type="date"
                                            value={data.data_avaliacao}
                                            onChange={(e) => setData('data_avaliacao', e.target.value)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        />
                                        {errors.data_avaliacao && <p className="mt-2 text-sm text-destructive">{errors.data_avaliacao}</p>}
                                    </div>

                                    <div className="mt-6 flex items-center justify-end gap-4">
                                        <button type="button" onClick={onClose} className={secondaryButtonClasses}>
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={processing} className={primaryButtonClasses}>
                                            {processing ? 'Criando...' : 'Criar Avaliação'}
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
