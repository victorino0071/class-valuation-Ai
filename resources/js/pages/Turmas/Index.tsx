// resources/js/Pages/Turmas/Index.tsx

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react'; // Ícone para a mensagem de sucesso
import { useState } from 'react';
import { route } from 'ziggy-js';

// Componentes
import DashboardIaSection from '@/components/DashboardIaSection';
import TurmaFormModal from '@/components/create-turma-form';
import DataTable, { ColumnDef } from '@/components/data-table';
import PageHeader from '@/components/shared/PageHeader';
import PageHeaderActions from '@/components/shared/PageHeaderActions';
import TurmaLayout from '@/layouts/turma-layout';

// Tipos
import { IaAnalysis, PageProps, Turma } from '@/types';

interface TurmasPageProps extends PageProps {
    turmas: Turma[];
    ia_analysis: IaAnalysis | null;
    error?: string;
}

export default function Index() {
    const { flash, turmas, ia_analysis, error } = usePage<TurmasPageProps>().props;
    const { delete: destroy, processing: isDeleting } = useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [turmaToEdit, setTurmaToEdit] = useState<Turma | null>(null);
    const [isDashboardVisible, setIsDashboardVisible] = useState(false);

    // Dica de Estilo: As colunas e os dados não precisam de alterações,
    // mas a estilização interna do DataTable fará toda a diferença.
    const columns: ColumnDef<Turma>[] = [
        { header: 'Nome', accessorKey: 'nome' },
        { header: 'Descrição', accessorKey: 'descricao' },
    ];

    const deleteTurma = (id: string | number) => {
        if (confirm('Tem certeza que deseja deletar esta turma?')) {
            destroy(route('turmas.destroy', id), { preserveScroll: true });
        }
    };

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

            {/* O PageHeader e o PageHeaderActions devem ser estilizados internamente
                para combinar com o design (ex: botões com gradiente, etc.) */}
            <PageHeader title="Turmas" description="Lista de todas as turmas cadastradas.">
                <PageHeaderActions
                    primaryActionLabel="Nova Turma"
                    onPrimaryActionClick={handleOpenCreateModal}
                    isDashboardVisible={isDashboardVisible}
                    onToggleDashboard={() => setIsDashboardVisible(!isDashboardVisible)}
                />
            </PageHeader>

            {/* ==== SECÇÃO DO DASHBOARD DE IA ESTILIZADA ==== */}
            {isDashboardVisible && (
                <div className="mb-6 animate-[fade-in_0.5s_ease-in-out]">
                    {/* O ideal é que o próprio componente DashboardIaSection tenha o estilo de "cartão de vidro" */}
                    <DashboardIaSection ia_analysis={ia_analysis} error={error} />
                </div>
            )}

            {/* ==== MENSAGEM DE SUCESSO (FLASH) COM NOVO ESTILO ==== */}
            {flash.success && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-300 backdrop-blur-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <p>{flash.success}</p>
                </div>
            )}

            {/* ==== CONTAINER DA TABELA DE DADOS COM ESTILO "GLASS" ==== */}
            <div className="rounded-xl border border-border/20 bg-card/40 p-2 backdrop-blur-lg md:p-4">
                {/*
                 * NOTA IMPORTANTE PARA O COMPONENTE DataTable:
                 * Para que o efeito de "vidro" funcione bem, o seu componente DataTable
                 * deve ter um fundo transparente. A cor de fundo das linhas (<tr>)
                 * deve ser aplicada apenas no hover, e não por padrão.
                 */}
                <DataTable<Turma>
                    columns={columns}
                    data={turmas}
                    onEdit={handleOpenEditModal}
                    onDelete={deleteTurma}
                    onRowClick={openTurmaDetails}
                    isProcessingActions={isDeleting}
                    emptyStateMessage="Nenhuma turma encontrada."
                />
            </div>

            {/* O modal também precisa ser estilizado internamente para ter o fundo "glass" */}
            <TurmaFormModal isOpen={isModalOpen} onClose={handleCloseModal} turma={turmaToEdit} />
        </TurmaLayout>
    );
}
