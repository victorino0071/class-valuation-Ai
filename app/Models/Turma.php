<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Turma extends Model
{
    protected $fillable = ['nome', 'turma_resumo', 'user_id'];

    public function alunos(): HasMany
    {
        return $this->hasMany(Aluno::class);
    }

    public function turmaResumo(): HasOne // O nome da função deve ser turma_resumo
    {
        // A chave estrangeira 'turma_id' é a chave na tabela 'turma_resumos'
        return $this->hasOne(TurmaResumo::class, 'turma_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
