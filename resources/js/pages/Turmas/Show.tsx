// pages/Turmas/Show.tsx (COMPLETO E CORRIGIDO)

import AlunoFormModal from '@/components/aluno-form-modal';
import AvaliacaoFormModal from '@/components/AvaliacaoFormModal';
import DataTable, { ColumnDef } from '@/components/data-table';
import DeleteAvaliacaoModal from '@/components/DeleteAvaliacaoModal';
import { Button } from '@/components/ui/button'; // É uma boa prática usar o componente Button
import TurmaLayout from '@/layouts/turma-layout';
import { Aluno, AvaliacaoEvento, Materia, PageProps, periodo, Turma } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface ShowPageProps extends PageProps {
    turma: Turma & { alunos: Aluno[] };
    materias: Materia[];
    avaliacoesDaTurma: AvaliacaoEvento[];
    periodos: periodo[];
}

export default function Show() {
    const { turma, materias, avaliacoesDaTurma } = usePage<ShowPageProps>().props;
    const { delete: destroy, processing } = useForm();

    const [isAlunoModalOpen, setIsAlunoModalOpen] = useState(false);
    const [isAvaliacaoModalOpen, setIsAvaliacaoModalOpen] = useState(false);
    const [alunoToEdit, setAlunoToEdit] = useState<Aluno | null>(null);

    const [isDeleteAvaliacaoModalOpen, setIsDeleteAvaliacaoModalOpen] = useState(false);

    const columns: ColumnDef<Aluno>[] = [
        { header: 'Nome do Aluno', accessorKey: 'nome' },
        { header: 'Email', accessorKey: 'email' },
    ];

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

            <div className="mb-6 sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-foreground">Turma: {turma.nome}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Lista de todos os alunos cadastrados nesta turma.</p>
                </div>
                <div className="mt-4 space-x-2 sm:mt-0 sm:ml-16 sm:flex-none">
                    {/* A melhor forma é usar o componente Button e o atributo 'asChild' para links */}
                    <Button variant="outline" asChild>
                        <Link href={route('turmas.index')}>Voltar</Link>
                    </Button>
                    <Button variant="destructive" onClick={() => setIsDeleteAvaliacaoModalOpen(true)}>
                        Deletar Avaliação
                    </Button>
                    <Button variant="outline" onClick={() => setIsAvaliacaoModalOpen(true)}>
                        Criar Avaliação
                    </Button>
                    <Button onClick={handleOpenCreateAlunoModal}>Novo Aluno</Button>
                </div>
            </div>

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
