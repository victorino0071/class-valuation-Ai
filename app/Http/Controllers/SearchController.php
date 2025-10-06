<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\Turma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    /**
     * Realiza uma busca por alunos e turmas do utilizador autenticado.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        // 1. Valida se o termo de busca foi enviado
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $query = $request->input('query');

        // 2. Busca por TURMAS que pertencem ao utilizador logado
        $turmas = Turma::where('user_id', Auth::id())
            ->where('nome', 'LIKE', "%{$query}%")
            ->limit(5) // Limita a 5 resultados para performance
            ->get(['id', 'nome']); // Seleciona apenas os campos necessários

        // 3. Busca por ALUNOS que pertencem às turmas do utilizador logado
        $alunos = Aluno::whereHas('turma', function ($q) {
            $q->where('user_id', Auth::id());
        })
            ->where('nome', 'LIKE', "%{$query}%")
            ->with('turma:id,nome') // Carrega o nome da turma para dar contexto
            ->limit(5) // Limita a 5 resultados
            ->get(['id', 'nome', 'turma_id']); // Seleciona apenas os campos necessários

        // 4. Retorna os resultados como uma resposta JSON
        return response()->json([
            'turmas' => $turmas,
            'alunos' => $alunos,
        ]);
    }
}
