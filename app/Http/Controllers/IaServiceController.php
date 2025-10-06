<?php

namespace App\Http\Controllers;

use App\Models\Aluno;
use App\Models\AnaliseAluno;
use App\Models\AnaliseTurma;
use App\Models\Periodo;
use App\Models\Turma;
use App\Models\TurmaResumo; // Adicionado para facilitar o acesso ao Model Turma
use Gemini;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class IaServiceController extends Controller
{
    public function getTurmasData()
    {

        $analiseSalva = AnaliseTurma::where('user_id', Auth::id())->latest()->first();
        if ($analiseSalva) {
            // Renderiza 'Turmas/Index' em vez de 'DashboardIa'.
            // Garante que a prop 'turmas' vem do banco de dados para a tabela principal.
            return Inertia::render('Turmas/Index', [
                'turmas' => Turma::latest()->get(),
                'ia_analysis' => $analiseSalva->dados_analise_json,
                'error' => null, // Explicitamente sem erro.
            ]);
        }

        // Se não houver, gera uma nova análise
        return $this->generateAndStoreAnalysis();
    }

    /**
     * Força a geração de uma nova análise e a salva no banco.
     */
    public function forceGenerateAnalysis()
    {
        // Sempre força a criação de uma nova análise
        return $this->generateAndStoreAnalysis();
    }

    /**
     * Busca dados de turmas de um serviço externo, calcula métricas, gera insights com IA,
     * combina os dados e os salva no banco de dados. Retorna a view com a análise completa.
     *
     * @return \Inertia\Response
     */
    private function generateAndStoreAnalysis()
    {
        try {
            // ETAPA 1: BUSCAR DADOS DO SERVIÇO PYTHON
            $response = Http::timeout(10)->post('http://ia_service:8000/turmas-com-alunos/', ['limit' => 5]);
            if (! $response->successful()) {
                throw new \Exception('Não foi possível buscar os dados das turmas do serviço de IA.');
            }
            $turmasData = $response->json()['data'] ?? [];
            if (empty($turmasData)) {
                throw new \Exception('Nenhuma turma foi retornada pelo serviço de dados.');
            }

            // ETAPA 1.5: ADAPTAR DADOS DE ENTRADA
            $turmasCollection = collect($turmasData)->map(function ($turma) {
                $turma['numero_alunos'] = count($turma['alunos'] ?? []);
                // ADICIONADO: Garantimos que a descrição seja incluída no nosso objeto de trabalho seguro.
                $turma['descricao'] = $turma['descricao'] ?? ''; // Usamos '' como padrão se não existir

                return $turma;
            });

            // ETAPA 2: CALCULAR AS MÉTRICAS EM PHP
            $totalTurmas = $turmasCollection->count();
            $totalAlunos = $turmasCollection->sum('numero_alunos');
            $mediaAlunosPorTurma = $totalTurmas > 0 ? round($totalAlunos / $totalTurmas, 2) : 0;
            $turmaComMaisAlunos = $turmasCollection->sortByDesc('numero_alunos')->first();
            $turmaComMenosAlunos = $turmasCollection->sortBy('numero_alunos')->first();
            $metricasChave = [
                'total_turmas' => $totalTurmas,
                'total_alunos' => $totalAlunos,
                'media_alunos_por_turma' => $mediaAlunosPorTurma,
                'turma_com_mais_alunos' => [
                    'nome' => $turmaComMaisAlunos['nome'] ?? 'N/A',
                    'quantidade' => $turmaComMaisAlunos['numero_alunos'] ?? 0,
                ],
                'turma_com_menos_alunos' => [
                    'nome' => $turmaComMenosAlunos['nome'] ?? 'N/A',
                    'quantidade' => $turmaComMenosAlunos['numero_alunos'] ?? 0,
                ],
            ];

            // ETAPA 3: CRIAR O PROMPT FOCADO PARA A IA
            $turmasJsonString = json_encode($turmasCollection->all(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            // ATUALIZADO: O prompt agora instrui a IA a usar a descrição da turma.
            $prompt = <<<PROMPT
            Com base nos dados das turmas fornecidos abaixo (que incluem um campo 'descricao'), sua tarefa é gerar uma análise textual.
            Sua resposta deve ser **exclusivamente um objeto JSON válido**, sem nenhum texto ou formatação adicional.

            A estrutura do JSON de resposta deve ser a seguinte:
            {
              "resumo_geral": "Uma análise textual curta e objetiva sobre o conjunto de turmas.",
              "analise_individual": [
                {
                  "id_turma": "ID da turma",
                  "insight": "Com base na 'descricao' e nos dados da turma, gere um insight ou observação sobre esta turma específica (por exemplo, se tem muitos ou poucos alunos) e, se houver uma observação relevante, inclua uma sugestão."
                }
              ]
            }

            Aqui estão os dados das turmas:
            $turmasJsonString
            PROMPT;

            // ETAPA 4: CHAMAR A API DO GEMINI E TRATAR A RESPOSTA
            $client = Gemini::client(env('GOOGLE_API_KEY'));
            $modelName = config('services.gemini.model');
            $model = $client->generativeModel($modelName);
            $geminiReply = $model->generateContent($prompt);
            $geminiResponseText = $geminiReply->text();

            $cleanedJson = trim($geminiResponseText);
            if (str_starts_with($cleanedJson, '```json')) {
                $cleanedJson = str_replace('```json', '', $cleanedJson);
                $cleanedJson = rtrim($cleanedJson, '`');
            }
            $insightsData = json_decode($cleanedJson, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('A resposta da IA (insights) não era um JSON válido.', ['response' => $geminiResponseText]);
                throw new \Exception('A resposta da IA (insights) não pôde ser processada.');
            }

            // ETAPA 5: COMBINAR OS DADOS CALCULADOS COM OS INSIGHTS DA IA
            $analiseIndividualFinal = $turmasCollection->map(function ($turma) use ($insightsData) {
                $insightEncontrado = collect($insightsData['analise_individual'] ?? [])
                    ->firstWhere('id_turma', $turma['id']);

                return [
                    'id_turma' => $turma['id'] ?? uniqid(),
                    'nome_turma' => $turma['nome'] ?? 'Turma sem nome',
                    'numero_alunos' => $turma['numero_alunos'],
                    // ADICIONADO: Incluímos a descrição no resultado final para uso no frontend.
                    'descricao' => $turma['descricao'] ?? '',
                    'insight' => $insightEncontrado['insight'] ?? 'Nenhum insight gerado.',
                ];
            })->values()->all();

            $analysisData = [
                'resumo_geral' => $insightsData['resumo_geral'] ?? 'Nenhum resumo gerado.',
                'metricas_chave' => $metricasChave,
                'analise_individual' => $analiseIndividualFinal,
            ];

            // ETAPA 6: SALVAR NO BANCO DE DADOS E ENVIAR PARA O FRONTEND
            AnaliseTurma::updateOrCreate(
                ['user_id' => Auth::id()],
                [
                    'dados_analise_json' => $analysisData,
                    'dados_originais' => $turmasData,
                ]
            );

            return Inertia::render('Turmas/Index', [
                'turmas' => Turma::latest()->get(),
                'ia_analysis' => $analysisData,
                'error' => null,
            ]);

        } catch (ConnectionException $e) {
            Log::error('Erro de conexão com o serviço de IA.', ['exception' => $e->getMessage()]);

            return Inertia::render('Turmas/Index', [
                'turmas' => Turma::latest()->get(),
                'ia_analysis' => AnaliseTurma::latest()->first()?->dados_analise_json,
                'error' => 'Serviço de análise indisponível no momento. Tente mais tarde.',
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao gerar ou processar análise com Gemini.', ['exception' => $e->getMessage()]);

            return Inertia::render('Turmas/Index', [
                'turmas' => Turma::latest()->get(),
                'ia_analysis' => AnaliseTurma::latest()->first()?->dados_analise_json,
                'error' => 'Não foi possível gerar a nova análise: '.$e->getMessage(),
            ]);
        }
    }

    public function getTurmaData(Request $request, Turma $turma)
    {
        $periodoId = $request->input('periodo_id', Periodo::latest()->first()?->id);

        if (! $periodoId) {
            return redirect()->route('turmas.show', $turma->id)
                ->with('error_analise', 'Nenhum período (bimestre) cadastrado para gerar a análise.');
        }

        $resumoSalvo = TurmaResumo::where('turma_id', $turma->id)
            ->where('periodo_id', $periodoId)
            ->where('user_id', Auth::id())
            ->first();

        if ($resumoSalvo) {
            return redirect()->route('turmas.show', [
                'turma' => $turma->id,
                'periodo_id' => $periodoId,
            ]);
        }

        try {
            $this->generateAndStoreTurmaAnalysis($turma, $periodoId);

            return redirect()->route('turmas.show', [
                'turma' => $turma->id,
                'periodo_id' => $periodoId,
            ])->with('ia_success', 'Nova análise do bimestre gerada com sucesso!');
        } catch (\Exception $e) {
            $error = 'Não foi possível gerar a análise da turma: '.$e->getMessage();
            Log::error("Falha ao gerar análise para turma ID {$turma->id} e período ID {$periodoId}", ['exception' => $e]);

            return redirect()->route('turmas.show', $turma->id)->with('error_analise', $error);
        }
    }

    public function forceGenerateTurmaAnalysis(Request $request, Turma $turma)
    {
        $periodoId = $request->input('periodo_id');

        if (! $periodoId) {
            return redirect()->route('turmas.show', $turma->id)
                ->with('error_analise', 'É necessário selecionar um bimestre para gerar a análise.');
        }

        try {
            $this->generateAndStoreTurmaAnalysis($turma, (int) $periodoId);

            return redirect()->route('turmas.show', [
                'turma' => $turma->id,
                'periodo_id' => $periodoId,
            ])->with('ia_success', 'Análise do bimestre gerada com sucesso!');
        } catch (\Exception $e) {
            $error = 'Não foi possível regenerar a análise da turma: '.$e->getMessage();
            Log::error("Falha ao forçar a geração de análise para turma ID {$turma->id}", ['exception' => $e]);

            return redirect()->route('turmas.show', $turma->id)->with('error_analise', $error);
        }
    }

    /**
     * Gera e armazena uma análise pedagógica detalhada para uma turma.
     *
     * Esta função primeiro calcula todas as estatísticas descritivas (médias, medianas, etc.)
     * localmente usando PHP. Em seguida, envia esses dados pré-processados para a IA
     * com um prompt focado em obter insights qualitativos e recomendações pedagógicas.
     *
     * @param  Turma  $turma  O objeto da turma a ser analisado.
     * @return array Os dados completos da análise, combinando estatísticas e insights.
     *
     * @throws \Exception Se a resposta da IA não for um JSON válido.
     */
    private function generateAndStoreTurmaAnalysis(Turma $turma, int $periodoId): array
    {
        // <-- ATUALIZADO: 1. BUSCAR O PERÍODO E CARREGAR DADOS FILTRADOS -->
        $periodo = Periodo::findOrFail($periodoId);

        // Carrega alunos e SOMENTE as avaliações que ocorreram dentro do período especificado.
        $turma->load(['alunos.avaliacoes' => function ($query) use ($periodo) {
            $query->whereBetween('data_avaliacao', [$periodo->data_inicio, $periodo->data_fim]);
        }, 'alunos.avaliacoes.materia']);

        $todasAsNotas = [];
        $notasPorMateria = [];
        $dadosAlunos = [];
        $totalAvaliacoes = 0;

        // 2. PRÉ-PROCESSAMENTO (A lógica interna não muda, pois já recebe os dados filtrados)
        foreach ($turma->alunos as $aluno) {
            $notasAluno = $aluno->avaliacoes->pluck('nota')->all();
            $totalAvaliacoes += count($notasAluno);

            if (count($notasAluno) > 0) {
                $mediaAluno = array_sum($notasAluno) / count($notasAluno);
                $dadosAlunos[] = [
                    'id' => $aluno->id,
                    'nome' => $aluno->nome,
                    'media' => round($mediaAluno, 2),
                ];
            } else {
                $dadosAlunos[] = [
                    'id' => $aluno->id,
                    'nome' => $aluno->nome,
                    'media' => 0,
                ];
            }

            foreach ($aluno->avaliacoes as $avaliacao) {
                $materiaNome = $avaliacao->materia->nome ?? 'N/A';
                $notasPorMateria[$materiaNome][] = $avaliacao->nota;
                $todasAsNotas[] = $avaliacao->nota;
            }
        }

        // <-- ATUALIZADO: Validação para evitar erro se não houver avaliações no período. -->
        if ($totalAvaliacoes === 0) {
            throw new \Exception('Nenhuma avaliação encontrada neste bimestre para gerar a análise.');
        }

        usort($dadosAlunos, fn ($a, $b) => $b['media'] <=> $a['media']);
        $melhorAluno = $dadosAlunos[0] ?? null;
        $alunoComDificuldade = end($dadosAlunos) ?? null;

        $median = function (array $arr) {
            if (empty($arr)) {
                return 0;
            }
            sort($arr);
            $count = count($arr);
            $middle = floor(($count - 1) / 2);

            return ($count % 2) ? $arr[$middle] : ($arr[$middle] + $arr[$middle + 1]) / 2;
        };

        $stdDev = function (array $arr) {
            if (count($arr) < 2) {
                return 0;
            }
            $mean = array_sum($arr) / count($arr);
            $sumOfSquares = array_sum(array_map(fn ($x) => pow($x - $mean, 2), $arr));

            return round(sqrt($sumOfSquares / (count($arr) - 1)), 2);
        };

        // 3. CONSTRUÇÃO DO CONTEXTO PARA A IA (código inalterado)
        $estatisticasGerais = [
            'quantidade_alunos' => count($turma->alunos),
            'quantidade_avaliacoes' => $totalAvaliacoes,
            'media_geral' => count($todasAsNotas) ? round(array_sum($todasAsNotas) / count($todasAsNotas), 2) : 0,
            'mediana_geral' => $median($todasAsNotas),
            'desvio_padrao_geral' => $stdDev($todasAsNotas),
            'aprovados_geral' => count(array_filter($dadosAlunos, fn ($a) => $a['media'] >= 6)),
            'reprovados_geral' => count(array_filter($dadosAlunos, fn ($a) => $a['media'] < 6)),
        ];
        $estatisticasMaterias = [];
        foreach ($notasPorMateria as $materia => $notas) {
            $estatisticasMaterias[] = [
                'materia' => $materia,
                'media' => round(array_sum($notas) / count($notas), 2),
                'mediana' => $median($notas),
                'desvio_padrao' => $stdDev($notas),
                'maior_nota' => max($notas),
                'menor_nota' => min($notas),
            ];
        }
        $contextoParaIA = [
            'estatisticas_gerais' => $estatisticasGerais,
            'estatisticas_materias' => $estatisticasMaterias,
            'melhor_aluno' => ['nome' => $melhorAluno['nome'] ?? 'N/A', 'media' => $melhorAluno['media'] ?? 0],
            'aluno_com_dificuldade' => ['nome' => $alunoComDificuldade['nome'] ?? 'N/A', 'media' => $alunoComDificuldade['media'] ?? 0],
        ];
        $contextoJsonString = json_encode($contextoParaIA, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        // 4. PROMPT PARA A IA (código inalterado)
        $prompt = <<<PROMPT
        Você é um especialista em pedagogia e análise de dados educacionais, com foco em fornecer insights práticos para professores.

        Com base no resumo estatístico da turma fornecido abaixo, gere uma análise **exclusivamente em JSON válido**, sem nenhum texto fora do JSON.

        A estrutura do JSON de resposta deve ser:
        {
          "resumo_pedagogico": "Um resumo textual interpretativo sobre o desempenho geral da turma, destacando pontos fortes e áreas que necessitam de atenção.",
          "insights_por_materia": [
            {
              "materia": "Nome da Matéria",
              "insight": "Uma análise qualitativa do desempenho na matéria. Se a dispersão (desvio padrão) for alta, comente sobre a heterogeneidade da turma. Se a média for baixa, sugira possíveis causas.",
              "sugestao_pedagogica": "Uma dica de ensino ou atividade prática para melhorar o desempenho dos alunos nesta matéria (ex: 'Para Matemática, considere usar gamificação para revisar frações' ou 'Para História, um debate sobre o tema pode engajar os alunos com menor desempenho')."
            }
          ],
          "pontos_de_atencao": [
            "Um insight sobre o aluno com maior dificuldade, sugerindo uma abordagem de apoio individualizado.",
            "Um insight sobre a turma como um todo (ex: 'A alta dispersão de notas em Ciências sugere a necessidade de atividades de nivelamento.').",
            "Qualquer outra observação relevante."
          ]
        }

        Aqui está o resumo estatístico da turma:
        $contextoJsonString
        PROMPT;

        // 5. CHAMADA À IA E TRATAMENTO DA RESPOSTA (código inalterado)
        $client = Gemini::client(env('GOOGLE_API_KEY'));
        $modelName = config('services.gemini.model');
        $model = $client->generativeModel($modelName);
        $geminiReply = $model->generateContent($prompt);
        $geminiResponseText = $geminiReply->text();
        $cleanedJson = trim($geminiResponseText);
        if (str_starts_with($cleanedJson, '```json')) {
            $cleanedJson = substr($cleanedJson, 7);
            $cleanedJson = rtrim($cleanedJson, '`');
        }
        $insightsDaIA = json_decode($cleanedJson, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('A resposta da IA para a análise da turma não era um JSON válido. Erro: '.json_last_error_msg());
        }

        // 6. COMBINAR DADOS E SALVAR NO BANCO
        $analysisData = [
            'resumo_pedagogico' => $insightsDaIA['resumo_pedagogico'] ?? 'N/A',
            'estatisticas_gerais' => $estatisticasGerais,
            'materias' => [], // Será preenchido abaixo
            'alunos_destaque' => [
                'melhor_aluno' => $melhorAluno ? ['id' => $melhorAluno['id'], 'nome' => $melhorAluno['nome'], 'media' => $melhorAluno['media']] : null,
                'aluno_com_dificuldade' => $alunoComDificuldade ? ['id' => $alunoComDificuldade['id'], 'nome' => $alunoComDificuldade['nome'], 'media' => $alunoComDificuldade['media']] : null,
            ],
            'pontos_de_atencao' => $insightsDaIA['pontos_de_atencao'] ?? [],
        ];

        foreach ($estatisticasMaterias as $materiaStats) {
            $insightMateria = collect($insightsDaIA['insights_por_materia'] ?? [])
                ->firstWhere('materia', $materiaStats['materia']);
            $analysisData['materias'][] = array_merge($materiaStats, [
                'insight' => $insightMateria['insight'] ?? 'Análise não gerada.',
                'sugestao_pedagogica' => $insightMateria['sugestao_pedagogica'] ?? 'Nenhuma sugestão gerada.',
            ]);
        }

        $dadosOriginais = [
            'turma_id' => $turma->id,
            'turma_nome' => $turma->nome,
            'periodo_id' => $periodoId, // <-- ADICIONADO: Salva o ID do período nos dados originais
            'alunos' => $turma->alunos->map(fn ($a) => [
                'aluno_id' => $a->id,
                'aluno_nome' => $a->nome,
                'avaliacoes' => $a->avaliacoes->map(fn ($av) => [
                    'materia' => $av->materia->nome ?? 'N/A',
                    'nota' => $av->nota,
                ]),
            ])->toArray(),
        ];

        // <-- ATUALIZADO: Salva usando a chave composta de turma_id e periodo_id -->
        TurmaResumo::updateOrCreate(
            ['turma_id' => $turma->id, 'periodo_id' => $periodoId, 'user_id' => Auth::id()], // Critérios de busca
            [
                'dados_analise_json' => $analysisData,
                'dados_originais' => $dadosOriginais,
            ]
        );

        return $analysisData;
    }

    public function generateAndStoreAlunoAnalysis(Aluno $aluno): array
    {
        // 1. CARREGAR TODOS OS DADOS RELEVANTES DO ALUNO
        $aluno->load(['avaliacoes.materia', 'avaliacoes.periodo', 'relatorios.periodo']);

        if ($aluno->avaliacoes->isEmpty()) {
            throw new \Exception('Nenhuma avaliação encontrada para este aluno.');
        }

        // 2. PROCESSAR DADOS PARA O CONTEXTO DA IA

        // A) Análise de Evolução por Período
        $avaliacoesPorPeriodo = $aluno->avaliacoes->groupBy('periodo.nome');
        $evolucaoBimestral = $avaliacoesPorPeriodo->map(function ($avaliacoes, $nomePeriodo) {
            return [
                'periodo' => $nomePeriodo,
                'media' => round($avaliacoes->avg('nota'), 2),
            ];
        })->values()->all();

        // B) Estatísticas Gerais (todas as avaliações)
        $estatisticasGerais = [
            'media_geral' => round($aluno->avaliacoes->avg('nota'), 2),
            'melhor_materia' => $aluno->avaliacoes->groupBy('materia.nome')->map(fn ($avs) => $avs->avg('nota'))->sortDesc()->keys()->first(),
            'pior_materia' => $aluno->avaliacoes->groupBy('materia.nome')->map(fn ($avs) => $avs->avg('nota'))->sort()->keys()->first(),
            'total_avaliacoes' => $aluno->avaliacoes->count(),
        ];

        // C) Compilação dos Relatórios
        $relatoriosCompilados = $aluno->relatorios->map(function ($relatorio) {
            return [
                'periodo' => $relatorio->periodo->nome ?? 'Geral',
                'relatorio' => $relatorio->texto,
            ];
        })->all();

        $contextoParaIA = [
            'nome_aluno' => $aluno->nome,
            'estatisticas_gerais' => $estatisticasGerais,
            'evolucao_bimestral' => $evolucaoBimestral,
            'relatorios_pedagogicos' => $relatoriosCompilados,
        ];

        // 3. CRIAR O NOVO PROMPT PARA A IA
        $contextoJsonString = json_encode($contextoParaIA, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $prompt = <<<PROMPT
    Você é um psicopedagogo e analista de dados educacionais, especializado em criar resumos holísticos sobre o desenvolvimento de alunos.

    Com base nos dados completos de um aluno (estatísticas gerais, evolução de notas por bimestre e relatórios escritos por professores), sua tarefa é gerar uma análise aprofundada.
    Sua resposta deve ser **exclusivamente um objeto JSON válido**.

    A estrutura do JSON de resposta deve ser:
    {
      "resumo_geral": "Um parágrafo conciso que sintetiza o perfil do aluno, combinando o desempenho quantitativo (notas) e qualitativo (relatórios).",
      "analise_evolucao": "Um texto curto que descreve a trajetória do aluno ao longo dos bimestres. Ele está melhorando, piorando ou se mantendo estável? Mencione picos de desempenho ou quedas.",
      "analise_relatorios": "Um resumo dos temas e observações mais recorrentes nos relatórios dos professores. Foque em aspectos comportamentais, sociais ou de aprendizado mencionados.",
      "pontos_fortes": [
        "Liste de 2 a 3 pontos fortes claros e objetivos, baseados tanto nas notas (ex: 'Excelente desempenho em História') quanto nos relatórios (ex: 'Demonstra grande participação nas aulas')."
      ],
      "pontos_a_melhorar": [
        "Liste de 2 a 3 áreas que precisam de atenção, com sugestões práticas e construtivas (ex: 'A média em Matemática está abaixo do esperado; focar em exercícios de revisão pode ser útil.' ou 'Os relatórios indicam dificuldade de concentração; experimentar técnicas de estudo focado como Pomodoro.')."
      ]
    }

    Dados completos do aluno:
    $contextoJsonString
    PROMPT;

        // 4. CHAMAR A IA E PROCESSAR A RESPOSTA (código inalterado, exceto pelo nome do modelo)
        $client = Gemini::client(env('GOOGLE_API_KEY'));
        $modelName = config('services.gemini.model');
        $geminiReply = $client->generativeModel($modelName)->generateContent($prompt);
        $geminiResponseText = $geminiReply->text();

        $cleanedJson = trim(str_replace(['```json', '```'], '', $geminiResponseText));
        $insightsDaIA = json_decode($cleanedJson, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('A resposta da IA (análise do aluno) não era um JSON válido.', ['response' => $geminiResponseText]);
            throw new \Exception('A resposta da IA não pôde ser processada.');
        }

        // 5. COMBINAR DADOS E RETORNAR
        $analysisData = [
            'estatisticas' => $contextoParaIA,
            'insights' => $insightsDaIA,
        ];

        // ETAPA 6: SALVAR NO BANCO DE DADOS (NOVA LÓGICA)
        AnaliseAluno::updateOrCreate(
            ['aluno_id' => $aluno->id, 'user_id' => Auth::id()], // Critérios de busca
            [
                'dados_analise_json' => $analysisData,
                'dados_originais' => $contextoParaIA,
            ]
        );

        // 7. RETORNAR OS DADOS PARA O CONTROLLER
        return $analysisData;
    }

    public function forceGenerateAlunoAnalysis(Request $request, Aluno $aluno)
    {
        try {
            // CORRIGIDO: Chama a análise principal sem depender de um período
            $this->generateAndStoreAlunoAnalysis($aluno);

            return back()->with('ia_success', 'Nova análise do aluno gerada com sucesso!');
        } catch (\Exception $e) {
            $error = 'Não foi possível regenerar a análise do aluno: '.$e->getMessage();
            Log::error("Falha ao forçar análise para aluno ID {$aluno->id}", ['exception' => $e]);

            return back()->with('error_analise', $error);
        }
    }
}
