// resources/js/Pages/Alunos/Show.tsx (COMPLETO E ATUALIZADO)

import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
// ATUALIZADO: Importar os tipos Avaliacao e Materia
import { PageProps, Aluno, Turma, Relatorio, Avaliacao, Materia } from '@/types';

import TurmaLayout from '@/layouts/turma-layout';
import AlunoFormModal from '@/components/aluno-form-modal';
import RelatorioFormModal from '@/components/RelatorioFormModal';
import { Button } from '@/components/ui/button';
// ATUALIZADO: Importar CardDescription para melhor semântica
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import DataTable, { ColumnDef } from '@/components/data-table';
import ViewRelatorioModal from '@/components/ViewRelatorioModal';
import EditRelatorioModal from '@/components/EditRelatorioModal';
// NOVO: Importar o modal de edição de avaliação
import EditAvaliacaoModal from '@/components/EditAvaliacaoModal';

// NOVO: Tipagem para avaliações, incluindo a matéria aninhada
type AvaliacaoComMateria = Avaliacao & { materia: Materia };

// ATUALIZADO: Interface de props da página para incluir as avaliações
interface AlunoShowPageProps extends PageProps {
    aluno: Aluno & { 
        turma: Turma,
        relatorios: Relatorio[],
        avaliacoes: AvaliacaoComMateria[], // Adicionada a propriedade de avaliações
    };
}

export default function Show() {
    // 1. OBTENDO DADOS E INICIALIZANDO FORMULÁRIOS
    // =================================================================
    const { aluno } = usePage<AlunoShowPageProps>().props;
    const { delete: destroy, processing: isDeleting } = useForm();

    // Formulários e estados para Relatórios (sem alteração)
    const { delete: destroyRelatorio, processing: isDeletingRelatorio } = useForm();
    const [viewingRelatorio, setViewingRelatorio] = useState<Relatorio | null>(null);
    const [editingRelatorio, setEditingRelatorio] = useState<Relatorio | null>(null);

    // NOVO: Formulários e estados para Avaliações
    const [editingAvaliacao, setEditingAvaliacao] = useState<AvaliacaoComMateria | null>(null);
    
    // Estados dos modais (sem alteração)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRelatorioModalOpen, setIsRelatorioModalOpen] = useState(false);

    // 2. FUNÇÕES DE MANIPULAÇÃO DE EVENTOS
    // =================================================================
    
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



    // 3. DEFINIÇÕES DE COLUNAS E FORMATAÇÃO DE DADOS
    // =================================================================
    
    // Colunas e dados para a tabela de Relatórios (sem alteração)
    type FormattedRelatorio = Relatorio & { bimestreFormatado: string };
    const relatorioColumns: ColumnDef<FormattedRelatorio>[] = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'Bimestre', accessorKey: 'bimestreFormatado' },
    ];
    const formattedRelatorios = aluno.relatorios.map(r => ({
        ...r,
        bimestreFormatado: `${r.bimestre}º Bimestre`,
    }));

    // NOVO: Colunas e dados para a tabela de Avaliações
    type FormattedAvaliacao = AvaliacaoComMateria & { materiaNome: string; dataFormatada: string };
    const avaliacaoColumns: ColumnDef<FormattedAvaliacao>[] = [
        { header: 'Matéria', accessorKey: 'materiaNome' },
        { header: 'Data', accessorKey: 'dataFormatada' },
        { header: 'Nota', accessorKey: 'nota' },
    ];
    const formattedAvaliacoes = aluno.avaliacoes.map(av => ({
        ...av,
        materiaNome: av.materia.nome,
        dataFormatada: new Date(av.data_avaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    }));


    // 4. RENDERIZAÇÃO DO COMPONENTE
    // =================================================================
    return (
        <TurmaLayout>
            <Head title={`Aluno: ${aluno.nome}`} />

            {/* Cabeçalho da página com título e botões de ação (sem alteração) */}
            <div className="sm:flex sm:items-center justify-between mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-foreground">Detalhes do Aluno</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Visualizando informações de {aluno.nome}.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-none space-x-2">
                    <Button variant="outline" asChild>
                        <Link href={route('turmas.show', aluno.turma.id)}>Voltar</Link>
                    </Button>
                    <Button variant="outline" onClick={() => setIsRelatorioModalOpen(true)}>
                        Adicionar Relatório
                    </Button>
                    <Button onClick={() => setIsEditModalOpen(true)}>
                        Editar Aluno
                    </Button>
                    <Button variant="destructive" onClick={deleteAluno} disabled={isDeleting}>
                        {isDeleting ? 'Deletando...' : 'Deletar'}
                    </Button>
                </div>
            </div>

            {/* ATUALIZADO: Card principal agora inclui a tabela de avaliações */}
            <Card>
                <CardHeader>
                    <CardTitle>{aluno.nome}</CardTitle>
                    <CardDescription>Informações do aluno e histórico de avaliações.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="divide-y divide-border">
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-foreground">ID do Aluno</dt>
                            <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">{aluno.id}</dd>
                        </div>
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-foreground">Nome Completo</dt>
                            <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">{aluno.nome}</dd>
                        </div>
                        <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium leading-6 text-foreground">Turma</dt>
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

                    {/* NOVO: Tabela de Avaliações dentro do Card */}
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-base font-semibold leading-6 text-foreground mb-4">
                            Histórico de Avaliações
                        </h3>
                        <DataTable
                            columns={avaliacaoColumns}
                            data={formattedAvaliacoes}
                            onEdit={setEditingAvaliacao}
                            emptyStateMessage="Nenhuma avaliação encontrada para este aluno."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Modais de Edição do Aluno e Adição de Relatório (sem alteração) */}
            <AlunoFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} aluno={aluno} turmaId={aluno.turma_id}/>
            <RelatorioFormModal isOpen={isRelatorioModalOpen} onClose={() => setIsRelatorioModalOpen(false)} aluno={aluno}/>

            {/* Card da Tabela de Relatórios (sem alteração) */}
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

            {/* Modais de Visualização e Edição de Relatórios (sem alteração) */}
            <ViewRelatorioModal isOpen={!!viewingRelatorio} onClose={() => setViewingRelatorio(null)} relatorio={viewingRelatorio} />
            <EditRelatorioModal isOpen={!!editingRelatorio} onClose={() => setEditingRelatorio(null)} relatorio={editingRelatorio} />
            
            {/* NOVO: Renderização do modal de edição de avaliação */}
            <EditAvaliacaoModal
                isOpen={!!editingAvaliacao}
                onClose={() => setEditingAvaliacao(null)}
                avaliacao={editingAvaliacao}
            />
        </TurmaLayout>
    );
}