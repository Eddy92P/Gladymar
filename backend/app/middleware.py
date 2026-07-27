"""Temporary diagnostic middleware."""
import os
import time

from django.db import connection


class QueryTimingMiddleware:
    """Report DB time vs. total request time via response headers.

    Only active when the DEBUG_QUERY_HEADERS env var is set, so it's
    safe to ship and stays inert in normal production traffic. Turn it
    on temporarily to tell whether a slow endpoint is actually
    DB-bound (X-Db-Query-Time-Ms close to X-Request-Duration-Ms) or if
    the time is going somewhere else entirely.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.enabled = os.environ.get(
            'DEBUG_QUERY_HEADERS', '').lower() in ('1', 'true', 'yes')

    def __call__(self, request):
        if not self.enabled:
            return self.get_response(request)

        stats = {'count': 0, 'time': 0.0}

        def wrapper(execute, sql, params, many, context):
            start = time.perf_counter()
            try:
                return execute(sql, params, many, context)
            finally:
                stats['count'] += 1
                stats['time'] += time.perf_counter() - start

        start_total = time.perf_counter()
        with connection.execute_wrapper(wrapper):
            response = self.get_response(request)
        total_time = time.perf_counter() - start_total

        response['X-Request-Duration-Ms'] = f'{total_time * 1000:.1f}'
        response['X-Db-Query-Count'] = str(stats['count'])
        response['X-Db-Query-Time-Ms'] = f'{stats["time"] * 1000:.1f}'
        return response
