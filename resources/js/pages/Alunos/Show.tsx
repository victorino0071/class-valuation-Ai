// resources/js/Pages/Alunos/Show.tsx (COMPLETO E CORRIGIDO)

import { Aluno, Avaliacao, Materia, PageProps, periodo, Relatorio, Turma } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import AlunoFormModal from '@/components/aluno-form-modal';
import RelatorioFormModal from '@/components/RelatorioFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TurmaLayout from '@/layouts/turma-layout';

import DataTable, { ColumnDef } from '@/components/data-table';
import EditAvaliacaoModal from '@/components/EditAvaliacaoModal';
import EditRelatorioModal from '@/components/EditRelatorioModal';
import ViewRelatorioModal from '@/components/ViewRelatorioModal';

type AvaliacaoComMateria = Avaliacao & { materia: Materia; periodo_id: number };

interface AlunoShowPageProps extends PageProps {
    aluno: Aluno & {
        turma: Turma;
        relatorios: Relatorio[];
        avaliacoes: AvaliacaoComMateria[];
    };
    periodos: periodo[];
}

export default function Show() {
    const { aluno, periodos } = usePage<AlunoShowPageProps>().props;
    const { delete: destroy, processing: isDeleting } = useForm();

    const { delete: destroyRelatorio, processing: isDeletingRelatorio } = useForm();
    const [viewingRelatorio, setViewingRelatorio] = useState<Relatorio | null>(null);
    const [editingRelatorio, setEditingRelatorio] = useState<Relatorio | null>(null);

    const [editingAvaliacao, setEditingAvaliacao] = useState<AvaliacaoComMateria | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);

    const deleteAluno = () => {
        if (confirm('Tem certeza que deseja deletar este aluno? Esta ação não pode ser desfeita.')) {
            destroy(route('alunos.destroy', aluno.id));
        }
    };

    const handleDeleteRelatorio = (id: number | string) => {
        if (confirm(`Tem certeza que deseja deletar o relatório?`)) {
            destroyRelatorio(route('relatorios.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // --- RELATÓRIOS (Sem alterações) ---
    type FormattedRelatorio = Relatorio & { bimestreFormatado: string };
    const relatorioColumns: ColumnDef<FormattedRelatorio>[] = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Bimestre', accessorKey: 'bimestreFormatado' },
    ];
    const formattedRelatorios = aluno.relatorios.map((r) => ({
        ...r,
        bimestreFormatado: `${r.periodo_id}º período`,
    }));
    // --- FIM RELATÓRIOS ---

    // --- AVALIAÇÕES (Com as correções) ---

    // ALTERAÇÃO 1: Atualizar a tipagem para incluir a nova propriedade 'periodoNome'.
    type FormattedAvaliacao = AvaliacaoComMateria & { materiaNome: string; dataFormatada: string; periodoNome: string };

    // ALTERAÇÃO 3: Ajustar o accessorKey da coluna para usar a nova propriedade.
    const avaliacaoColumns: ColumnDef<FormattedAvaliacao>[] = [
        { header: 'Matéria', accessorKey: 'materiaNome' },
        { header: 'Data', accessorKey: 'dataFormatada' },
        { header: 'Nota', accessorKey: 'nota' },
        { header: 'Período', accessorKey: 'periodoNome' }, // CORRIGIDO
    ];

    // ALTERAÇÃO 2: Mapear os dados para incluir o nome do período.
    const formattedAvaliacoes = aluno.avaliacoes.map((av) => {
        const periodoEncontrado = periodos.find((p) => p.id === av.periodo_id);
        return {
            ...av,
            materiaNome: av.materia.nome,
            dataFormatada: new Date(av.data_avaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
            periodoNome: periodoEncontrado ? periodoEncontrado.nome : 'N/A', // CORRIGIDO
        };
    });
    // --- FIM AVALIAÇÕES ---

    return (
        <TurmaLayout>
            <Head title={`Aluno: ${aluno.nome}`} />

            {/* Cabeçalho da página */}
            <div className="sm:flex-auto">
                <div className="mb-6 justify-between sm:flex sm:items-center">
                    <h1 className="text-xl font-semibold text-foreground">Detalhes do Aluno</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Visualizando informações de {aluno.nome}.</p>
                </div>
                <div className="mt-4 space-x-2 sm:mt-0 sm:ml-4 sm:flex-none">
                    <Button variant="outline" asChild>
                        <Link href={route('turmas.show', aluno.turma.id)}>Voltar</Link>
                    </Button>
                    <Button variant="outline" onClick={() => setIsRelatorioModalOpen(true)}>
                        Adicionar Relatório
                    </Button>
                    <Button onClick={() => setIsEditModalOpen(true)}>Editar Aluno</Button>
                    <Button variant="destructive" onClick={deleteAluno} disabled={isDeleting}>
                        {isDeleting ? 'Deletando...' : 'Deletar'}
                    </Button>
                </div>
            </div>

            {/* Card de informações e avaliações */}
            <Card>
                <CardHeader>
                    <CardTitle>{aluno.nome}</CardTitle>
                    <CardDescription>Informações do aluno e histórico de avaliações.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="divide-y divide-border">
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm leading-6 font-medium text-foreground">ID do Aluno</dt>
                            <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">{aluno.id}</dd>
                        </div>
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm leading-6 font-medium text-foreground">Nome Completo</dt>
                            <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">{aluno.nome}</dd>
                        </div>
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm leading-6 font-medium text-foreground">Turma</dt>
                            <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">
                                <Link
                                    href={route('turmas.show', aluno.turma.id)}
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    {aluno.turma.nome}
                                </Link>
                            </dd>
                        </div>
                    </dl>

                    {/* Tabela de Avaliações */}
                    <div className="mt-6 border-t pt-6">
                        <h3 className="mb-4 text-base leading-6 font-semibold text-foreground">Histórico de Avaliações</h3>
                        <DataTable
                            columns={avaliacaoColumns}
                            data={formattedAvaliacoes}
                            onEdit={setEditingAvaliacao}
                            emptyStateMessage="Nenhuma avaliação encontrada para este aluno."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Modais */}
            <AlunoFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} aluno={aluno} turmaId={aluno.turma_id} />
            <RelatorioFormModal isOpen={isRelatorioModalOpen} onClose={() => setIsRelatorioModalOpen(false)} aluno={aluno} periodos={periodos} />

            {/* Card de Relatórios */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Relatórios do Aluno</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={relatorioColumns}
                        data={formattedRelatorios}
                        onEdit={setEditingRelatorio}
                        onDelete={handleDeleteRelatorio}
                        onRowClick={setViewingRelatorio}
                        isProcessingActions={isDeletingRelatorio}
                        emptyStateMessage="Nenhum relatório encontrado para este aluno."
                    />
                </CardContent>
            </Card>

            {/* Modais de Relatórios e Avaliações */}
            <ViewRelatorioModal isOpen={!!viewingRelatorio} onClose={() => setViewingRelatorio(null)} relatorio={viewingRelatorio} />
            <EditRelatorioModal isOpen={!!editingRelatorio} onClose={() => setEditingRelatorio(null)} relatorio={editingRelatorio} />
            <EditAvaliacaoModal isOpen={!!editingAvaliacao} onClose={() => setEditingAvaliacao(null)} avaliacao={editingAvaliacao} />
        </TurmaLayout>
    );
}
