<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TurmaResumo extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'turma_resumos';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'dados_analise_json',
        'dados_originais',
        'turma_id',
        'periodo_id',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'dados_analise_json' => 'array',
        'dados_originais' => 'array',
    ];

    /**
     * Define a relação "pertence a" com o model Turma.
     * Cada resumo pertence a uma turma.
     */
    public function turma(): BelongsTo
    {
        return $this->belongsTo(Turma::class);
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
