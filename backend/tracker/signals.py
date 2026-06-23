from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserProfile, Expense
from .services import create_threshold_alerts

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance, role="organizer")


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "userprofile"):
        instance.userprofile.save()


@receiver(post_save, sender=Expense)
def expense_post_save(sender, instance, created, **kwargs):
    if created:
        create_threshold_alerts(instance.event)
