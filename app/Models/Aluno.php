<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aluno extends Model
{
    protected $fillable = ['nome', 'turma_id'];

    public function turma()
    {
        return $this->belongsTo(Turma::class);
    }

    public function avaliacoes()
    {
        return $this->hasMany(Avaliacao::class);
    }

    public function relatorios()
    {
        return $this->hasMany(Relatorio::class);
    }
}
