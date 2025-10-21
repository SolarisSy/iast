# Script para iniciar todos os servicos com Ngrok
# Autor: IAST Project
# Uso: .\start-ngrok.ps1

# Definir encoding para UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Iniciando IAST com Ngrok ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se Ngrok esta instalado
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "[ERRO] Ngrok nao encontrado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g ngrok" -ForegroundColor Yellow
    Write-Host "Ou baixe de: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Ngrok encontrado" -ForegroundColor Green

# 1. Iniciar Backend
Write-Host ""
Write-Host "[1/4] Iniciando Backend (porta 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server' -ForegroundColor Cyan; npm start"

# Aguardar backend iniciar
Start-Sleep -Seconds 5

# 2. Iniciar Frontend
Write-Host "[2/4] Iniciando Frontend (porta 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm run dev"

# Aguardar frontend iniciar
Start-Sleep -Seconds 7

# 3. Iniciar Ngrok para Backend
Write-Host "[3/4] Expondo Backend com Ngrok..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend Ngrok Tunnel' -ForegroundColor Magenta; ngrok http 4000 --log=stdout"

# Aguardar Ngrok iniciar
Start-Sleep -Seconds 3

# 4. Iniciar Ngrok para Frontend
Write-Host "[4/4] Expondo Frontend com Ngrok..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend Ngrok Tunnel' -ForegroundColor Magenta; ngrok http 3001 --log=stdout"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=== Todos os servicos iniciados! ===" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Veja as URLs do Ngrok nas janelas que abriram" -ForegroundColor White
Write-Host "2. Copie a URL do BACKEND (porta 4000)" -ForegroundColor White
Write-Host "3. Crie arquivo .env.local com:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL=https://SEU-BACKEND.ngrok-free.app" -ForegroundColor Gray
Write-Host "4. Atualize CORS em backend/server.js com a URL do frontend" -ForegroundColor White
Write-Host "5. Reinicie Backend (Ctrl+C e npm start)" -ForegroundColor White
Write-Host "6. Reinicie Frontend (Ctrl+C e npm run dev)" -ForegroundColor White
Write-Host "7. Acesse a URL do FRONTEND no navegador" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard Ngrok: http://127.0.0.1:4040" -ForegroundColor Yellow
Write-Host ""
Write-Host "LEMBRE-SE:" -ForegroundColor Red
Write-Host "- Adicione a URL do Frontend no CORS do backend/server.js" -ForegroundColor White
Write-Host "- As URLs do Ngrok mudam toda vez que reinicia (plano gratis)" -ForegroundColor White
Write-Host ""

