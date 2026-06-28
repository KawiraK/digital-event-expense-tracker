from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    CategoryViewSet,
    ExpenseViewSet,
    AlertViewSet,
    ReportViewSet,
    csrf_view,
    register_view,
    login_view,
    logout_view,
    me_view,
)

router = DefaultRouter()
router.register(r"events", EventViewSet, basename="event")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"alerts", AlertViewSet, basename="alert")
router.register(r"reports", ReportViewSet, basename="report")

auth_urlpatterns = [
    path("csrf/", csrf_view),
    path("register/", register_view),
    path("login/", login_view),
    path("logout/", logout_view),
    path("me/", me_view),
]

urlpatterns = [
    path("api/auth/", include(auth_urlpatterns)),
    path("api/", include(router.urls)),
]