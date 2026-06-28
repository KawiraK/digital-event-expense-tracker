from django.contrib import admin
from .models import UserProfile, Event, Category, Expense, Alert, Report


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email")


class ExpenseInline(admin.TabularInline):
    model = Expense
    extra = 0
    readonly_fields = ("vendor_name", "amount", "incurred_at", "created_by")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "organizer",
        "start_date",
        "end_date",
        "total_budget",
        "total_spent",
        "remaining_budget",
    )
    list_filter = ("start_date", "end_date", "organizer")
    search_fields = ("name", "organizer__username")
    readonly_fields = ("total_spent", "remaining_budget")
    inlines = (ExpenseInline,)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "default_budget")
    search_fields = ("name",)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "event",
        "category",
        "vendor_name",
        "amount",
        "incurred_at",
        "created_by",
    )
    list_filter = ("category", "event", "incurred_at")
    search_fields = ("vendor_name", "description", "event__name")
    raw_id_fields = ("event", "created_by")


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("event", "threshold", "triggered_at", "is_resolved")
    list_filter = ("threshold", "is_resolved")
    search_fields = ("event__name", "message")


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("event", "report_type", "generated_at", "created_by")
    list_filter = ("report_type", "generated_at")
    search_fields = ("event__name", "report_type")
    readonly_fields = ("data",)
