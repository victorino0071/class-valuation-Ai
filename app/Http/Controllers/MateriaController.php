<?php

namespace App\Http\Controllers;

use App\Models\Materia; // 1. Use o model Materia
use Illuminate\Http\Request;
use Inertia\Inertia;

class MateriaController extends Controller
{
    /**
     * Exibe a lista de matérias.
     */
    public function index()
    {
        // 2. Renderiza o componente Vue para Matérias
        return Inertia::render('Materias/Index', [
            'materias' => Materia::all(), // 3. Busca todas as matérias
        ]);
    }

    /**
     * Exibe o formulário de criação de matéria.
     */
    public function create()
    {
        return Inertia::render('Materias/Create');
    }

    /**
     * Salva uma nova matéria no banco de dados.
     */
    public function store(Request $request)
    {
        // 4. Valida apenas o campo 'nome', conforme a migration
        $validador = $request->validate([
            'nome' => 'required|string|unique:materias|max:255',
        ]);

        Materia::create($validador);

        // 5. Redireciona para a rota de matérias com a mensagem de sucesso
        return redirect()->route('materias.index')->with('success', 'Matéria criada com sucesso!');
    }

    /**
     * Exibe o formulário de edição da matéria.
     */
    public function edit(Materia $materia) // 6. Usa Route Model Binding para Materia
    {
        return Inertia::render('Materias/Edit', [
            'materia' => $materia,
        ]);
    }

    /**
     * Atualiza uma matéria específica.
     */
    public function update(Request $request, Materia $materia)
    {
        // 7. Valida o campo 'nome', ignorando o registro atual na regra 'unique'
        $validador = $request->validate([
            'nome' => 'required|string|max:255|unique:materias,nome,'.$materia->id,
        ]);

        $materia->update($validador);

        return redirect()->route('materias.index')->with('success', 'Matéria atualizada com sucesso!');
    }

    /**
     * Remove uma matéria do banco de dados.
     */
    public function destroy(Materia $materia)
    {
        $materia->delete();

        return redirect()->route('materias.index')->with('success', 'Matéria deletada com sucesso!');
    }
}
