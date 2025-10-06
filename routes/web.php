<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\AvaliacaoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IaServiceController;
use App\Http\Controllers\RelatorioController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TurmaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Rota de login/boas-vindas (pública)
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// CORRIGIDO: Todas as rotas que precisam de login agora estão aqui dentro
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Movendo os resources para dentro do grupo protegido
    Route::resource('turmas', TurmaController::class);
    Route::resource('alunos', AlunoController::class);
    Route::resource('avaliacoes', AvaliacaoController::class)->parameters(['avaliacoes' => 'avaliacao']);
    Route::resource('relatorios', RelatorioController::class);

    Route::delete('/avaliacoes-em-massa', [AvaliacaoController::class, 'destroyBulk'])->name('avaliacoes.destroyBulk');

    // Rotas de IA
    Route::post('/dashboard-ia-turmas', [IaServiceController::class, 'forceGenerateAnalysis'])->name('ia.regenerate');
    Route::post('/turmas/{turma}/analise-ia', [IaServiceController::class, 'forceGenerateTurmaAnalysis'])->name('ia.turma.regenerate');
    Route::post('/alunos/{aluno}/analise-ia', [IaServiceController::class, 'forceGenerateAlunoAnalysis'])->name('ia.aluno.regenerate');

    Route::get('/avaliacoes', [AvaliacaoController::class, 'index'])->name('avaliacoes.index');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/search', [SearchController::class, 'search'])->middleware(['auth', 'verified'])->name('search');
});

// Rotas de autenticação e configurações (geralmente não precisam de proteção)
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
