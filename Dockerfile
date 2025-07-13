FROM python:3.9-slim-bullseye
LABEL maintainer="siscap.com"

ENV PYTHONUNBUFFERED=1

COPY ./backend/requirements.txt /tmp/requirements.txt
COPY ./backend/requirements.dev.txt /tmp/requirements.dev.txt
COPY ./backend /src
WORKDIR /src
EXPOSE 8000

ARG DEV=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    postgresql-client \
    libpq-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libgdk-pixbuf2.0-dev \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    fontconfig \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /py && \
    /py/bin/pip install --upgrade pip && \
    /py/bin/pip install -r /tmp/requirements.txt && \
    /py/bin/pip install WeasyPrint && \
    if [ "$DEV" = true ]; then \
        /py/bin/pip install -r /tmp/requirements.dev.txt ; \
    fi && \
    rm -rf /tmp

RUN adduser --disabled-password --no-create-home django-user && \
    mkdir -p /vol/web/media && \
    mkdir -p /vol/web/static && \
    chown -R django-user:django-user /vol && \
    chmod -R 755 /vol

ENV PATH="/py/bin:$PATH"

USER django-user
