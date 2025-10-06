// resources/js/Pages/Alunos/Show.tsx (COMPLETO E CORRIGIDO)

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

// Layouts e Componentes
import AlunoFormModal from '@/components/aluno-form-modal';
import DashboardAluno from '@/components/DashboardAluno';
import DataTable, { ColumnDef } from '@/components/data-table';
import EditAvaliacaoModal from '@/components/EditAvaliacaoModal';
import EditRelatorioModal from '@/components/EditRelatorioModal';
import RelatorioFormModal from '@/components/RelatorioFormModal';
import PageHeader from '@/components/shared/PageHeader';
import PageHeaderActions from '@/components/shared/PageHeaderActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ViewRelatorioModal from '@/components/ViewRelatorioModal';
import TurmaLayout from '@/layouts/turma-layout';

// Tipos
import { Aluno, AnaliseAluno, Avaliacao, Materia, PageProps, Periodo, Relatorio, Turma } from '@/types';

// ADICIONADO: Importação dos ícones necessários para as ações do dropdown
import { Edit, Trash2 } from 'lucide-react';

type AvaliacaoComMateria = Avaliacao & { materia: Materia; periodo_id: number };

interface AlunoShowPageProps extends PageProps {
    aluno: Aluno & { turma: Turma; relatorios: Relatorio[]; avaliacoes: AvaliacaoComMateria[] };
    periodos: Periodo[];
    analise_aluno: AnaliseAluno | null;
    error_analise?: string;
}

export default function Show() {
    // CORRIGIDO: Removido `active_periodo_id` que não é mais usado aqui
    const { aluno, periodos, analise_aluno, error_analise } = usePage<AlunoShowPageProps>().props;
    const { delete: destroyAluno } = useForm();
    const { delete: destroyRelatorio, processing: isDeletingRelatorio } = useForm();

    const [isDashboardVisible, setIsDashboardVisible] = useState(true);
    const [viewingRelatorio, setViewingRelatorio] = useState<Relatorio | null>(null);
    const [editingRelatorio, setEditingRelatorio] = useState<Relatorio | null>(null);
    const [editingAvaliacao, setEditingAvaliacao] = useState<AvaliacaoComMateria | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);

    const deleteAluno = () => {
        if (confirm('Tem certeza que deseja deletar este aluno? Esta ação não pode ser desfeita.')) {
            destroyAluno(route('alunos.destroy', aluno.id), { onFinish: () => router.visit(route('turmas.show', aluno.turma_id)) });
        }
    };

    const handleDeleteRelatorio = (id: number | string) => {
        if (confirm(`Tem certeza que deseja deletar o relatório?`)) {
            destroyRelatorio(route('relatorios.destroy', id), { preserveScroll: true });
        }
    };

    type FormattedRelatorio = Relatorio & { bimestreFormatado: string };
    const relatorioColumns: ColumnDef<FormattedRelatorio>[] = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Bimestre', accessorKey: 'bimestreFormatado' },
    ];
    const formattedRelatorios = aluno.relatorios.map((r) => ({ ...r, bimestreFormatado: `${r.periodo_id}º período` }));

    type FormattedAvaliacao = AvaliacaoComMateria & { materiaNome: string; dataFormatada: string; periodoNome: string };
    const avaliacaoColumns: ColumnDef<FormattedAvaliacao>[] = [
        { header: 'Matéria', accessorKey: 'materiaNome' },
        { header: 'Data', accessorKey: 'dataFormatada' },
        { header: 'Nota', accessorKey: 'nota' },
        { header: 'Período', accessorKey: 'periodoNome' },
    ];
    const formattedAvaliacoes = aluno.avaliacoes.map((av) => {
        const periodoEncontrado = periodos.find((p) => p.id === av.periodo_id);
        return {
            ...av,
            materiaNome: av.materia.nome,
            dataFormatada: new Date(av.data_avaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            periodoNome: periodoEncontrado ? periodoEncontrado.nome : 'N/A',
        };
    });

    return (
        <TurmaLayout>
            <Head title={`Aluno: ${aluno.nome}`} />

            <PageHeader title={aluno.nome} description={`Aluno da turma ${aluno.turma.nome}.`}>
                <PageHeaderActions
                    primaryActionLabel="Adicionar Relatório"
                    onPrimaryActionClick={() => setIsRelatorioModalOpen(true)}
                    onBackClick={() => router.visit(route('turmas.show', aluno.turma_id))}
                    isDashboardVisible={isDashboardVisible}
                    onToggleDashboard={() => setIsDashboardVisible(!isDashboardVisible)}
                    // CORRIGIDO: Adicionada a propriedade 'icon' a cada ação.
                    dropdownActions={[
                        { label: 'Editar Aluno', icon: Edit, onClick: () => setIsEditModalOpen(true) },
                        { label: 'Deletar Aluno', icon: Trash2, onClick: deleteAluno, isDestructive: true },
                    ]}
                />
            </PageHeader>

            {isDashboardVisible && (
                <div className="mb-6">
                    <DashboardAluno analiseAluno={analise_aluno} error={error_analise} alunoId={aluno.id} alunoNome={aluno.nome} />
                </div>
            )}

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Histórico de Avaliações</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={avaliacaoColumns}
                        data={formattedAvaliacoes}
                        onEdit={setEditingAvaliacao}
                        emptyStateMessage="Nenhuma avaliação encontrada para este aluno."
                    />
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Relatórios Pedagógicos</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={relatorioColumns}
                        data={formattedRelatorios}
                        onEdit={setEditingRelatorio}
                        onDelete={handleDeleteRelatorio}
                        onRowClick={setViewingRelatorio}
                        isProcessingActions={isDeletingRelatorio}
                        emptyStateMessage="Nenhum relatório encontrado."
                    />
                </CardContent>
            </Card>

            {/* Modais */}
            <AlunoFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} aluno={aluno} turmaId={aluno.turma_id} />
            <RelatorioFormModal isOpen={isRelatorioModalOpen} onClose={() => setIsRelatorioModalOpen(false)} aluno={aluno} periodos={periodos} />
            <ViewRelatorioModal isOpen={!!viewingRelatorio} onClose={() => setViewingRelatorio(null)} relatorio={viewingRelatorio} aluno={aluno} />
            <EditRelatorioModal isOpen={!!editingRelatorio} onClose={() => setEditingRelatorio(null)} relatorio={editingRelatorio} />
            <EditAvaliacaoModal isOpen={!!editingAvaliacao} onClose={() => setEditingAvaliacao(null)} avaliacao={editingAvaliacao} />
        </TurmaLayout>
    );
}
