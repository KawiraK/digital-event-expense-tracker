from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils import timezone

ROLE_CHOICES = [
    ("organizer", "Organizer"),
    ("finance_manager", "Finance Manager"),
    ("admin", "Admin"),
]

CATEGORY_CHOICES = [
    ("venue", "Venue"),
    ("catering", "Catering"),
    ("decoration", "Decoration"),
    ("transport", "Transport"),
    ("entertainment", "Entertainment"),
    ("contingency", "Contingency"),
]


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="organizer")

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Event(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organized_events",
    )
    start_date = models.DateField()
    end_date = models.DateField()
    total_budget = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def total_spent(self):
        return self.expenses.aggregate(total=models.Sum("amount"))["total"] or Decimal("0.00")

    @property
    def remaining_budget(self):
        return self.total_budget - self.total_spent

    @property
    def spend_ratio(self):
        if self.total_budget == 0:
            return Decimal("0.00")
        return (self.total_spent / self.total_budget) * Decimal("100.00")

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=50, choices=CATEGORY_CHOICES, unique=True)
    default_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.get_name_display()


class Expense(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="expenses")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="expenses")
    vendor_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    incurred_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_expenses",
    )

    class Meta:
        ordering = ["-incurred_at"]

    def __str__(self):
        return f"{self.vendor_name} - {self.amount}"


class Alert(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="alerts")
    triggered_at = models.DateTimeField(auto_now_add=True)
    threshold = models.DecimalField(max_digits=5, decimal_places=2, help_text="Threshold percent")
    message = models.CharField(max_length=255)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-triggered_at"]
        unique_together = (("event", "threshold"),)

    def __str__(self):
        return f"{self.event.name} alert @{self.threshold}%"


class Report(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="reports")
    generated_at = models.DateTimeField(auto_now_add=True)
    report_type = models.CharField(max_length=100)
    data = models.JSONField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="generated_reports",
    )

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"{self.event.name} report ({self.report_type})"
