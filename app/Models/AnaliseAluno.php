<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnaliseAluno extends Model
{
    protected $fillable = ['dados_analise_json', 'dados_originais', 'aluno_id', 'user_id'];

    protected $casts = [
        'dados_analise_json' => 'array',
        'dados_originais' => 'array',
    ];

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
