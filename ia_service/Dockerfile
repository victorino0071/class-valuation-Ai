# Dockerfile

# 1. Usar uma imagem base oficial do Python.
# A versão 'slim' é mais leve, o que é ótimo para produção.
FROM python:3.12-slim

# 2. Definir o diretório de trabalho dentro do contêiner.
# Todos os comandos a seguir serão executados a partir deste diretório.sail
WORKDIR /app

# 3. Copiar o arquivo de dependências para o contêiner.
COPY requirements.txt .

# 4. Instalar as dependências do projeto.
# O '--no-cache-dir' desabilita o cache do pip, reduzindo o tamanho da imagem.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar todo o código da nossa aplicação para o diretório de trabalho do contêiner.
COPY . .

# 6. Expor a porta que o nosso serviço vai usar.
# O Uvicorn, por padrão, roda na porta 8000.
EXPOSE 8000

# 7. Definir o comando para iniciar a aplicação quando o contêiner for executado.
# 'main:app' -> no arquivo 'main.py', encontre o objeto 'app'.
# '--host 0.0.0.0' -> torna o serviço acessível de fora do contêiner.
# '--port 8000' -> porta onde o serviço irá escutar.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]