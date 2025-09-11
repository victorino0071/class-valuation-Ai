// pages/Turmas/Index.tsx

import { Head, usePage, useForm, router } from '@inertiajs/react';
import TurmaLayout from '@/layouts/turma-layout';
import { PageProps, Turma } from '@/types';
import TurmaFormModal from '@/components/create-turma-form';
import { useState } from 'react';
import { route } from 'ziggy-js';
// MUDANÇA: Importar nosso novo componente genérico
import DataTable, { ColumnDef } from '@/components/data-table'; 

interface TurmasPageProps extends PageProps {
    turmas: Turma[];
}

export default function Index() {
    const { flash, turmas } = usePage<TurmasPageProps>().props;
    const { delete: destroy, processing: isDeleting } = useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [turmaToEdit, setTurmaToEdit] = useState<Turma | null>(null);

    // MUDANÇA: Definir as colunas para a tabela de Turmas.
    // O 'accessorKey' deve corresponder a uma chave no objeto Turma.
    const columns: ColumnDef<Turma>[] = [
        {
            header: 'Nome',
            accessorKey: 'nome',
        },
        {
            header: 'Descrição',
            accessorKey: 'descricao',
        }
    ];

    const deleteTurma = (id: string | number) => {
        if (confirm('Tem certeza que deseja deletar esta turma?')) {
            destroy(route('turmas.destroy', id), { preserveScroll: true });
        }
    };
    
    // MUDANÇA: Esta função estava dentro do TurmasTable, agora ela fica na página.
    const openTurmaDetails = (turma: Turma) => {
        router.get(route('turmas.show', turma.id));
    };

    const handleOpenCreateModal = () => {
        setTurmaToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (turma: Turma) => {
        setTurmaToEdit(turma);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTurmaToEdit(null);
    };

    return (
        <TurmaLayout>
            <Head title="Turmas" />
            <div className="sm:flex sm:items-center mb-6">
                {/* ... (cabeçalho da página continua o mesmo) ... */}
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-foreground">Turmas</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Lista de todas as turmas cadastradas.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button type="button" onClick={handleOpenCreateModal} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        Nova Turma
                    </button>
                </div>
            </div>

            {flash.success && ( <div className="mb-4 rounded-lg border bg-accent p-4"><p className="text-sm font-medium text-accent-foreground">{flash.success}</p></div> )}

            {/* MUDANÇA: Substituímos o TurmasTable pelo DataTable */}
            <DataTable<Turma>
                columns={columns}
                data={turmas}
                onEdit={handleOpenEditModal}
                onDelete={deleteTurma}
                onRowClick={openTurmaDetails} // Passando a função de clique na linha
                isProcessingActions={isDeleting}
                emptyStateMessage="Nenhuma turma encontrada."
            />

            <TurmaFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                turma={turmaToEdit}
            />
        </TurmaLayout>
    );
}