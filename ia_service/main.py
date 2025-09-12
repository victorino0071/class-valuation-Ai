# ia_service/main.py

import os
import pandas as pd
from fastapi import FastAPI
from sqlalchemy import create_engine, text

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

# --- APLICAÇÃO FASTAPI ---
app = FastAPI(title="Serviço de IA para Análise de Alunos")

@app.get("/healthcheck", tags=["Healthcheck"])
def read_healthcheck():
    return {"status": "ok"}

# --- LÓGICA DE EXTRAÇÃO DE DADOS ---
@app.get("/carregar_dados_periodo/{aluno_id}/{periodo_id}", tags=["Dados"])
def carregar_dados_periodo(aluno_id: int, periodo_id: int) -> dict:
    
    query_relatorio = text("SELECT * FROM relatorios WHERE aluno_id = :aluno_id AND periodo_id = :periodo_id")
    
    # CORREÇÃO: Tabela 'avaliacoes' e coluna 'aluno_id'
    query_avaliacoes = text("SELECT * FROM avaliacoes WHERE aluno_id = :aluno_id AND periodo_id = :periodo_id ORDER BY created_at ASC")

    try:
        with engine.connect() as connection:
            df_relatorio = pd.read_sql(query_relatorio, connection, params={'aluno_id': aluno_id, 'periodo_id': periodo_id})
            df_avaliacoes = pd.read_sql(query_avaliacoes, connection, params={'aluno_id': aluno_id, 'periodo_id': periodo_id})
        print("✅ Dados carregados com sucesso!")
        
        # --- 👇 MUDANÇA AQUI 👇 ---
        # Converte os DataFrames para uma lista de dicionários, um formato JSON muito melhor.
        return {
            'relatorio': df_relatorio.to_dict(orient='records'),
            'avaliacoes': df_avaliacoes.to_dict(orient='records')
        }
        
    except Exception as e:
        print(f"❌ Erro ao conectar ou buscar dados: {e}")
        # Retorna listas vazias em caso de erro.
        return {'relatorio': [], 'avaliacoes': []}

# --- BLOCO DE TESTE ---
if __name__ == "__main__":
    print("--- Iniciando teste de carga de dados ---")
    # Para o teste funcionar, certifique-se que existem dados no seu BD
    # para um user com id=1 e um período com id=1.
    dados = carregar_dados_periodo(aluno_id=1, periodo_id=1)

    print("\n[Relatório Carregado]")
    print(dados['relatorio'].head() if not dados['relatorio'].empty else "Nenhum relatório encontrado.")

    print("\n[Avaliações Carregadas]")
    print(dados['avaliacoes'].head() if not dados['avaliacoes'].empty else "Nenhuma avaliação encontrada.")