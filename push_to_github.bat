@echo off
setlocal
echo ===================================================
echo   ENVIAR CODIGO PARA O GITHUB (DIAGNOSTICO)
echo ===================================================

echo.
echo [1/5] Verificando instalacao do Git...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO CRITICO] O Git nao foi encontrado!
    echo.
    echo PROVAVEIS CAUSAS:
    echo 1. Voce instalou o Git mas NAO reiniciou o computador (ou fechou todas as janelas).
    echo 2. A instalacao falhou.
    echo.
    echo O QUE FAZER:
    echo - Feche esta janela.
    echo - REINICIE SEU COMPUTADOR.
    echo - Tente rodar este script novamente.
    echo.
    pause
    exit /b 1
)
echo Git encontrado! Versao:
git --version
echo.

echo [2/5] Verificando Repositorio...
if not exist ".git" (
    echo Inicializando repositorio...
    git init
    git branch -M main
)

set /p REPO_URL="Cole a URL do repositorio (ex: https://github.com/user/repo.git): "

if "%REPO_URL%"=="" (
    echo ERRO: A URL nao pode ser vazia.
    pause
    exit /b 1
)

echo.
echo [3/5] Adicionando arquivos...
git add .

echo.
echo [4/5] Criando Commit...
git commit -m "Deploy %date% %time%"

echo.
echo [5/5] Enviando para: %REPO_URL% ...
echo AVISO: Se pedir senha, use o token. Se abrir uma janela de login, faca login no navegador.
echo.
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================================
    echo   ERRO AO ENVIAR! LEIA A MENSAGEM ACIMA (em vermelho/branco)
    echo ===================================================
    echo.
) else (
    echo.
    echo ===================================================
    echo   SUCESSO! CODIGO ENVIADO.
    echo ===================================================
)

pause
