#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Create / update an admin account from environment variables (free-tier
# friendly: no Shell needed). Idempotent and safe to run on every deploy.
python manage.py shell << 'PYEOF'
import os
from django.contrib.auth import get_user_model
from tracker.models import UserProfile

User = get_user_model()
username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")

if username and password:
    user, _ = User.objects.get_or_create(username=username, defaults={"email": email})
    user.email = email or user.email
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = "admin"
    profile.save()
    print(f"[build] Admin account ready: {username} (role=admin)")
else:
    print("[build] DJANGO_SUPERUSER_* env vars not set; skipping admin creation.")
PYEOF