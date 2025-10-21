# ===========================================
# SCRIPT DE INICIALIZAÇÃO - DOCKER (PowerShell)
# ===========================================
# Script para iniciar o projeto IAST com Docker Compose no Windows

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  IAST - Inicializacao Docker" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está instalado
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "[ERRO] Docker nao esta instalado!" -ForegroundColor Red
    Write-Host "Instale o Docker em: https://www.docker.com/get-started" -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "[ERRO] Docker nao esta rodando!" -ForegroundColor Red
    Write-Host "Inicie o Docker Desktop e tente novamente." -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker Compose está disponível
$composeCmd = Get-Command docker-compose -ErrorAction SilentlyContinue
if (-not $composeCmd) {
    # Tentar docker compose (versão integrada)
    try {
        docker compose version | Out-Null
        $composeCmd = "docker compose"
    } catch {
        Write-Host "[ERRO] Docker Compose nao esta disponivel!" -ForegroundColor Red
        exit 1
    }
} else {
    $composeCmd = "docker-compose"
}

# Verificar se arquivo .env.docker existe
if (-not (Test-Path ".env.docker")) {
    Write-Host "[AVISO] Arquivo .env.docker nao encontrado!" -ForegroundColor Yellow
    Write-Host "Copiando env.docker.example para .env.docker..." -ForegroundColor Cyan
    Copy-Item "env.docker.example" ".env.docker"
    Write-Host ""
    Write-Host "[IMPORTANTE] Edite o arquivo .env.docker e adicione sua OPENAI_API_KEY!" -ForegroundColor Yellow
    Write-Host "Pressione ENTER apos editar o arquivo..." -ForegroundColor Yellow
    Read-Host
}

# Perguntar qual modo usar
Write-Host "Escolha o modo de execucao:" -ForegroundColor Cyan
Write-Host "1) Desenvolvimento (com hot-reload)" -ForegroundColor White
Write-Host "2) Producao (build otimizado)" -ForegroundColor White
Write-Host ""
$mode = Read-Host "Opcao (1 ou 2)"

Write-Host ""
Write-Host "[INFO] Parando containers anteriores..." -ForegroundColor Cyan
if ($composeCmd -eq "docker-compose") {
    docker-compose down 2>$null
} else {
    docker compose down 2>$null
}

Write-Host ""
if ($mode -eq "2") {
    Write-Host "[INFO] Iniciando em modo PRODUCAO..." -ForegroundColor Green
    if ($composeCmd -eq "docker-compose") {
        docker-compose -f docker-compose.prod.yml --env-file .env.docker up --build
    } else {
        docker compose -f docker-compose.prod.yml --env-file .env.docker up --build
    }
} else {
    Write-Host "[INFO] Iniciando em modo DESENVOLVIMENTO..." -ForegroundColor Green
    if ($composeCmd -eq "docker-compose") {
        docker-compose --env-file .env.docker up --build
    } else {
        docker compose --env-file .env.docker up --build
    }
}

