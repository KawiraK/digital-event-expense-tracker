from django.db import migrations

# The six categories the app supports (must match CATEGORY_CHOICES in models.py).
CATEGORIES = [
    "venue",
    "catering",
    "decoration",
    "transport",
    "entertainment",
    "contingency",
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model("tracker", "Category")
    for name in CATEGORIES:
        Category.objects.get_or_create(name=name, defaults={"default_budget": 0})


def unseed_categories(apps, schema_editor):
    Category = apps.get_model("tracker", "Category")
    Category.objects.filter(name__in=CATEGORIES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("tracker", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_categories, unseed_categories),
    ]
