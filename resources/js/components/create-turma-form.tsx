import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEvent, Fragment, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Turma } from '@/types'; // Importe o tipo Turma

interface TurmaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    // MUDANÇA: Adicionamos uma propriedade opcional 'turma'.
    // Se ela for fornecida, estamos no modo de edição.
    turma?: Turma | null;
}

export default function TurmaFormModal({ isOpen, onClose, turma = null }: TurmaFormModalProps) {
    // MUDANÇA: Determina se estamos em modo de edição.
    const isEditing = !!turma;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        descricao: '',
    });

    // MUDANÇA: Este useEffect agora preenche o formulário quando o modal
    // é aberto no modo de edição e o limpa quando é fechado.
    useEffect(() => {
        if (isOpen && isEditing) {
            setData({
                nome: turma.nome,
                descricao: turma.descricao || '',
            });
        } else {
            reset(); // Limpa o formulário e os erros ao fechar ou ao abrir para criar.
        }
    }, [isOpen, turma]);

    // MUDANÇA: A função de envio agora decide se deve criar (POST) ou atualizar (PUT).
    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditing) {
            put(route('turmas.update', turma.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route('turmas.store'), {
                onSuccess: () => onClose(),
            });
        }
    };

    // ... (definição das classes dos botões continua a mesma)
    const buttonBaseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const primaryButtonClasses = `${buttonBaseClasses} bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2`;
    const secondaryButtonClasses = `${buttonBaseClasses} border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2`;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* ... (o resto do JSX da transição e do overlay) */}
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl border bg-card p-6 text-left align-middle shadow-xl transition-all">
                                {/* MUDANÇA: O título agora é dinâmico. */}
                                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-foreground">
                                    {isEditing ? 'Editar Turma' : 'Criar Nova Turma'}
                                </DialogTitle>

                                <form onSubmit={submit} className="mt-4 space-y-6">
                                    {/* Os campos do formulário continuam os mesmos */}
                                    <div>
                                        <label htmlFor="nome" className="block text-sm font-medium text-muted-foreground">Nome da Turma</label>
                                        <input id="nome" type="text" value={data.nome} onChange={(e) => setData('nome', e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required />
                                        {errors.nome && <p className="mt-2 text-sm text-destructive">{errors.nome}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="descricao" className="block text-sm font-medium text-muted-foreground">Descrição (Opcional)</label>
                                        <textarea id="descricao" value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} rows={4} className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                                        {errors.descricao && <p className="mt-2 text-sm text-destructive">{errors.descricao}</p>}
                                    </div>

                                    <div className="mt-6 flex items-center justify-end gap-4">
                                        <button type="button" onClick={onClose} className={secondaryButtonClasses}>Cancelar</button>
                                        {/* MUDANÇA: O texto do botão agora é dinâmico. */}
                                        <button type="submit" disabled={processing} className={primaryButtonClasses}>
                                            {processing ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Turma')}
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