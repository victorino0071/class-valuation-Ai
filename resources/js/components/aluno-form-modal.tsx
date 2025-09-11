import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEvent, Fragment, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Aluno } from '@/types';

interface AlunoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    aluno?: Aluno | null;
    turmaId: number; // Essencial para associar o aluno à turma correta
}

export default function AlunoFormModal({ isOpen, onClose, aluno = null, turmaId }: AlunoFormModalProps) {
    const isEditing = !!aluno;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        turma_id: turmaId, // O ID da turma é incluído nos dados do formulário
    });

    useEffect(() => {
        // Se o modal estiver aberto, definimos os dados
        if (isOpen) {
            setData({
                nome: aluno?.nome || '', // Se for edição, usa o nome do aluno; senão, vazio
                turma_id: turmaId,
            });
        } else {
            // Se fechar, limpamos o formulário para a próxima vez
            reset();
        }
    }, [isOpen, aluno, turmaId]);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditing) {
            put(route('alunos.update', aluno.id), {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        } else {
            post(route('alunos.store'), {
                onSuccess: () => onClose(),
                preserveScroll: true,
            });
        }
    };

    // Estilos reutilizáveis para os botões do formulário
    const buttonBaseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const primaryButtonClasses = `${buttonBaseClasses} bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2`;
    const secondaryButtonClasses = `${buttonBaseClasses} border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2`;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl border bg-card p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-foreground">
                                    {isEditing ? 'Editar Aluno' : 'Adicionar Novo Aluno'}
                                </DialogTitle>

                                <form onSubmit={submit} className="mt-4 space-y-6">
                                    <div>
                                        <label htmlFor="nome" className="block text-sm font-medium text-muted-foreground">
                                            Nome do Aluno
                                        </label>
                                        <input
                                            id="nome"
                                            type="text"
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            required
                                            autoFocus
                                        />
                                        {errors.nome && <p className="mt-2 text-sm text-destructive">{errors.nome}</p>}
                                    </div>

                                    <div className="mt-6 flex items-center justify-end gap-4">
                                        <button type="button" onClick={onClose} className={secondaryButtonClasses}>
                                            Cancelar
                                        </button>
                                        <button type="submit" disabled={processing} className={primaryButtonClasses}>
                                            {processing ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar Aluno')}
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