@echo off
echo Starting Potencialize OS Backend...
call venv\Scripts\activate
python manage.py runserver
pause
