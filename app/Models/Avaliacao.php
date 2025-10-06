<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avaliacao extends Model
{
    protected $table = 'avaliacoes';

    protected $fillable = ['nota', 'data_avaliacao', 'aluno_id', 'materia_id', 'turma_id', 'periodo_id'];

    public function aluno()
    {
        return $this->belongsTo(Aluno::class);
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }

    public function turma()
    {
        return $this->belongsTo(Turma::class);
    }

    public function periodo()
    {
        return $this->belongsTo(Periodo::class);
    }
}
