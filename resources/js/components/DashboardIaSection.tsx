// resources/js/components/DashboardIaSection.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IaAnalysis } from '@/types';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react'; // <-- NOVO: Para controlar o estado de loading
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { route } from 'ziggy-js';
import DashboardHeader from './shared/DashboardHeader'; // <-- NOVO
import EmptyStateCard from './shared/EmptyStateCard'; // <-- NOVO
import ErrorStateCard from './shared/ErrorStateCard'; // <-- NOVO
import SectionTitle from './shared/SectionTitle'; // <-- NOVO

interface DashboardIaProps {
    ia_analysis: IaAnalysis | null;
    error?: string;
}

const DashboardIaSection = ({ ia_analysis, error }: DashboardIaProps) => {
    // NOVO: Estado para feedback visual durante a geração da análise
    const [isLoading, setIsLoading] = useState(false);

    const handleRegenerateAnalysis = () => {
        setIsLoading(true);
        router.post(
            route('ia.regenerate'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                // onFinish é chamado tanto em sucesso quanto em erro
                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    // ATUALIZADO: Usa o componente reutilizável de erro
    if (error) {
        return <ErrorStateCard message={error} />;
    }

    // ATUALIZADO: Usa o componente reutilizável de estado vazio
    if (!ia_analysis) {
        return (
            <EmptyStateCard
                title="Análise Geral de IA"
                message="Nenhuma análise foi gerada ainda. Clique no botão para gerar a primeira visão geral das turmas."
                buttonLabel="Gerar Análise Geral"
                onButtonClick={handleRegenerateAnalysis}
            />
        );
    }

    // A lógica para os dados do gráfico permanece a mesma
    const chartData =
        ia_analysis.analise_individual.map((turma) => ({
            nome: turma.nome_turma,
            alunos: turma.numero_alunos,
            insight: turma.insight,
        })) || [];

    return (
        <AnimatePresence>
            <motion.div
                key="ia-dashboard-data"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8" // Aumentado o espaçamento entre seções
            >
                {/* ATUALIZADO: Usa o componente de cabeçalho do dashboard */}
                <DashboardHeader
                    title="Dashboard de Análise de Turmas"
                    description="Visão consolidada do desempenho geral de todas as turmas."
                    buttonLabel="Gerar Nova Análise"
                    onButtonClick={handleRegenerateAnalysis}
                    isLoading={isLoading}
                />

                {/* ATUALIZADO: Estrutura organizada com SectionTitle */}
                <div className="space-y-6">
                    <SectionTitle>Visão Geral</SectionTitle>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Resumo Geral */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Resumo Geral (Análise IA)</CardTitle>
                                <CardDescription>Visão consolidada da análise gerada.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{ia_analysis.resumo_geral}</p>
                            </CardContent>
                        </Card>

                        {/* Métricas Chave */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Métricas Chave</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total de Turmas:</span>
                                    <span className="font-semibold">{ia_analysis.metricas_chave.total_turmas}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total de Alunos:</span>
                                    <span className="font-semibold">{ia_analysis.metricas_chave.total_alunos}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Média Alunos/Turma:</span>
                                    <span className="font-semibold">{ia_analysis.metricas_chave.media_alunos_por_turma.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-muted-foreground">Turma com Mais Alunos:</span>
                                    <span className="font-semibold">
                                        {ia_analysis.metricas_chave.turma_com_mais_alunos.nome} (
                                        {ia_analysis.metricas_chave.turma_com_mais_alunos.quantidade} alunos)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <SectionTitle>Distribuição e Insights por Turma</SectionTitle>
                    {/* Distribuição de Alunos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição de Alunos por Turma</CardTitle>
                            <CardDescription>Análise visual do número de alunos em cada turma e insights individuais.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="nome"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value: string) => (value.length > 10 ? value.slice(0, 10) + '...' : value)}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                        <p className="font-bold">{label}</p>
                                                        <p className="text-sm text-primary">Alunos: {payload[0].value}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area dataKey="alunos" type="step" fill="var(--color-fill)" stroke="var(--color-stroke)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* NOVO: Lista de Insights separada para melhor leitura */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Insights Individuais por Turma</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {chartData.map((turma) => (
                                    <div key={turma.nome} className="rounded-md border p-3">
                                        <p className="font-semibold text-foreground">{turma.nome}</p>
                                        <p className="text-sm text-muted-foreground">{turma.insight}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DashboardIaSection;
