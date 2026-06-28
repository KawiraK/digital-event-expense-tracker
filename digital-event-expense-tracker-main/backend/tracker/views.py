from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from rest_framework import permissions, viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Event, Category, Expense, Alert, Report
from .permissions import IsOrganizerOrAdmin, IsFinanceManagerOrAdmin, IsOrganizerFinanceOrAdmin
from .serializers import (
    EventSerializer,
    CategorySerializer,
    ExpenseSerializer,
    AlertSerializer,
    ReportSerializer,
)


# ──────────────────────────────────────────
# Auth views
# ──────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_view(request):
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not username or not password or not email:
        return Response(
            {'detail': 'username, email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'detail': 'A user with that username already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'detail': 'A user with that email already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response(
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.userprofile.role,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '')
    password = request.data.get('password', '')

    if not username or not password:
        return Response(
            {'detail': 'username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {'detail': 'Invalid username or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.userprofile.role,
    })


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'detail': 'Successfully logged out.'})


@api_view(['GET'])
def me_view(request):
    if not request.user.is_authenticated:
        return Response({'detail': 'Not authenticated.'}, status=status.HTTP_403_FORBIDDEN)
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.userprofile.role,
    })


# ──────────────────────────────────────────
# Resource viewsets
# ──────────────────────────────────────────

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().select_related('organizer')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganizerOrAdmin]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().select_related('event', 'category', 'created_by')
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganizerFinanceOrAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Alert.objects.all().select_related('event')
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated, IsFinanceManagerOrAdmin]

    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.is_resolved = True
        alert.save()
        return Response(AlertSerializer(alert).data)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all().select_related('event', 'created_by')
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsFinanceManagerOrAdmin]

    def perform_create(self, serializer):
        event = serializer.validated_data['event']
        expenses = event.expenses.select_related('category')

        by_category = {}
        for expense in expenses:
            cat = expense.category.name
            by_category[cat] = round(by_category.get(cat, 0) + float(expense.amount), 2)

        generated_data = {
            'event_name': event.name,
            'total_budget': float(event.total_budget),
            'total_spent': float(event.total_spent),
            'remaining_budget': float(event.remaining_budget),
            'spend_ratio': float(event.spend_ratio),
            'by_category': by_category,
            'expense_count': expenses.count(),
        }
        serializer.save(created_by=self.request.user, data=generated_data)
