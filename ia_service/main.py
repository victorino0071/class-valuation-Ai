import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from dotenv import load_dotenv


load_dotenv();

app = FastAPI(title="IA Service API", version="1.0");

DB_USER = os.getenv("DB_USER", "sail");
DB_PASSWORD = os.getenv("DB_PASSWORD", "sail");
DB_HOST = os.getenv("DB_HOST", "pgsql");
DB_PORT = os.getenv("DB_PORT", "5432");
DB_NAME = os.getenv("DB_NAME", "laravel");

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}";

try:
    engine = create_engine(DATABASE_URL);
    print("Database connection established.");
except Exception as e:
    print(f"Error connecting to the database: {e}");
    engine = None;

class TurmasRequest(BaseModel):
    limit: int = 5

@app.get("/")
def root():
    return {"status": "ia_service running", "database_connected": engine is not None}


@app.post("/turmas-com-alunos/")
def get_turmas_com_alunos(request: TurmasRequest):
    if engine is None:
        raise HTTPException(status_code=503, detail="Database connection not established")

    query_turmas = text('SELECT * FROM "turmas" LIMIT :limit')

    try:
        with engine.connect() as connection:
            turmas_df = pd.read_sql(query_turmas, connection, params={"limit": request.limit})
            turmas_lista = turmas_df.to_dict(orient="records")

            # DOCUMENTAÇÃO: A query foi simplificada para uma relação One-to-Many.
            # Agora, buscamos na tabela "alunos" onde a coluna "turma_id"
            # é igual ao ID da turma que estamos processando. Não há mais JOIN.
            query_alunos = text("""
                SELECT id, nome
                FROM "alunos" 
                WHERE turma_id = :turma_id
            """)

            for turma in turmas_lista:
                # A lógica para executar a query continua a mesma
                alunos_df = pd.read_sql(query_alunos, connection, params={"turma_id": turma['id']})
                turma['alunos'] = alunos_df.to_dict(orient="records")

        return {
            "message": "Dados de turmas e seus alunos extraídos com sucesso!",
            "data": turmas_lista
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dados: {str(e)}")
     
