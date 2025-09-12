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
     * Salva um novo relatório no banco de dados.
     */
    public function store(Request $request)
    {
        // 4. Valide todos os campos
        $validador = $request->validate([
            'aluno_id' => 'required|exists:alunos,id',
            'texto' => 'required|string',
            'periodo_id' => 'required|exists:periodos,id',
        ]);

        Relatorio::create($validador);

        return back()->with('success', 'Relatório criado com sucesso!');
    }

    /**
     * Atualiza um relatório específico.
     */
    public function update(Request $request, Relatorio $relatorio)
    {
        $validador = $request->validate([
            'aluno_id' => 'required|exists:alunos,id',
            'texto' => 'required|string',
            'periodo_id' => 'required|exists:periodos,id',
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
