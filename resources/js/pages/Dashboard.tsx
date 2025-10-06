// Em: resources/js/Pages/Dashboard.tsx

import DashboardAluno from '@/components/DashboardAluno';
import DashboardIaSection from '@/components/DashboardIaSection';
import DashboardTurmaEspecifica from '@/components/DashboardTurmaEspecifica';
import PageHeader from '@/components/shared/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TurmaLayout from '@/layouts/turma-layout';
import { Aluno, AnaliseAluno, AnaliseTurma, IaAnalysis, PageProps, Periodo, Turma } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

// Tipos para os dados que vêm do backend
interface DashboardPageProps extends PageProps {
    turmas: Turma[];
    alunos: Aluno[]; // Lista completa de alunos
    periodos: Periodo[];
    ia_analysis: IaAnalysis | null;
    analiseTurma: AnaliseTurma | null;
    analiseAluno: AnaliseAluno | null;
    // IDs ativos para sabermos qual análise está a ser exibida
    activeTurmaId?: number;
    activeAlunoId?: number;
    activePeriodoId?: number;
}

export default function Dashboard() {
    // Pega todos os dados passados pelo backend
    const { turmas, alunos, periodos, ia_analysis, analiseTurma, analiseAluno, activeTurmaId, activeAlunoId, activePeriodoId } =
        usePage<DashboardPageProps>().props;

    // Estado para o seletor de aluno: guarda qual turma foi escolhida para filtrar os alunos
    const [selectedTurmaForStudent, setSelectedTurmaForStudent] = useState<string | null>(
        alunos.find((a) => a.id === activeAlunoId)?.turma_id.toString() ?? null,
    );

    // Filtra os alunos com base na turma selecionada no seletor
    const alunosDaTurmaSelecionada = selectedTurmaForStudent ? alunos.filter((aluno) => aluno.turma_id.toString() === selectedTurmaForStudent) : [];

    // Função para buscar a análise de uma TURMA específica
    const handleTurmaSelect = (turmaId: string) => {
        router.get(route('dashboard'), { turma_id: turmaId }, { preserveState: true, preserveScroll: true });
    };

    // Função para buscar a análise de um ALUNO específico
    const handleAlunoSelect = (alunoId: string) => {
        router.get(route('dashboard'), { aluno_id: alunoId }, { preserveState: true, preserveScroll: true });
    };

    return (
        <TurmaLayout>
            <Head title="Dashboard" />
            <PageHeader
                title="Dashboard Analítico"
                description="Explore insights gerados por IA sobre o desempenho geral, turmas e alunos individuais."
            />

            <Tabs defaultValue="geral" className="w-full">
                {/* Abas para Navegação */}
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="geral">Visão Geral</TabsTrigger>
                    <TabsTrigger value="turma">Análise por Turma</TabsTrigger>
                    <TabsTrigger value="aluno">Análise por Aluno</TabsTrigger>
                </TabsList>

                {/* Conteúdo da Aba 1: Visão Geral */}
                <TabsContent value="geral" className="mt-6">
                    <DashboardIaSection ia_analysis={ia_analysis} />
                </TabsContent>

                {/* Conteúdo da Aba 2: Análise por Turma */}
                <TabsContent value="turma" className="mt-6 space-y-6">
                    <div className="rounded-xl border border-border/20 bg-card/40 p-4 backdrop-blur-lg">
                        <h3 className="mb-2 font-semibold">Selecione uma Turma</h3>
                        <Select onValueChange={handleTurmaSelect} defaultValue={activeTurmaId?.toString()}>
                            <SelectTrigger className="w-full md:w-[300px]">
                                <SelectValue placeholder="Escolha uma turma para analisar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {turmas.map((turma) => (
                                    <SelectItem key={turma.id} value={turma.id.toString()}>
                                        {turma.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Renderiza o dashboard da turma apenas se uma análise tiver sido carregada */}
                    {analiseTurma && activeTurmaId && (
                        <DashboardTurmaEspecifica
                            analiseTurma={analiseTurma}
                            turmaId={activeTurmaId}
                            periodos={periodos}
                            activePeriodoId={activePeriodoId}
                        />
                    )}
                </TabsContent>

                {/* Conteúdo da Aba 3: Análise por Aluno */}
                <TabsContent value="aluno" className="mt-6 space-y-6">
                    <div className="space-y-4 rounded-xl border border-border/20 bg-card/40 p-4 backdrop-blur-lg">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 font-semibold">1. Selecione a Turma</h3>
                                <Select onValueChange={setSelectedTurmaForStudent} defaultValue={selectedTurmaForStudent ?? undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Primeiro, escolha a turma..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {turmas.map((turma) => (
                                            <SelectItem key={turma.id} value={turma.id.toString()}>
                                                {turma.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold">2. Selecione o Aluno</h3>
                                <Select
                                    onValueChange={handleAlunoSelect}
                                    defaultValue={activeAlunoId?.toString()}
                                    disabled={!selectedTurmaForStudent} // Desabilitado até uma turma ser escolhida
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Depois, escolha o aluno..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {alunosDaTurmaSelecionada.map((aluno) => (
                                            <SelectItem key={aluno.id} value={aluno.id.toString()}>
                                                {aluno.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    {/* Renderiza o dashboard do aluno apenas se uma análise tiver sido carregada */}
                    {analiseAluno && activeAlunoId && (
                        <DashboardAluno analiseAluno={analiseAluno} alunoId={activeAlunoId} alunoNome={analiseAluno.estatisticas.nome_aluno} />
                    )}
                </TabsContent>
            </Tabs>
        </TurmaLayout>
    );
}
