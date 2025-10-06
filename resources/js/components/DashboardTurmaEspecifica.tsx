import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnaliseTurma, Periodo } from '@/types'; // <-- Adicionado 'periodo'
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, BrainCircuit, ClipboardCheck, GraduationCap, Lightbulb, TrendingDown, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from 'recharts';
import { route } from 'ziggy-js';
import DashboardHeader from './shared/DashboardHeader';
import EmptyStateCard from './shared/EmptyStateCard';
import ErrorStateCard from './shared/ErrorStateCard';
import SectionTitle from './shared/SectionTitle';

// <-- ATUALIZADO: Interface de propriedades agora inclui os períodos -->
interface DashboardTurmaEspecificaProps {
    analiseTurma: AnaliseTurma | null;
    error?: string;
    turmaId: number | string;
    periodos: Periodo[];
    activePeriodoId?: number;
}

// ===================================================================
// Componentes de Gráfico e Cards (Sem alterações)
// ===================================================================
const GraficoDesempenhoAlunos = ({ data }: { data: AnaliseTurma['estatisticas_gerais'] }) => {
    const chartData = [
        { status: 'Aprovados', total: data.aprovados_geral, fill: 'var(--color-aprovados)' },
        { status: 'Reprovados', total: data.reprovados_geral, fill: 'var(--color-reprovados)' },
    ];
    const chartConfig = {
        total: { label: 'Alunos' },
        aprovados: { label: 'Aprovados', color: 'hsl(142.1 76.2% 36.3%)' },
        reprovados: { label: 'Reprovados', color: 'hsl(0 84.2% 60.2%)' },
    } satisfies ChartConfig;

    return (
        <Card className="flex h-full flex-col">
            <CardHeader>
                <CardTitle>Desempenho Geral</CardTitle>
                <CardDescription>Aprovados vs. Reprovados</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="total" nameKey="status" innerRadius={60} strokeWidth={5} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex w-full items-center justify-center gap-4 leading-none font-medium">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-aprovados)]" /> Aprovados
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-reprovados)]" /> Reprovados
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

