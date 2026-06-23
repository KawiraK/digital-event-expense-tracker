from decimal import Decimal
from django.db import models
from django.utils import timezone
from .models import Alert

DEFAULT_ALERT_THRESHOLDS = [Decimal("50.00"), Decimal("75.00"), Decimal("90.00"), Decimal("100.00")]


def calculate_spend_percentage(event):
    total_spent = event.expenses.aggregate(total=models.Sum("amount"))["total"] or Decimal("0.00")
    if event.total_budget == 0:
        return Decimal("0.00")
    return (total_spent / event.total_budget) * Decimal("100.00")


def create_threshold_alerts(event, thresholds=None):
    thresholds = thresholds or DEFAULT_ALERT_THRESHOLDS
    percent_spent = calculate_spend_percentage(event)
    created_alerts = []

    for threshold in sorted(thresholds):
        if percent_spent >= threshold:
            message = (
                f"Event budget has reached {percent_spent:.2f}% of total budget, "
                f"crossing the {threshold:.0f}% threshold."
            )
            alert, created = Alert.objects.get_or_create(
                event=event,
                threshold=threshold,
                defaults={
                    "message": message,
                    "triggered_at": timezone.now(),
                    "is_resolved": False,
                },
            )
            if not created and alert.is_resolved:
                alert.is_resolved = False
                alert.message = message
                alert.triggered_at = timezone.now()
                alert.save()
            created_alerts.append(alert)

    return created_alerts
