"""
Views for user API.
"""
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from user.serializers import UserSerializer, LoginSerializer
from django.conf import settings


class CreateUserView(generics.CreateAPIView):
    """Create a new user in the system."""

    serializer_class = UserSerializer


class LoginView(APIView):
    """Login a user in the system."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data.get('email'),
            password=serializer.validated_data.get('password')
        )
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=401)

        refresh = RefreshToken.for_user(user)

        response = Response({
            'name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_superuser': user.is_superuser,
            'user_type': user.user_type,
            'permissions': list(user.get_all_permissions()),
        })

        response.set_cookie(
            'refresh',
            str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='None' if not settings.DEBUG else 'Lax'
        )

        response.set_cookie(
            'access',
            str(refresh.access_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='None' if not settings.DEBUG else 'Lax',
        )

        return response

    
class LogoutView(APIView):
    """Logout a user from the system."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('refresh')
        response.delete_cookie('access')
        return response
    
    
class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({'detail': 'No refresh token'}, status=401)

        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token
        except Exception:
            return Response({'detail': 'Token inválido'}, status=401)

        response = Response({'detail': 'Token refrescado'})

        response.set_cookie(
            'access',
            str(access),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax' if settings.DEBUG else 'Strict',
        )

        return response


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """Retrieve and return authenticated user."""
        return self.request.user
