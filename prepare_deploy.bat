@echo off
setlocal
echo ===================================================
echo   PREPARANDO PACOTE DE DEPLOY (FRONTEND) - HOSTGATOR
echo ===================================================

set "DEPLOY_DIR=%CD%\deploy_package"
set "FRONTEND_SOURCE=%CD%"

echo.
echo [1/2] Limpando diretorio de deploy anterior...
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%"
mkdir "%DEPLOY_DIR%\public_html"

echo.
echo [2/2] Preparando Frontend (React/Vite)...
echo.
echo === IMPORTANTE ===
echo Cole abaixo a URL da sua API no Render (criada no passo anterior).
echo Exemplo: https://potencialize-api.onrender.com
echo.
set /p PRODUCTION_API_URL="URL da API: "

echo Construindo o frontend para %PRODUCTION_API_URL%...
REM Criando .env.production temporario
echo VITE_API_BASE_URL=%PRODUCTION_API_URL% > "%FRONTEND_SOURCE%\.env.production"

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao construir o frontend.
    goto :error
)

echo Copiando arquivos de build para public_html...
xcopy /E /I /Y "%FRONTEND_SOURCE%\dist" "%DEPLOY_DIR%\public_html"

REM Removendo .env.production temporario
del "%FRONTEND_SOURCE%\.env.production"

echo.
echo ===================================================
echo   PACOTE FRONTEND CRIADO COM SUCESSO!
echo ===================================================
echo.
echo Os arquivos estao em: %DEPLOY_DIR%
echo.
echo O que fazer agora:
echo 1. Compacte o conteudo de "%DEPLOY_DIR%\public_html" em "frontend.zip".
echo 2. Suba o "frontend.zip" para a pasta "public_html" no Hostgator.
echo.
pause
exit /b 0

:error
echo.
echo UM ERRO OCORREU. VERIFIQUE AS MENSAGENS ACIMA.
pause
exit /b 1
