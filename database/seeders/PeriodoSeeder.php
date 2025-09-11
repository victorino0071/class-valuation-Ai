<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // Importe a classe DB

class PeriodoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpa a tabela antes de inserir novos dados para evitar duplicatas
        DB::table('periodos')->truncate();

        // Obtém o ano atual para tornar os nomes dinâmicos
        $anoAtual = date('Y');

        // Insere os quatro bimestres na tabela 'periodos'
        DB::table('periodos')->insert([
            [
                'nome' => '1º Bimestre - '.$anoAtual,
                'data_inicio' => $anoAtual.'-02-01',
                'data_fim' => $anoAtual.'-04-30',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => '2º Bimestre - '.$anoAtual,
                'data_inicio' => $anoAtual.'-05-01',
                'data_fim' => $anoAtual.'-07-31',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => '3º Bimestre - '.$anoAtual,
                'data_inicio' => $anoAtual.'-08-01',
                'data_fim' => $anoAtual.'-10-15',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nome' => '4º Bimestre - '.$anoAtual,
                'data_inicio' => $anoAtual.'-10-16',
                'data_fim' => $anoAtual.'-12-20',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
