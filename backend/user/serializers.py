"""
Serializers for the user API view.
"""
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext as _

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the user object."""
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ('email', 'password', 'first_name', 'last_name', 'ci', 'phone', 'address', 'agency', 'permissions')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 5}}

    def create(self, validated_data):
        """Create and return a user with encrypted password."""
        return get_user_model().objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update and return user."""
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user

    def get_permissions(self, obj):
        """Get user permissions."""
        # Get both user-specific permissions and group permissions
        user_permissions = list(obj.user_permissions.all().values_list('codename', flat=True))
        group_permissions = list(obj.groups.all().values_list('permissions__codename', flat=True))
        
        # Combine and remove duplicates
        all_permissions = list(set(user_permissions + group_permissions))
        return all_permissions


class AuthTokenSerializer(serializers.Serializer):
    """Serializer for the user auth token."""
    email = serializers.CharField()
    password = serializers.CharField(
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    def validate(self, attrs):
        """Validate and authenticate the user."""
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'),
                            username=email, password=password)

        if not user:
            msg = _('Unable to authenticate with provided credentials.')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs
