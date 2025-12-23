# Potencialize OS - Backend

Backend em Python/Django para o sistema Potencialize OS.

## Requisitos
- Python 3.8+
- MySQL 8.0 (Produção/HostGator) ou SQLite (Desenvolvimento)

## Instalação

1. Crie um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz da pasta `backend` (ao lado do `manage.py`) com o seguinte conteúdo (para MySQL):
   ```env
   DEBUG=True
   DJANGO_SECRET_KEY=sua_chave_secreta_aqui
   DB_NAME=nome_do_banco
   DB_USER=usuario
   DB_PASSWORD=senha
   DB_HOST=localhost
   ```
   *Se não criar o arquivo .env, o sistema usará SQLite por padrão.*

4. Execute as migrações:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Crie um superusuário:
   ```bash
   python manage.py createsuperuser
   ```

6. Execute o servidor:
   ```bash
   python manage.py runserver
   ```

## Estrutura
- **apps/**: Contém os módulos do sistema (clientes, projetos, crm, etc).
- **potencialize_core/**: Configurações principais do projeto.
- **passenger_wsgi.py**: Arquivo de entrada para hospedagem na HostGator.

## Hospedagem (HostGator)
1. Suba os arquivos para a pasta do domínio.
2. Configure o Python App no cPanel.
3. Aponte o "Application startup file" para `passenger_wsgi.py`.
4. Instale as dependências via pip na interface do cPanel ou terminal SSH.
