<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\AnaliseAluno;
use App\Models\Periodo;
use App\Models\Turma;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // ADICIONADO: Para aceder ao utilizador autenticado
use Illuminate\Validation\Rule; // ADICIONADO: Para regras de validação avançadas
use Inertia\Inertia;

class AlunoController extends Controller
{
    public function index()
    {
        // MODIFICADO: Agora busca apenas os alunos que pertencem às turmas do utilizador logado.
        $alunos = Aluno::whereHas('turma', function ($query) {
            $query->where('user_id', Auth::id());
        })->with('turma')->latest()->get();

        return Inertia::render('Alunos/Index', [
            'alunos' => $alunos,
        ]);
    }

    public function show(Request $request, Aluno $aluno)
    {
        // ADICIONADO: Verificação de autorização. Aborta se o aluno não pertencer a uma turma do utilizador.
        abort_if($aluno->turma->user_id !== Auth::id(), 403, 'Acesso não autorizado.');

        $analiseSalva = AnaliseAluno::where('aluno_id', $aluno->id)->first();

        // A lógica para buscar ou gerar a análise continua a mesma
        return Inertia::render('Alunos/Show', [
            'aluno' => $aluno->loadMissing('turma', 'relatorios.periodo', 'avaliacoes.materia', 'avaliacoes.periodo'),
            'periodos' => Periodo::all(), // Supondo que os períodos são globais
            'analise_aluno' => $analiseSalva?->dados_analise_json,
            'error_analise' => session('error_analise'), // Adicionado para consistência
        ]);
    }

    public function create()
    {
        return Inertia::render('Alunos/Create', [
            // MODIFICADO: Passa apenas as turmas do utilizador logado para o formulário.
            'turmas' => Auth::user()->turmas()->get(),
        ]);
    }

    public function edit(Aluno $aluno)
    {
        // ADICIONADO: Verificação de autorização para aceder à página de edição.
        abort_if($aluno->turma->user_id !== Auth::id(), 403, 'Acesso não autorizado.');

        return Inertia::render('Alunos/Edit', [
            'aluno' => $aluno,
            // MODIFICADO: Passa apenas as turmas do utilizador logado para o formulário.
            'turmas' => Auth::user()->turmas()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validador = $request->validate([
            'nome' => 'required|string|max:255',
            // MODIFICADO: A validação agora garante que a turma_id exista E pertença ao utilizador logado.
            'turma_id' => [
                'required',
                Rule::exists('turmas', 'id')->where('user_id', Auth::id()),
            ],
        ]);

        Aluno::create($validador);

        return back()->with('success', 'Aluno criado com sucesso!');
    }

    public function update(Request $request, Aluno $aluno)
    {
        // ADICIONADO: Verificação de autorização antes de qualquer ação.
        abort_if($aluno->turma->user_id !== Auth::id(), 403, 'Acesso não autorizado.');

        $validador = $request->validate([
            'nome' => 'required|string|max:255',
            // MODIFICADO: A validação também se aplica aqui, para o caso de mover o aluno de turma.
            'turma_id' => [
                'required',
                Rule::exists('turmas', 'id')->where('user_id', Auth::id()),
            ],
        ]);

        $aluno->update($validador);

        return back()->with('success', 'Aluno atualizado com sucesso!');
    }

    public function destroy(Aluno $aluno)
    {
        // ADICIONADO: Verificação de autorização antes de deletar.
        abort_if($aluno->turma->user_id !== Auth::id(), 403, 'Acesso não autorizado.');

        $aluno->delete();

        return back()->with('success', 'Aluno deletado com sucesso!');
    }
}
