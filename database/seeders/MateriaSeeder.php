<?php

namespace Database\Seeders;

use App\Models\Materia;
use Illuminate\Database\Seeder;

class MateriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $materias = [
            'Português',
            'Matemática',
            'Ciências',
            'História',
            'Geografia',
            'Artes',
            'Inglês',
            'Educação Física',
        ];

        foreach ($materias as $materia) {
            Materia::create(['nome' => $materia]);
        }
    }
}
