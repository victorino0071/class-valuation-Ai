// resources/js/Pages/Avaliacoes/Index.tsx

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

// Layouts e Componentes
import DataTable, { ColumnDef } from '@/components/data-table';
import EditAvaliacaoModal from '@/components/EditAvaliacaoModal';
import PageHeader from '@/components/shared/PageHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TurmaLayout from '@/layouts/turma-layout';
import { AlertCircle, ChevronDown, Copy, Download, Trash2 } from 'lucide-react';

// Tipos
import { Aluno, Avaliacao as BaseAvaliacao, PageProps as BasePageProps, Materia, Turma } from '@/types';

const NOTA_REPROVACAO = 50;
const NOTA_APROVACAO = 70;

interface AvaliacaoComRelacionamentos extends BaseAvaliacao {
    aluno?: Aluno;
    materia?: Materia;
    turma?: Turma;
}

interface AvaliacoesPageProps extends BasePageProps {
    avaliacoes: AvaliacaoComRelacionamentos[];
}

interface AlunoAvaliacao {
    id: number;
    aluno_id: number;
    nota: number;
    aluno_nome?: string | null;
}

export interface AvaliacaoAgrupada {
    id: string;
    turma_id: number;
    turma_nome?: string | null;
    materia_id: number;
    materia_nome?: string | null;
    data_avaliacao: string;
    alunos: AlunoAvaliacao[];
}

const makeCSV = (grupo: AvaliacaoAgrupada) => {
    const header = ['Aluno ID', 'Aluno Nome', 'Nota', 'Turma ID', 'Matéria ID', 'Data'];
    const rows = grupo.alunos.map((a) => [
        String(a.aluno_id),
        `"${(a.aluno_nome ?? '').replace(/"/g, '""')}"`,
        String(a.nota),
        String(grupo.turma_id),
        String(grupo.materia_id),
        grupo.data_avaliacao,
    ]);
    return [header, ...rows].map((r) => r.join(',')).join('\n');
};

