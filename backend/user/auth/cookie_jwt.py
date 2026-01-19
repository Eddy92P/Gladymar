from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)

        if header is None:
            raw_token = request.COOKIES.get('access')
            if not raw_token:
                return None

            try:
                validated_token = self.get_validated_token(raw_token)
            except Exception:
                return None

            return self.get_user(validated_token), validated_token

        return super().authenticate(request)