const GraficoDesempenhoMaterias = ({ data }: { data: AnaliseTurma['materias'] }) => {
    const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
    const coloredData = data.map((item, index) => ({ ...item, fill: chartColors[index % chartColors.length] }));
    const chartConfig: ChartConfig = { media: { label: 'Média', color: 'hsl(var(--chart-1))' } };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Média por Matéria</CardTitle>
                <CardDescription>Comparativo de desempenho nas matérias</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={coloredData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="materia" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="media" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

type AlunoDestaque = AnaliseTurma['alunos_destaque']['melhor_aluno'] | AnaliseTurma['alunos_destaque']['aluno_com_dificuldade'];
const AlunosDestaqueCard = ({ tipo, aluno }: { tipo: 'destaque' | 'dificuldade'; aluno: AlunoDestaque }) => {
    const isDestaque = tipo === 'destaque';
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    {isDestaque ? <Award className="h-6 w-6 text-yellow-500" /> : <TrendingDown className="h-6 w-6 text-red-500" />}
                    <CardTitle>{isDestaque ? 'Aluno em Destaque' : 'Aluno com Dificuldade'}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-lg font-semibold">{aluno.nome}</p>
                <p className="text-sm text-muted-foreground">
                    Média Geral: <span className="font-bold text-foreground">{aluno.media.toFixed(2)}</span>
                </p>
            </CardContent>
        </Card>
    );
};

const AnalisePorMateria = ({ materia }: { materia: AnaliseTurma['materias'][0] }) => (
    <div className="space-y-6 rounded-lg border p-4">
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Insight da IA</h4>
            </div>
            <p className="text-sm text-muted-foreground">{materia.insight}</p>
        </div>
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Sugestão Pedagógica</h4>
            </div>
            <p className="text-sm text-muted-foreground">{materia.sugestao_pedagogica}</p>
        </div>
    </div>
);

// ===================================================================
// Componente Principal (Atualizado com lógica de bimestres)
// ===================================================================
const DashboardTurmaEspecifica = ({ analiseTurma, error, turmaId, periodos, activePeriodoId }: DashboardTurmaEspecificaProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // Envia a requisição para gerar a análise para um bimestre específico
    const handleGenerateAnalysis = (periodoId: number) => {
        setIsLoading(true);
        router.post(
            route('ia.turma.regenerate', { turma: turmaId }),
            { periodo_id: periodoId }, // Envia o ID do período
            { preserveScroll: true, onFinish: () => setIsLoading(false) },
        );
    };

    // Navega para a mesma página, mas com o ID do bimestre selecionado na URL
    const handlePeriodoChange = (periodoId: string) => {
        router.get(
            route('turmas.show', turmaId),
            { periodo_id: periodoId }, // Passa o novo periodo_id como parâmetro de URL
            { preserveState: true, preserveScroll: true },
        );
    };

    if (error) {
        return (
            <ErrorStateCard
                message={error}
                details="Por favor, verifique se a turma possui alunos e avaliações suficientes. Tente novamente mais tarde."
            />
        );
    }

    if (!periodos || periodos.length === 0) {
        return (
            <EmptyStateCard
                title="Sem Períodos Cadastrados"
                message="Para gerar uma análise, primeiro cadastre os períodos letivos (bimestres)."
                buttonLabel="Cadastrar Períodos"
                onButtonClick={() => router.get(route('periodos.index'))}
            />
        );
    }

    const activePeriodoString = activePeriodoId?.toString();

    return (
        <AnimatePresence>
            <motion.div
                key="dashboard-turma"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
            >
                <DashboardHeader title="Dashboard da Turma" description="Análise gerada por IA com base no desempenho dos alunos." />

                <Tabs value={activePeriodoString} onValueChange={handlePeriodoChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        {periodos.map((p) => (
                            <TabsTrigger key={p.id} value={p.id.toString()}>
                                {p.nome}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="mt-6">
                        {analiseTurma ? (
                            <motion.div key={activePeriodoString} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Análise do {periodos.find((p) => p.id === activePeriodoId)?.nome}</h3>
                                    <Button onClick={() => handleGenerateAnalysis(activePeriodoId!)} disabled={isLoading}>
                                        {isLoading ? 'Gerando...' : 'Gerar Nova Análise'}
                                    </Button>
                                </div>

                                {/* Seção 1: Estatísticas Gerais e Resumo */}
                                <div className="space-y-6">
                                    <SectionTitle>Visão Geral</SectionTitle>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <StatCard title="Total de Alunos" value={analiseTurma.estatisticas_gerais.quantidade_alunos} icon={Users} />
                                        <StatCard
                                            title="Média Geral da Turma"
                                            value={Number(analiseTurma.estatisticas_gerais.media_geral).toFixed(2)}
                                            icon={GraduationCap}
                                        />
                                        <StatCard
                                            title="Total de Avaliações"
                                            value={analiseTurma.estatisticas_gerais.quantidade_avaliacoes}
                                            icon={Users}
                                        />
                                    </div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Resumo Pedagógico (Análise IA)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{analiseTurma.resumo_pedagogico}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Seção 2: Desempenho da Turma */}
                                <div className="space-y-6">
                                    <SectionTitle>Desempenho da Turma</SectionTitle>
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                                        <div className="lg:col-span-3">
                                            <GraficoDesempenhoMaterias data={analiseTurma.materias} />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <GraficoDesempenhoAlunos data={analiseTurma.estatisticas_gerais} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <AlunosDestaqueCard tipo="destaque" aluno={analiseTurma.alunos_destaque.melhor_aluno} />
                                        <AlunosDestaqueCard tipo="dificuldade" aluno={analiseTurma.alunos_destaque.aluno_com_dificuldade} />
                                    </div>
                                </div>

                                {/* Seção 3: Análise Detalhada por Matéria */}
                                <div className="space-y-6">
                                    <SectionTitle>Análise Detalhada por Matéria</SectionTitle>
                                    <Tabs defaultValue={analiseTurma.materias[0]?.materia} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                                            {analiseTurma.materias.map((materia) => (
                                                <TabsTrigger key={materia.materia} value={materia.materia}>
                                                    {materia.materia}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        {analiseTurma.materias.map((materia) => (
                                            <TabsContent key={materia.materia} value={materia.materia} className="mt-4">
                                                <AnalisePorMateria materia={materia} />
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </div>

                                {/* Seção Final: Pontos de Atenção */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <Lightbulb className="h-6 w-6 text-blue-500" />
                                            <CardTitle>Pontos de Atenção e Sugestões Gerais</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                                            {analiseTurma.pontos_de_atencao.map((ponto, index) => (
                                                <li key={index}>{ponto}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <EmptyStateCard
                                title={`Análise do ${periodos.find((p) => p.id === activePeriodoId)?.nome}`}
                                message="Nenhuma análise foi gerada para este bimestre ainda."
                                buttonLabel="Gerar Análise"
                                onButtonClick={() => handleGenerateAnalysis(activePeriodoId!)}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </Tabs>
            </motion.div>
        </AnimatePresence>
    );
};

export default DashboardTurmaEspecifica;
