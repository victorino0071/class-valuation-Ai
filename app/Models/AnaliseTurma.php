<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnaliseTurma extends Model
{
    protected $table = 'analises_turmas';

    protected $fillable = ['dados_analise_json', 'dados_originais', 'user_id'];

    protected $casts = [
        'dados_analise_json' => 'array',
        'dados_originais' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
