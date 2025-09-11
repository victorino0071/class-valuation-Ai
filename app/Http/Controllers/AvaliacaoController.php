<?php

namespace App\Http\Controllers;

use App\Models\Avaliacao;
use App\Models\Materia;
use App\Models\Turma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AvaliacaoController extends Controller
{
    /**
     * Exibe uma lista de todas as avaliações.
     */
    public function index(): Response
    {
        // Carrega as avaliações com seus respectivos relacionamentos para evitar o problema N+1
        $avaliacoes = Avaliacao::with(['aluno', 'materia', 'turma'])->latest()->get();

        return Inertia::render('Avaliacoes/Index', [
            'avaliacoes' => $avaliacoes,
        ]);
    }

    /**
     * Mostra o formulário para criar um novo conjunto de avaliações para uma turma.
     * A Turma é recebida via route-model binding.
     */
    public function create(Turma $turma): Response
    {
        // Para o formulário, precisamos da turma e de uma lista de matérias disponíveis.
        return Inertia::render('Avaliacoes/Create', [
            'turma' => $turma,
            'materias' => Materia::all(),
        ]);
    }

    /**
     * Armazena um novo conjunto de avaliações no banco de dados.
     * Cria uma avaliação para cada aluno da turma especificada.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // 1. Validação dos dados recebidos do formulário
        $dadosValidados = $request->validate([
            'turma_id' => 'required|exists:turmas,id',
            'materia_id' => 'required|exists:materias,id',
            'data_avaliacao' => 'required|date',
        ]);

        // 2. Busca a turma e seus alunos
        $turma = Turma::with('alunos')->findOrFail($dadosValidados['turma_id']);

        if ($turma->alunos->isEmpty()) {
            return back()->with('error', 'Esta turma não possui alunos cadastrados.');
        }

        // 3. Usa uma transação para garantir a integridade dos dados
        // Se uma inserção falhar, todas serão revertidas.
        DB::transaction(function () use ($turma, $dadosValidados) {
            // 4. Itera sobre cada aluno da turma
            foreach ($turma->alunos as $aluno) {
                // 5. Cria uma avaliação para o aluno
                Avaliacao::create([
                    'aluno_id' => $aluno->id,
                    'turma_id' => $dadosValidados['turma_id'],
                    'materia_id' => $dadosValidados['materia_id'],
                    'data_avaliacao' => $dadosValidados['data_avaliacao'],
                    'nota' => 0,
                ]);
            }
        });

        // 6. Redireciona de volta para a página da turma com uma mensagem de sucesso
        return redirect()->route('turmas.show', $dadosValidados['turma_id'])
            ->with('success', 'Avaliações criadas com sucesso para todos os alunos da turma!');
    }

    /**
     * Mostra o formulário para editar uma avaliação específica.
     */
    public function edit(Avaliacao $avaliacao): Response
    {
        // Carrega os relacionamentos para exibir mais detalhes na página de edição
        $avaliacao->load(['aluno', 'materia', 'turma']);

        return Inertia::render('Avaliacoes/Edit', [
            'avaliacao' => $avaliacao,
        ]);
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
