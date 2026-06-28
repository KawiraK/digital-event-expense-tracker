from rest_framework import serializers
from .models import Event, Category, Expense, Alert, Report, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ("id", "user", "role")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "default_budget")


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = (
            "id",
            "event",
            "category",
            "vendor_name",
            "description",
            "amount",
            "incurred_at",
            "created_by",
        )
        read_only_fields = ("created_by",)

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["created_by"] = request.user
        return super().create(validated_data)


class EventSerializer(serializers.ModelSerializer):
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining_budget = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    spend_ratio = serializers.DecimalField(max_digits=6, decimal_places=2, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "name",
            "description",
            "organizer",
            "start_date",
            "end_date",
            "total_budget",
            "total_spent",
            "remaining_budget",
            "spend_ratio",
            "expenses",
        )
        read_only_fields = ("organizer", "total_spent", "remaining_budget", "spend_ratio", "expenses")


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ("id", "event", "triggered_at", "threshold", "message", "is_resolved")
        read_only_fields = ("triggered_at",)


class ReportSerializer(serializers.ModelSerializer):
    data = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = Report
        fields = ("id", "event", "generated_at", "report_type", "data", "created_by")
        read_only_fields = ("generated_at", "created_by")
