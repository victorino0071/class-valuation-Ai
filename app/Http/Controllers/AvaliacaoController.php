<?php

namespace App\Http\Controllers;

use App\Models\Avaliacao;
use App\Models\Periodo;
use App\Models\Turma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AvaliacaoController extends Controller
{
    /**
     * Armazena um novo conjunto de avaliações no banco de dados.
     * Cria uma avaliação para cada aluno da turma especificada.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function index()
    {
        $avaliacoes = Avaliacao::with(['aluno', 'materia', 'turma'])
            ->latest('data_avaliacao') // Ordena pela data mais recente primeiro
            ->get();

        return Inertia::render('Avaliacoes/Index', [
            'avaliacoes' => $avaliacoes,
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validação CORRIGIDA: removemos a exigência do 'periodo_id'
        $dadosValidados = $request->validate([
            'turma_id' => 'required|exists:turmas,id',
            'materia_id' => 'required|exists:materias,id',
            'data_avaliacao' => 'required|date',
            // 'periodo_id' => 'required|exists:periodos,id', // REMOVIDO
        ]);

        $dataAvaliacao = $dadosValidados['data_avaliacao'];
        $periodo = Periodo::where('data_inicio', '<=', $dataAvaliacao)
            ->where('data_fim', '>=', $dataAvaliacao)
            ->first();

        if (! $periodo) {
            return back()->with('error', 'Não foi encontrado um período cadastrado para a data selecionada.');
        }

        $turma = Turma::with('alunos')->findOrFail($dadosValidados['turma_id']);

        if ($turma->alunos->isEmpty()) {
            return back()->with('error', 'Esta turma não possui alunos cadastrados.');
        }

        // 2. Transação CORRIGIDA: adicionamos a variável '$periodo' ao 'use'
        DB::transaction(function () use ($turma, $dadosValidados, $periodo) { // CORRIGIDO
            foreach ($turma->alunos as $aluno) {
                Avaliacao::create([
                    'aluno_id' => $aluno->id,
                    'turma_id' => $dadosValidados['turma_id'],
                    'materia_id' => $dadosValidados['materia_id'],
                    'data_avaliacao' => $dadosValidados['data_avaliacao'],
                    'periodo_id' => $periodo->id, // Agora a variável $periodo existe aqui
                    'nota' => 0,
                ]);
            }
        });

        return redirect()->route('turmas.show', $dadosValidados['turma_id'])
            ->with('success', 'Avaliações criadas com sucesso para todos os alunos da turma!');
    }

    /**
     * Atualiza uma avaliação específica no banco de dados.
     * Este método será usado na página do aluno para modificar a nota.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Avaliacao $avaliacao)
    {
        // 1. Pegamos o ID que vem na URL (ex: /avaliacoes/123 -> pega o 123)
        $dadosValidados = $request->validate([
            'nota' => 'required|numeric|min:0|max:100',
        ]);

        $avaliacao->update($dadosValidados);

        // Redireciona de volta para a página do aluno com uma mensagem de sucesso.
        return back()->with('success', 'Nota atualizada com sucesso!');
    }

    public function destroyBulk(Request $request)
    {
        // 1. Validação dos filtros recebidos do formulário
        $dadosValidados = $request->validate([
            'turma_id' => 'required|exists:turmas,id',
            'materia_id' => 'required|exists:materias,id',
            'data_avaliacao' => 'required|date',
        ]);

        // 2. Execução da exclusão em massa
        // Apaga todos os registos de 'avaliacoes' que correspondem
        // exatamente à turma, matéria e data fornecidas.
        Avaliacao::where('turma_id', $dadosValidados['turma_id'])
            ->where('materia_id', $dadosValidados['materia_id'])
            ->whereDate('data_avaliacao', $dadosValidados['data_avaliacao']) // whereDate compara apenas a data, ignorando a hora.
            ->delete();

        // 3. Redireciona de volta com uma mensagem de sucesso
        return back()->with('success', 'O conjunto de avaliações foi removido com sucesso para todos os alunos!');
    }

    /**
     * Remove uma avaliação específica do banco de dados.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Avaliacao $avaliacao)
    {
        $alunoId = $avaliacao->aluno_id;
        $avaliacao->delete();

        // Redireciona de volta para a página do aluno ou para o index de avaliações.
        return back()->with('success', 'Avaliação removida com sucesso!');
    }
}