export default function Index() {
    const { avaliacoes, flash } = usePage<AvaliacoesPageProps>().props;
    const { delete: destroyBulk, processing: isDeleting } = useForm({});
    const [editingAvaliacao, setEditingAvaliacao] = useState<AvaliacaoComRelacionamentos | null>(null);

    // Agrupamento
    const avaliacoesAgrupadas = useMemo<AvaliacaoAgrupada[]>(() => {
        const grupos: Record<string, AvaliacaoAgrupada> = {};
        avaliacoes.forEach((avaliacao) => {
            const dataFormatada = avaliacao.data_avaliacao ? new Date(avaliacao.data_avaliacao).toISOString().split('T')[0] : 'sem-data';
            const grupoId = `turma-${avaliacao.turma_id}-materia-${avaliacao.materia_id}-data-${dataFormatada}`;
            if (!grupos[grupoId]) {
                grupos[grupoId] = {
                    id: grupoId,
                    turma_id: avaliacao.turma_id,
                    turma_nome: avaliacao.turma?.nome ?? null,
                    materia_id: avaliacao.materia_id,
                    materia_nome: avaliacao.materia?.nome ?? null,
                    data_avaliacao: dataFormatada,
                    alunos: [],
                };
            }
            grupos[grupoId].alunos.push({
                id: avaliacao.id,
                aluno_id: avaliacao.aluno_id,
                nota: Number(avaliacao.nota ?? 0),
                aluno_nome: avaliacao.aluno?.nome ?? null,
            });
        });
        return Object.values(grupos).sort((a, b) => {
            if (a.data_avaliacao === b.data_avaliacao) {
                if (a.turma_id === b.turma_id) return a.materia_id - b.materia_id;
                return a.turma_id - b.turma_id;
            }
            return b.data_avaliacao.localeCompare(a.data_avaliacao);
        });
    }, [avaliacoes]);

    const formatarData = (data: string) => {
        if (!data || data === 'sem-data') return '—';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleEditClick = (alunoAvaliacao: AlunoAvaliacao) => {
        const fullAvaliacao = avaliacoes.find((a) => a.id === alunoAvaliacao.id);
        if (fullAvaliacao) setEditingAvaliacao(fullAvaliacao);
    };

    const columns: ColumnDef<AlunoAvaliacao>[] = [
        {
            header: 'Aluno',
            accessorKey: 'aluno_nome',
            cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    {/* REMOVIDO: animate-pulse */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-xs font-bold text-white">
                        {String(row.original.aluno_id).slice(-2)}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground">{row.original.aluno_nome ?? `Aluno ${row.original.aluno_id}`}</div>
                        <div className="text-xs text-muted-foreground">ID: {row.original.aluno_id}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Nota',
            accessorKey: 'nota',
            cell: ({ row }) => {
                const nota = row.original.nota ?? 0;
                const getVariant = (n: number): 'destructive' | 'secondary' | 'default' => {
                    if (n < NOTA_REPROVACAO) return 'destructive';
                    if (n < NOTA_APROVACAO) return 'secondary';
                    return 'default';
                };
                return (
                    <div className="flex items-center space-x-3">
                        {/* REMOVIDO: animate-bounce */}
                        <Badge variant={getVariant(nota)} className="text-sm font-semibold">
                            {nota}
                        </Badge>
                        <div className="w-32">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                {/* REMOVIDO: animate-pulse */}
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all duration-700"
                                    style={{ width: `${Math.max(0, Math.min(100, nota))}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            },
        },
    ];

    const handleDeleteGroup = (grupo: AvaliacaoAgrupada) => {
        if (!confirm('Tem certeza que deseja excluir este conjunto de avaliações?')) return;
        const dataToSend = { turma_id: grupo.turma_id, materia_id: grupo.materia_id, data_avaliacao: grupo.data_avaliacao };

        // A sintaxe abaixo está correta para o Inertia.js. O erro de TS provavelmente
        // vem de tipos desatualizados. Verifique suas dependências do Inertia.
        destroyBulk(route('avaliacoes.destroyBulk'), { data: dataToSend, preserveScroll: true });
    };

    const calcStats = useCallback((g: AvaliacaoAgrupada) => {
        const notas = g.alunos.map((a) => a.nota ?? 0);
        const total = notas.length;
        if (total === 0) return { total, media: 0, aprovados: 0, emRecuperacao: 0, reprovados: 0 };
        const soma = notas.reduce((s, x) => s + x, 0);
        const media = +(soma / total).toFixed(2);
        const aprovados = notas.filter((n) => n >= NOTA_APROVACAO).length;
        const reprovados = notas.filter((n) => n < NOTA_REPROVACAO).length;
        const emRecuperacao = total - aprovados - reprovados;
        return { total, media, aprovados, emRecuperacao, reprovados };
    }, []);

    const handleDownloadCSV = (grupo: AvaliacaoAgrupada) => {
        const csv = makeCSV(grupo);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `avaliacoes_${grupo.turma_nome ?? grupo.turma_id}_${grupo.materia_nome ?? grupo.materia_id}_${grupo.data_avaliacao}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleCopyCSV = async (grupo: AvaliacaoAgrupada) => {
        const csv = makeCSV(grupo);
        try {
            await navigator.clipboard.writeText(csv);
            alert('CSV copiado para a área de transferência.');
        } catch {
            alert('Falha ao copiar. Tente baixar o arquivo CSV.');
        }
    };

    return (
        <TurmaLayout>
            <Head title="Avaliações" />
            <PageHeader title="Histórico de Avaliações" description="Gerencie todos os conjuntos de avaliações aplicadas." />

            {flash.success && (
                <div className="animate-fade-in mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800 shadow-md">
                    <p className="text-sm font-medium">{flash.success}</p>
                </div>
            )}
            {flash.error && (
                <div className="animate-fade-in mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-md">
                    <p className="text-sm font-medium">{flash.error}</p>
                </div>
            )}

            {avaliacoesAgrupadas.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-5">
                    {avaliacoesAgrupadas.map((grupo) => {
                        const stats = calcStats(grupo);
                        return (
                            <AccordionItem
                                key={grupo.id}
                                value={grupo.id}
                                className="overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card/60 to-card/40 p-1 shadow-lg backdrop-blur-xl transition-all hover:scale-[1.01] hover:shadow-2xl" // ALTERADO: hover:scale um pouco mais sutil
                            >
                                <AccordionTrigger className="rounded-xl px-6 py-5 transition-colors hover:bg-accent/30">
                                    <div className="flex w-full items-center justify-between gap-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                                                <div className="text-lg font-bold text-foreground">
                                                    {grupo.turma_nome ? `Turma ${grupo.turma_nome}` : `Turma ${grupo.turma_id}`}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {grupo.materia_nome ?? `Matéria ${grupo.materia_id}`} • {formatarData(grupo.data_avaliacao)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                                <span>{stats.total} aluno(s)</span>
                                                <span>
                                                    Média: <span className="font-semibold text-foreground">{stats.media}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="animate-fade-in-up border-t px-6 py-5">
                                    <div className="mb-4 flex flex-wrap gap-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="transition-transform hover:scale-105"
                                            onClick={() => handleDownloadCSV(grupo)}
                                        >
                                            <Download className="mr-2 h-4 w-4" /> Exportar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="transition-transform hover:scale-105"
                                            onClick={() => handleCopyCSV(grupo)}
                                        >
                                            <Copy className="mr-2 h-4 w-4" /> Copiar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="transition-transform hover:scale-105"
                                            onClick={() => handleDeleteGroup(grupo)}
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                        </Button>
                                    </div>

                                    <div className="mb-6 rounded-xl bg-muted/50 p-4 shadow-inner">
                                        <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Distribuição de Notas</div>
                                        <div className="flex h-3 w-full overflow-hidden rounded-full">
                                            <div
                                                style={{ width: `${(stats.reprovados / stats.total) * 100}%` }}
                                                className="bg-red-500 transition-all duration-700" // REMOVIDO: animate-pulse
                                                title={`Reprovados: ${stats.reprovados}`}
                                            />
                                            <div
                                                style={{ width: `${(stats.emRecuperacao / stats.total) * 100}%` }}
                                                className="bg-yellow-400 transition-all duration-700" // REMOVIDO: animate-pulse
                                                title={`Em Recuperação: ${stats.emRecuperacao}`}
                                            />
                                            <div
                                                style={{ width: `${(stats.aprovados / stats.total) * 100}%` }}
                                                className="bg-green-400 transition-all duration-700" // REMOVIDO: animate-pulse
                                                title={`Aprovados: ${stats.aprovados}`}
                                            />
                                        </div>
                                    </div>

                                    <DataTable<AlunoAvaliacao>
                                        columns={columns}
                                        data={grupo.alunos}
                                        onRowClick={(aluno) => router.get(route('alunos.show', aluno.aluno_id))}
                                        onEdit={handleEditClick}
                                        isProcessingActions={isDeleting}
                                        emptyStateMessage="Nenhum aluno encontrado para esta avaliação."
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            ) : (
                <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-gradient-to-br from-card/50 to-card/30 p-12 text-center shadow-lg backdrop-blur-xl">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-2xl font-bold text-foreground">Nenhuma avaliação encontrada</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Para começar, crie uma nova avaliação na página de uma turma específica.</p>
                </div>
            )}

            {/* ALTERADO: Renderização condicional para o modal, removendo o 'as any' e garantindo que a prop 'avaliacao' nunca seja nula. */}
            {editingAvaliacao && <EditAvaliacaoModal isOpen={true} onClose={() => setEditingAvaliacao(null)} avaliacao={editingAvaliacao} />}
        </TurmaLayout>
    );
}
