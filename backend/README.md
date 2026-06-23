# Digital Event Expense Tracker

Minimal Django project implementing the digital event expense tracker architecture.

## Included files

- `tracker/models.py` — `UserProfile`, `Event`, `Category`, `Expense`, `Alert`, `Report`
- `tracker/admin.py` — Django admin registration and inlines
- `tracker/serializers.py` — DRF serializers
- `tracker/views.py` — DRF viewsets
- `tracker/permissions.py` — role-based DRF permissions
- `tracker/services.py` — multi-threshold alert generation
- `tracker/signals.py` — auto-create `UserProfile` and trigger alerts after expenses
- `tracker/urls.py` — router configuration
- `event_tracker_project/settings.py` — minimal settings for development

## Setup

### Environment is Ready
The virtual environment (`.venv`) has been created with Django 4.2.13 and DRF 3.14.0 installed.

### Database
All migrations have been applied. The SQLite database (`db.sqlite3`) is ready.

### Superuser
A superuser account has been created:
- **Username:** Karen
- **Email:** kinyuakaren03@gmail.com

### Start the Development Server
```powershell
venv\Scripts\activate  # or .venv\Scripts\activate if using .venv folder
python manage.py runserver
```

Then open http://127.0.0.1:8000/admin/ and log in with your superuser credentials.

### API Endpoints
Once the server is running, access the REST API at:
- `GET /api/events/` — List all events
- `POST /api/events/` — Create an event
- `GET /api/expenses/` — List expenses
- `POST /api/expenses/` — Record an expense
- `GET /api/alerts/` — View budget alerts
- `GET /api/reports/` — View reports

### Reinstalling Dependencies
If you need to reinstall in a fresh environment:
```powershell
pip install -r requirements.txt
python manage.py migrate
```
