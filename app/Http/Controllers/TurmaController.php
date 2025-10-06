<?php

namespace App\Http\Controllers;

use App\Models\AnaliseTurma;
use App\Models\Materia;
use App\Models\Periodo;
use App\Models\Turma;
use App\Models\TurmaResumo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TurmaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $latestAnalysis = AnaliseTurma::latest()->first();

        return Inertia::render('Turmas/Index', [
            'turmas' => Turma::all(),
            'ia_analysis' => $latestAnalysis ? $latestAnalysis->dados_analise_json : null,
            'error' => session('error'),
        ]);
    }

    public function show(Request $request, Turma $turma)
    {
        // 1. LÓGICA PARA DETERMINAR O BIMESTRE ATIVO
        // Pega o 'periodo_id' da URL (?periodo_id=X).

        abort_if($turma->user_id !== Auth::id(), 403, 'Acesso não autorizado.');

        $activePeriodoId = $request->input('periodo_id');

        // Se nenhum ID veio da URL (primeiro acesso à página),
        // define o período mais recente como o padrão.
        if (! $activePeriodoId) {
            $latestPeriodo = Periodo::latest()->first();
            $activePeriodoId = $latestPeriodo?->id;
        }

        // 2. BUSCAR A ANÁLISE PARA O BIMESTRE ATIVO
        $analiseTurma = null;
        if ($activePeriodoId) {
            // Busca o resumo da análise específico para esta turma E este bimestre.
            $analiseTurma = TurmaResumo::where('turma_id', $turma->id)
                ->where('periodo_id', $activePeriodoId)
                ->first();
        }

        // 3. BUSCAR DADOS ADICIONAIS (que você já tinha)
        $turma->load('alunos');
        $avaliacoesDaTurma = DB::table('avaliacoes')
            ->select('avaliacoes.materia_id', 'materias.nome as materia_nome', 'avaliacoes.data_avaliacao')
            ->join('materias', 'avaliacoes.materia_id', '=', 'materias.id')
            ->where('avaliacoes.turma_id', $turma->id)
            ->distinct()
            ->orderBy('avaliacoes.data_avaliacao', 'desc')
            ->get();

        // 4. RENDERIZAR A PÁGINA COM AS PROPS CORRETAS
        return Inertia::render('Turmas/Show', [
            // Dados que você já passava
            'turma' => $turma,
            'materias' => Materia::all(),
            'avaliacoesDaTurma' => $avaliacoesDaTurma,

            // Props ATUALIZADAS para a análise por bimestre
            'periodos' => Periodo::orderBy('id', 'asc')->get(), // Busca todos os períodos para as abas
            'analise_turma' => $analiseTurma?->dados_analise_json, // Passa a análise do bimestre ativo
            'active_periodo_id' => (int) $activePeriodoId, // Informa ao frontend qual aba está ativa

            // Props de feedback (erros/sucesso) que vêm do redirect
            'error_analise' => session('error_analise'),
            'ia_success' => session('ia_success'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $dadosValidados = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
        ]);

        $request->user()->turmas()->create($dadosValidados);

        return redirect()->route('turmas.index')->with('success', 'Turma criada com sucesso!');
    }

    public function edit(Turma $turma)
    {
        return Inertia::render('Turmas/Edit', [
            'turma' => $turma,
        ]);
    }

    public function update(Request $request, Turma $turma)
    {
        abort_if($turma->user_id !== Auth::id(), 403, 'Acesso não autorizado.');
        $validador = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
        ]);
        $turma->update($validador);

        return redirect()->route('turmas.index')->with('success', 'Turma atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Turma $turma)
    {
        abort_if($turma->user_id !== Auth::id(), 403, 'Acesso não autorizado.');
        $turma->delete();

        return redirect()->route('turmas.index')->with('success', 'Turma deletada com sucesso!');
    }
}
