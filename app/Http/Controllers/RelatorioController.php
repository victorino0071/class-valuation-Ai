<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Relatorio;     // 1. Importe o model Aluno
use Illuminate\Http\Request;
use Inertia\Inertia;

class RelatorioController extends Controller
{
    /**
     * Exibe a lista de relatórios.
     */
    public function index()
    {
        // 2. Carregue a relação 'aluno' via Eager Loading
        return Inertia::render('Relatorios/Index', [
            'relatorios' => Relatorio::with('aluno')->latest()->get(),
        ]);
    }

    /**
     * Exibe o formulário de criação de relatório.
     */
    public function create()
    {
        // 3. Envie a lista de alunos para o formulário
        return Inertia::render('Relatorios/Create', [
            'alunos' => Aluno::all(),
        ]);
    }

    /**
     * Salva um novo relatório no banco de dados.
     */
    public function store(Request $request)
    {
        // 4. Valide todos os campos
        $validador = $request->validate([
            'aluno_id' => 'required|exists:alunos,id',
            'texto' => 'required|string',
            'bimestre' => 'required|integer|in:1,2,3,4',
        ]);

        Relatorio::create($validador);

        return back()->with('success', 'Relatório criado com sucesso!');
    }

    /**
     * Exibe o formulário de edição do relatório.
     */
    public function edit(Relatorio $relatorio)
    {
        // 5. Envie o relatório e a lista de alunos para a edição
        return Inertia::render('Relatorios/Edit', [
            'relatorio' => $relatorio,
            'alunos' => Aluno::all(),
        ]);
    }

    /**
     * Atualiza um relatório específico.
     */
    public function update(Request $request, Relatorio $relatorio)
    {
        $validador = $request->validate([
            'aluno_id' => 'required|exists:alunos,id',
            'texto' => 'required|string',
            'bimestre' => 'required|integer|in:1,2,3,4',
        ]);

        $relatorio->update($validador);

        return back()->with('success', 'Relatório atualizado com sucesso!');
    }

    /**
     * Remove um relatório do banco de dados.
     */
    public function destroy(Relatorio $relatorio)
    {
        $relatorio->delete();

        return back()->with('success', 'Relatório deletado com sucesso!');
    }
}
