# 🚀 Gestor de Turmas com IA

Bem-vindo ao Gestor de Turmas! Esta é uma aplicação web moderna construída para ajudar educadores a gerir as suas turmas, alunos e avaliações de forma eficiente. O projeto integra um serviço de Inteligência Artificial para fornecer análises e insights sobre o desempenho dos alunos e das turmas.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura dos Serviços](#-estrutura-dos-serviços)
- [Comandos Úteis do Sail](#-comandos-úteis-do-sail)

---

## 🎯 Sobre o Projeto

Esta plataforma foi desenvolvida utilizando uma arquitetura de serviços moderna, combinando o poder do ecossistema Laravel no backend com a reatividade do React no frontend. A comunicação entre eles é feita de forma transparente pelo Inertia.js.

A aplicação principal (`laravel.test`) é responsável por toda a lógica de negócio, autenticação e interface do utilizador. Ela comunica com um microserviço de IA (`ia_service`), construído em Python, que processa dados e gera análises avançadas.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

- **Backend:** Laravel 11
- **Frontend:** React, Inertia.js, Vite, Tailwind CSS
- **Banco de Dados:** PostgreSQL 17
- **Serviço de IA:** Python, FastAPI/Uvicorn
- **Ambiente de Desenvolvimento:** Docker, Laravel Sail

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de que tem as seguintes ferramentas instaladas na sua máquina:

- [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Docker Compose)
- [**Git**](https://git-scm.com/) para clonar o repositório

---

## ⚙️ Instalação e Execução

Siga este guia passo a passo para configurar e executar o ambiente de desenvolvimento localmente.

### **1. Clonar o Repositório**

Primeiro, clone este repositório para a sua máquina local.

```bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
cd seu-repositorio
```

### **2. Configurar o Ficheiro de Ambiente**

Copie o ficheiro de exemplo `.env.example` para criar o seu próprio ficheiro de configuração `.env`.

```bash
cp .env.example .env
```

Abra o ficheiro `.env` e **certifique-se de adicionar a sua chave da API da Google** na variável `GOOGLE_API_KEY`.

```env
# .env
# ... outras variáveis

DB_CONNECTION=pgsql
DB_HOST=pgsql
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=sail
DB_PASSWORD=password

# ADICIONE SUA CHAVE AQUI
GOOGLE_API_KEY="SUA_CHAVE_API_DO_GOOGLE_AQUI"
```

### **3. Construir e Iniciar os Contêineres Docker**

Use o Laravel Sail para construir as imagens e iniciar todos os serviços definidos no `docker-compose.yml`. Este comando irá executar os contêineres em segundo plano (`-d`).

_A primeira vez que executar este comando pode demorar alguns minutos, pois o Docker precisa de descarregar e construir as imagens._

```bash
./vendor/bin/sail up -d
```

### **4. Instalar as Dependências do Projeto**

Com os contêineres em execução, instale as dependências do PHP (via Composer) e do JavaScript (via NPM) dentro do contêiner da aplicação.

```bash
# Instalar dependências do Composer
./vendor/bin/sail composer install

# Instalar dependências do NPM
./vendor/bin/sail npm install
```

### **5. Gerar a Chave da Aplicação**

Gere uma chave de encriptação segura para a sua aplicação Laravel.

```bash
./vendor/bin/sail artisan key:generate
```

### **6. Executar as Migrations e Seeders**

Este comando irá criar todas as tabelas no banco de dados e preenchê-las com os dados iniciais definidos nos _seeders_.

```bash
./vendor/bin/sail artisan migrate --seed
```

### **7. Compilar os Assets do Frontend**

Execute o servidor de desenvolvimento do Vite para compilar os ficheiros JavaScript e CSS.

```bash
./vendor/bin/sail npm run dev
```

### **8. Acessar a Aplicação**

🎉 Pronto! A aplicação já está em execução. Pode aceder aos serviços nos seguintes endereços:

- **Aplicação Principal:** [**http://localhost:8000**](http://localhost:8000)
- **Serviço de IA (API):** [**http://localhost:8001**](http://localhost:8001)

---

## 🏗️ Estrutura dos Serviços

O ambiente Docker é composto pelos seguintes serviços:

- `laravel.test`: O contêiner principal que executa a aplicação Laravel. Ele serve o site, processa as requisições e executa os comandos `artisan`.
- `ia_service`: Um microserviço em Python (FastAPI) responsável por todas as operações de IA. Ele é executado de forma independente e comunica com o banco de dados.
- `pgsql`: O contêiner do banco de dados PostgreSQL, onde todos os dados da aplicação são armazenados.

---

## ⚡ Comandos Úteis do Sail

Aqui estão alguns comandos do Sail que podem ser úteis durante o desenvolvimento:

- **Iniciar todos os serviços:** `./vendor/bin/sail up -d`
- **Parar todos os serviços:** `./vendor/bin/sail down`
- **Executar um comando Artisan:** `./vendor/bin/sail artisan <comando>` (ex: `./vendor/bin/sail artisan list`)
- **Aceder ao terminal (bash) do contêiner Laravel:** `./vendor/bin/sail shell`
- **Executar testes com Pest:** `./vendor/bin/sail test`
- **Ver os logs dos contêineres:** `docker-compose logs -f`
