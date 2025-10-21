# ===========================================
# MAKEFILE - PROJETO IAST
# ===========================================
# Comandos úteis para gerenciar o projeto com Docker

.PHONY: help dev prod stop restart logs clean build status shell-frontend shell-backend health

# Comando padrão
help:
	@echo "=========================================="
	@echo "  IAST - Comandos Docker"
	@echo "=========================================="
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  make dev          - Iniciar em modo desenvolvimento"
	@echo "  make prod         - Iniciar em modo producao"
	@echo "  make stop         - Parar todos os containers"
	@echo "  make restart      - Reiniciar containers"
	@echo "  make logs         - Ver logs (todos)"
	@echo "  make logs-f       - Ver logs em tempo real"
	@echo "  make logs-frontend - Ver logs do frontend"
	@echo "  make logs-backend  - Ver logs do backend"
	@echo "  make build        - Rebuild containers"
	@echo "  make clean        - Remover containers e volumes"
	@echo "  make status       - Ver status dos containers"
	@echo "  make shell-frontend - Abrir shell no frontend"
	@echo "  make shell-backend  - Abrir shell no backend"
	@echo "  make health       - Verificar health check"
	@echo ""

# Iniciar em modo desenvolvimento
dev:
	@echo "[INFO] Iniciando em modo DESENVOLVIMENTO..."
	docker-compose up

# Iniciar em modo desenvolvimento (background)
dev-d:
	@echo "[INFO] Iniciando em modo DESENVOLVIMENTO (background)..."
	docker-compose up -d

# Iniciar em modo produção
prod:
	@echo "[INFO] Iniciando em modo PRODUCAO..."
	docker-compose -f docker-compose.prod.yml up

# Iniciar em modo produção (background)
prod-d:
	@echo "[INFO] Iniciando em modo PRODUCAO (background)..."
	docker-compose -f docker-compose.prod.yml up -d

# Parar containers
stop:
	@echo "[INFO] Parando containers..."
	docker-compose down

# Reiniciar containers
restart:
	@echo "[INFO] Reiniciando containers..."
	docker-compose restart

# Ver logs
logs:
	docker-compose logs

# Ver logs em tempo real
logs-f:
	docker-compose logs -f

# Ver logs do frontend
logs-frontend:
	docker-compose logs -f frontend

# Ver logs do backend
logs-backend:
	docker-compose logs -f backend

# Rebuild containers
build:
	@echo "[INFO] Rebuild de containers..."
	docker-compose up --build

# Rebuild sem cache
build-clean:
	@echo "[INFO] Rebuild completo (sem cache)..."
	docker-compose build --no-cache
	docker-compose up

# Remover containers e volumes
clean:
	@echo "[INFO] Removendo containers e volumes..."
	docker-compose down -v

# Remover tudo (incluindo imagens)
clean-all:
	@echo "[INFO] Removendo tudo (containers, volumes, imagens)..."
	docker-compose down -v --rmi all

# Ver status
status:
	@echo "=========================================="
	@echo "  Status dos Containers"
	@echo "=========================================="
	docker-compose ps

# Shell no frontend
shell-frontend:
	docker-compose exec frontend sh

# Shell no backend
shell-backend:
	docker-compose exec backend sh

# Health check
health:
	@echo "=========================================="
	@echo "  Health Check"
	@echo "=========================================="
	@echo ""
	@echo "[Frontend] http://localhost:3001"
	@curl -s http://localhost:3001 > /dev/null && echo "✓ Frontend OK" || echo "✗ Frontend ERRO"
	@echo ""
	@echo "[Backend] http://localhost:4000/health"
	@curl -s http://localhost:4000/health | python -m json.tool 2>/dev/null || echo "✗ Backend ERRO"
	@echo ""

# Setup inicial
setup:
	@echo "[INFO] Configurando ambiente..."
	@if [ ! -f .env.docker ]; then \
		cp env.docker.example .env.docker; \
		echo "[OK] Arquivo .env.docker criado"; \
		echo "[IMPORTANTE] Edite .env.docker e adicione sua OPENAI_API_KEY"; \
	else \
		echo "[OK] .env.docker ja existe"; \
	fi

# Instalar dependências localmente (sem Docker)
install:
	@echo "[INFO] Instalando dependencias..."
	npm install
	cd backend && npm install

# Executar localmente (sem Docker)
local:
	@echo "[INFO] Iniciando localmente..."
	@echo "Inicie o backend em um terminal: cd backend && npm start"
	@echo "Inicie o frontend em outro terminal: npm run dev"

