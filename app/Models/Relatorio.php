<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Relatorio extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'aluno_id',
        'texto',
        'bimestre',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'bimestre' => 'integer',
    ];

    /**
     * Define a relação de que um relatório pertence a um aluno.
     */
    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }
}
