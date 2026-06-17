# myapp/utils.py
import logging
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    request = context.get('request', None)

    if response is None:
        # Error no manejado por DRF — lo capturamos aquí
        logger.exception(
            "Error no manejado en %s %s",
            request.method,
            request.path,
        )
    else:
        # Error manejado por DRF (404, 403, 400, etc.)
        logger.error(
            "[%s] %s %s - %s",
            response.status_code,
            request.method,
            request.path,
            response.data,
        )

    return response
