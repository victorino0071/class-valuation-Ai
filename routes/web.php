<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\AvaliacaoController;
use App\Http\Controllers\RelatorioController;
use App\Http\Controllers\TurmaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::resource('turmas', TurmaController::class);
Route::resource('alunos', AlunoController::class);
Route::resource('avaliacoes', AvaliacaoController::class)->parameters(['avaliacoes' => 'avaliacao']);
Route::resource('relatorios', RelatorioController::class);

Route::delete('/avaliacoes-em-massa', [AvaliacaoController::class, 'destroyBulk'])->name('avaliacoes.destroyBulk');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
