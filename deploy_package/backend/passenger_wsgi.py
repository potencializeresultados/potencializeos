import os
import sys

# Adiciona o diretório do projeto ao path do Python
sys.path.insert(0, os.path.dirname(__file__))

# Define o módulo de settings
os.environ['DJANGO_SETTINGS_MODULE'] = 'potencialize_core.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
