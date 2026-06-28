# Digital Event Expense Tracker

A full-stack web application for tracking event expenses, managing budgets, and generating financial reports for event organisers and companies.

## Tech Stack
- **Backend:** Django 4.2 + Django REST Framework
- **Frontend:** React 18 + Vite
- **Database:** SQLite
- **Authentication:** Django Session Authentication

## Project Structure
```
digital-event-expense-tracker/
├── backend/    Django REST API
└── frontend/   React Application
```

## Setup Instructions

### Requirements
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Backend runs at: http://127.0.0.1:8000

### Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## User Roles
| Role | Permissions |
|------|-------------|
| organizer | Create/manage own events, record expenses |
| finance_manager | View all events, record expenses, view alerts, generate reports |
| admin | Full access to everything |

To change a user role:
```bash
python manage.py shell
```
```python
from django.contrib.auth.models import User
u = User.objects.get(username='yourusername')
u.userprofile.role = 'finance_manager'
u.userprofile.save()
exit()
```

## Features
- User registration and login with role-based access control
- Create and manage events with budget tracking
- Record expenses by category with vendor details
- Automatic budget alerts at 50%, 75%, 90%, and 100% thresholds
- Generate financial reports with category breakdown
- Real-time budget progress bars
- Dashboard with summary statistics
