// resources/js/Pages/Turmas/Show.tsx

import AlunoFormModal from '@/components/aluno-form-modal';
import AvaliacaoFormModal from '@/components/AvaliacaoFormModal';
import DashboardTurmaEspecifica from '@/components/DashboardTurmaEspecifica';
import DataTable, { ColumnDef } from '@/components/data-table';
import DeleteAvaliacaoModal from '@/components/DeleteAvaliacaoModal';
import { FilePlus2, Trash2 } from 'lucide-react';
// <-- NOVOS IMPORTS -->
import PageHeader from '@/components/shared/PageHeader';
import PageHeaderActions from '@/components/shared/PageHeaderActions';
import TurmaLayout from '@/layouts/turma-layout';
import { Aluno, AnaliseTurma, AvaliacaoEvento, Materia, PageProps, Periodo, Turma } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

// <-- ATUALIZADO: Interface agora espera o ID do período ativo
interface ShowPageProps extends PageProps {
    turma: Turma & { alunos: Aluno[] };
    materias: Materia[];
    avaliacoesDaTurma: AvaliacaoEvento[];
    periodos: Periodo[];
    analise_turma: AnaliseTurma | null;
    error_analise?: string;
    ia_success?: string;
    active_periodo_id?: number; // <-- ATUALIZADO
}

export default function Show() {
    // <-- ATUALIZADO: Extrai a nova propriedade
    const { turma, materias, avaliacoesDaTurma, periodos, analise_turma, error_analise, ia_success, active_periodo_id } =
        usePage<ShowPageProps>().props;
    const { delete: destroy, processing } = useForm();

    const [isAlunoModalOpen, setIsAlunoModalOpen] = useState(false);
    const [isAvaliacaoModalOpen, setIsAvaliacaoModalOpen] = useState(false);
    const [alunoToEdit, setAlunoToEdit] = useState<Aluno | null>(null);
    const [isDeleteAvaliacaoModalOpen, setIsDeleteAvaliacaoModalOpen] = useState(false);
    const [isDashboardVisible, setIsDashboardVisible] = useState(true);

    const columns: ColumnDef<Aluno>[] = [{ header: 'Nome do Aluno', accessorKey: 'nome' }];

    const deleteAluno = (id: string | number) => {
        if (confirm('Tem certeza que deseja remover este aluno?')) {
            destroy(route('alunos.destroy', id), { preserveScroll: true });
        }
    };

    const handleOpenCreateAlunoModal = () => {
        setAlunoToEdit(null);
        setIsAlunoModalOpen(true);
    };

    const handleOpenEditAlunoModal = (aluno: Aluno) => {
        setAlunoToEdit(aluno);
        setIsAlunoModalOpen(true);
    };

    const handleCloseAlunoModal = () => {
        setIsAlunoModalOpen(false);
        setAlunoToEdit(null);
    };

    return (
        <TurmaLayout>
            <Head title={`Detalhes da Turma: ${turma.nome}`} />

            <PageHeader title={`Turma: ${turma.nome}`} description="Gerencie os alunos, avaliações e veja a análise de desempenho da turma.">
                <PageHeaderActions
                    primaryActionLabel="Novo Aluno"
                    onPrimaryActionClick={handleOpenCreateAlunoModal}
                    onBackClick={() => window.history.back()}
                    isDashboardVisible={isDashboardVisible}
                    onToggleDashboard={() => setIsDashboardVisible(!isDashboardVisible)}
                    dropdownActions={[
                        { label: 'Criar Avaliação', icon: FilePlus2, onClick: () => setIsAvaliacaoModalOpen(true) },
                        { label: 'Deletar Avaliação', icon: Trash2, onClick: () => setIsDeleteAvaliacaoModalOpen(true), isDestructive: true },
                    ]}
                />
            </PageHeader>

            {ia_success && <div className="mb-4 rounded-md bg-green-100 p-3 text-green-800">{ia_success}</div>}

            {isDashboardVisible && (
                <div className="mb-6">
                    {/* <-- ATUALIZADO: Passa as novas propriedades para o componente do Dashboard --> */}
                    <DashboardTurmaEspecifica
                        analiseTurma={analise_turma}
                        error={error_analise}
                        turmaId={turma.id}
                        periodos={periodos}
                        activePeriodoId={active_periodo_id}
                    />
                </div>
            )}

            <DataTable<Aluno>
                columns={columns}
                data={turma.alunos}
                onEdit={handleOpenEditAlunoModal}
                onDelete={deleteAluno}
                onRowClick={(aluno) => router.get(route('alunos.show', aluno.id))}
                isProcessingActions={processing}
                emptyStateMessage="Nenhum aluno cadastrado nesta turma."
            />

            <AlunoFormModal isOpen={isAlunoModalOpen} onClose={handleCloseAlunoModal} aluno={alunoToEdit} turmaId={turma.id} />
            <AvaliacaoFormModal isOpen={isAvaliacaoModalOpen} onClose={() => setIsAvaliacaoModalOpen(false)} turmaId={turma.id} materias={materias} />
            <DeleteAvaliacaoModal
                isOpen={isDeleteAvaliacaoModalOpen}
                onClose={() => setIsDeleteAvaliacaoModalOpen(false)}
                turmaId={turma.id}
                avaliacoesDaTurma={avaliacoesDaTurma}
            />
        </TurmaLayout>
    );
}
