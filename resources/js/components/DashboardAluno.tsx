// Em: resourcesjs/components/DashboardAluno.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnaliseAluno } from '@/types';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, CheckCircle, GraduationCap, Lightbulb, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { SVGProps, useState } from 'react';
import { route } from 'ziggy-js';
import DashboardHeader from './shared/DashboardHeader';
import EmptyStateCard from './shared/EmptyStateCard';
import ErrorStateCard from './shared/ErrorStateCard';
import SectionTitle from './shared/SectionTitle';

interface DashboardAlunoProps {
    analiseAluno: AnaliseAluno | null;
    error?: string | null;
    alunoId: number;
    alunoNome: string;
}

interface StatCardProps {
    title: string;
    value: number | string;
    colorClass?: string;
    icon: React.ComponentType<SVGProps<SVGSVGElement>>;
}

// Sub-componente StatCard (sem alterações)
const StatCard = ({ title, value, icon: Icon, colorClass = 'text-primary' }: StatCardProps) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

// Componente Principal
export default function DashboardAluno({ analiseAluno, error, alunoId, alunoNome }: DashboardAlunoProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Lógica simplificada para gerar a análise holística
    const handleGenerateAnalysis = () => {
        setIsLoading(true);
        router.post(
            route('ia.aluno.regenerate', { aluno: alunoId }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    if (error && !analiseAluno) {
        return <ErrorStateCard message={error} details="Verifique se o aluno possui avaliações e tente novamente." />;
    }

    if (!analiseAluno) {
        return (
            <EmptyStateCard
                title={`Análise do ${alunoNome}`}
                message="Nenhuma análise foi gerada para este aluno ainda."
                buttonLabel="Gerar Análise"
                onButtonClick={() => handleGenerateAnalysis()}
                isLoading={isLoading}
            />
        );
    }

    const { estatisticas, insights } = analiseAluno;
    const { estatisticas_gerais, evolucao_bimestral } = estatisticas;

    return (
        <AnimatePresence>
            <motion.div
                key="dashboard-aluno"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
            >
                {/* ============================================================
                  == CORREÇÃO APLICADA AQUI ==
                  ============================================================
                  Em vez de passar um <Button> como filho, agora passamos as 
                  propriedades que o DashboardHeader espera para criar o botão internamente.
                */}
                <DashboardHeader
                    title="Dashboard do Aluno"
                    description={`Análise de desempenho individual gerada por IA para ${estatisticas.nome_aluno}.`}
                    buttonLabel="Gerar Nova Análise"
                    onButtonClick={handleGenerateAnalysis}
                    isLoading={isLoading}
                />

                <SectionTitle>Visão Geral</SectionTitle>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Média Geral" value={Number(estatisticas_gerais.media_geral).toFixed(2)} icon={GraduationCap} />
                    <StatCard
                        title="Melhor Matéria"
                        value={estatisticas_gerais.melhor_materia ?? 'N/A'}
                        icon={TrendingUp}
                        colorClass="text-green-500"
                    />
                    <StatCard
                        title="Ponto de Atenção"
                        value={estatisticas_gerais.pior_materia ?? 'N/A'}
                        icon={TrendingDown}
                        colorClass="text-red-500"
                    />
                    <StatCard title="Total de Avaliações" value={estatisticas_gerais.total_avaliacoes} icon={CheckCircle} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <BrainCircuit className="h-6 w-6 text-primary" />
                                <CardTitle>Resumo Pedagógico (Análise IA)</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">{insights.resumo_geral}</p>
                            <h4 className="font-semibold">Análise dos Relatórios</h4>
                            <p className="text-sm text-muted-foreground">{insights.analise_relatorios}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Evolução de Médias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {evolucao_bimestral.map((ev, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{ev.periodo}</span>
                                        <span className="font-bold">{ev.media.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground italic">{insights.analise_evolucao}</p>
                        </CardContent>
                    </Card>
                </div>

                <SectionTitle>Sugestões e Observações</SectionTitle>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Lightbulb className="h-6 w-6 text-green-500" />
                                <CardTitle>Pontos Fortes</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {insights.pontos_fortes.map((p, i) => (
                                    <li key={i} className="flex items-start text-sm">
                                        <CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                                        <span className="text-muted-foreground">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Target className="h-6 w-6 text-amber-500" />
                                <CardTitle>Pontos a Melhorar</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {insights.pontos_a_melhorar.map((p, i) => (
                                    <li key={i} className="flex items-start text-sm">
                                        <ArrowRight className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-amber-500" />
                                        <span className="text-muted-foreground">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
