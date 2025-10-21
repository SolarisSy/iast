#!/bin/bash

# ===========================================
# SCRIPT DE INICIALIZAÇÃO - DOCKER
# ===========================================
# Script para iniciar o projeto IAST com Docker Compose

echo "=========================================="
echo "  IAST - Inicializacao Docker"
echo "=========================================="
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "[ERRO] Docker não está instalado!"
    echo "Instale o Docker em: https://www.docker.com/get-started"
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "[ERRO] Docker Compose não está disponível!"
    exit 1
fi

# Verificar se arquivo .env.docker existe
if [ ! -f ".env.docker" ]; then
    echo "[AVISO] Arquivo .env.docker não encontrado!"
    echo "Copiando env.docker.example para .env.docker..."
    cp env.docker.example .env.docker
    echo ""
    echo "[IMPORTANTE] Edite o arquivo .env.docker e adicione sua OPENAI_API_KEY!"
    echo "Pressione ENTER após editar o arquivo..."
    read
fi

# Perguntar qual modo usar
echo "Escolha o modo de execução:"
echo "1) Desenvolvimento (com hot-reload)"
echo "2) Produção (build otimizado)"
echo ""
read -p "Opção (1 ou 2): " mode

echo ""
echo "[INFO] Parando containers anteriores..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null

echo ""
if [ "$mode" = "2" ]; then
    echo "[INFO] Iniciando em modo PRODUÇÃO..."
    docker-compose -f docker-compose.prod.yml up --build
else
    echo "[INFO] Iniciando em modo DESENVOLVIMENTO..."
    docker-compose up --build
fi

