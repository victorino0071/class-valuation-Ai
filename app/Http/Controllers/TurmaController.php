<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use App\Models\Turma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TurmaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Turmas/Index', [
            'turmas' => Turma::all(),
        ]);
    }

    public function show(Turma $turma)
    {
        $turma->load('alunos');
        $avaliacoesDaTurma = DB::table('avaliacoes')
            ->select('avaliacoes.materia_id', 'materias.nome as materia_nome', 'avaliacoes.data_avaliacao')
            ->join('materias', 'avaliacoes.materia_id', '=', 'materias.id')
            ->where('avaliacoes.turma_id', $turma->id)
            ->distinct() // Garante que cada combinação de matéria/data apareça apenas uma vez
            ->orderBy('avaliacoes.data_avaliacao', 'desc') // Ordena pelas mais recentes primeiro
            ->get();

        return Inertia::render('Turmas/Show', [
            'turma' => $turma,
            'materias' => Materia::all(),
            'avaliacoesDaTurma' => $avaliacoesDaTurma,
            'periodos' => DB::table('periodos')->get(), // Adiciona os períodos aqui
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validador = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
        ]);

        Turma::create($validador);

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
        $turma->delete();

        return redirect()->route('turmas.index')->with('success', 'Turma deletada com sucesso!');
    }
}
