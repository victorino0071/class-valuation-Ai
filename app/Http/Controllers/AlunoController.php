<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Periodo;
use App\Models\Turma;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlunoController extends Controller
{
    // O método index() continua o mesmo
    public function index()
    {
        return Inertia::render('Alunos/Index', [
            'alunos' => Aluno::with('turma')->latest()->get(),
        ]);
    }

    /**
     * Exibe a lista de relatórios de um aluno específico.
     */
    public function show(Aluno $aluno)
    {
        return Inertia::render('Alunos/Show', [
            'aluno' => $aluno->load('turma', 'relatorios', 'avaliacoes.materia'),
            'periodos' => Periodo::all(), // Passa os períodos para a view
        ]);
    }

    // Os métodos create() e edit() não são mais necessários se você usa apenas modais.
    // Pode mantê-los se tiver páginas dedicadas para isso também.
    public function create()
    {
        return Inertia::render('Alunos/Create', [
            'turmas' => Turma::all(),
        ]);
    }

    public function edit(Aluno $aluno)
    {
        return Inertia::render('Alunos/Edit', [
            'aluno' => $aluno,
            'turmas' => Turma::all(),
        ]);
    }

    /**
     * Salva um novo aluno no banco de dados.
     */
    public function store(Request $request)
    {
        $validador = $request->validate([
            'nome' => 'required|string|max:255',
            'turma_id' => 'required|exists:turmas,id',
        ]);

        Aluno::create($validador);

        // MUDANÇA: Em vez de redirecionar para o index,
        // redirecionamos de volta para a página anterior (ex: detalhes da turma).
        return back()->with('success', 'Aluno criado com sucesso!');
    }

    /**
     * Atualiza um aluno específico.
     */
    public function update(Request $request, Aluno $aluno)
    {
        $validador = $request->validate([
            'nome' => 'required|string|max:255',
            'turma_id' => 'required|exists:turmas,id',
        ]);

        $aluno->update($validador);

        // MUDANÇA: Redirecionar de volta para a página anterior.
        return back()->with('success', 'Aluno atualizado com sucesso!');
    }

    /**
     * Remove um aluno do banco de dados.
     */
    public function destroy(Aluno $aluno)
    {
        $aluno->delete();

        // MUDANÇA: Redirecionar de volta para a página anterior.
        return back()->with('success', 'Aluno deletado com sucesso!');
    }
}
