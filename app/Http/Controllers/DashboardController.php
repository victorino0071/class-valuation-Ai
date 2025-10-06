<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\AnaliseAluno;
use App\Models\AnaliseTurma;
use App\Models\Periodo;
use App\Models\Turma;
use App\Models\TurmaResumo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Exibe o dashboard principal e carrega dados analíticos com base nos parâmetros da requisição.
     *
     * Este método atua como um hub central de dados para o frontend. Ele sempre fornece
     * as listas completas (turmas, alunos, períodos) para os seletores. Adicionalmente,
     * ele verifica se um 'turma_id' ou 'aluno_id' foi passado na URL para carregar
     * a análise específica correspondente.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // ETAPA 1: CARREGAR DADOS BASE (SEMPRE NECESSÁRIOS PARA A PÁGINA)

        // Listas completas para preencher os menus dropdown no frontend.
        $turmas = Turma::orderBy('nome')->get();
        $alunos = Aluno::orderBy('nome')->get();
        $periodos = Periodo::orderBy('data_inicio')->get();

        // Análise geral de IA (para a primeira aba, "Visão Geral").
        $ia_analysis = AnaliseTurma::latest()->first()?->dados_analise_json;

        // ETAPA 2: INICIALIZAR VARIÁVEIS PARA DADOS CONDICIONAIS
        $analiseTurma = null;
        $analiseAluno = null;
        $activeTurmaId = null;
        $activeAlunoId = null;
        $activePeriodoId = null;

        // ETAPA 3: PROCESSAR A REQUISIÇÃO E CARREGAR DADOS ESPECÍFICOS

        // Caso 1: O frontend está a solicitar a análise de uma TURMA específica.
        if ($request->has('turma_id')) {
            $activeTurmaId = (int) $request->input('turma_id');

            // Pega o ID do período da URL ou usa o mais recente como padrão.
            $activePeriodoId = (int) $request->input('periodo_id', Periodo::latest()->first()?->id);

            // Busca a análise salva para esta combinação de turma e período.
            $resumoTurma = TurmaResumo::where('turma_id', $activeTurmaId)
                ->where('periodo_id', $activePeriodoId)
                ->first();

            $analiseTurma = $resumoTurma?->dados_analise_json;
        }
        // Caso 2: O frontend está a solicitar a análise de um ALUNO específico.
        elseif ($request->has('aluno_id')) {
            $activeAlunoId = (int) $request->input('aluno_id');

            // Busca a análise salva para este aluno.
            $resumoAluno = AnaliseAluno::where('aluno_id', $activeAlunoId)->first();
            $analiseAluno = $resumoAluno?->dados_analise_json;
        }

        // ETAPA 4: RENDERIZAR A VIEW COM TODOS OS DADOS COMPILADOS
        return Inertia::render('Dashboard', [
            // Dados base
            'turmas' => $turmas,
            'alunos' => $alunos,
            'periodos' => $periodos,
            'ia_analysis' => $ia_analysis,

            // Dados condicionais (podem ser null)
            'analiseTurma' => $analiseTurma,
            'analiseAluno' => $analiseAluno,

            // IDs ativos para manter o estado dos seletores no frontend
            'activeTurmaId' => $activeTurmaId,
            'activeAlunoId' => $activeAlunoId,
            'activePeriodoId' => $activePeriodoId,
        ]);
    }
}
