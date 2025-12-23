@echo off
echo ==========================================
echo      Potencialize OS - Backend Setup
echo ==========================================

REM Check for Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    goto :FOUND
)

py --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
    goto :FOUND
)

echo [ERRO] Python nao encontrado!
echo.
echo Para prosseguir, voce precisa instalar o Python:
echo 1. Baixe em: https://www.python.org/downloads/
echo 2. Execute o instalador.
echo 3. IMPORTANTE: Marque a caixa "Add Python to PATH" na primeira tela.
echo.
echo Apos instalar, feche e abra este terminal novamente e rode o script.
pause
exit /b

:FOUND
echo Python encontrado: %PYTHON_CMD%

echo [1/4] Creating virtual environment...
%PYTHON_CMD% -m venv venv

echo [2/4] Installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt

echo [3/4] Running Migrations...
python manage.py makemigrations
python manage.py migrate

echo [4/4] Creating Default Superuser (admin / admin)...
echo from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin') | python manage.py shell

echo ==========================================
echo             Setup Complete!
echo ==========================================
echo To run the server, use: run_server.bat
pause
