# Build stage for compiling and installing dependencies
FROM python:3.10-slim-bullseye AS build-stage

LABEL maintainer="Team Git Happens"
LABEL description="GenAI Service Optimized Docker Image"

# Set environment variables to optimize Python in Docker
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DEFAULT_TIMEOUT=100 \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpoppler-cpp-dev \
    pkg-config \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a virtual environment to isolate dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and setuptools
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy just the requirements file first to leverage Docker cache
COPY requirements.txt .

# Use pip-tools to compile requirements and generate a lockfile
RUN pip install --no-cache-dir pip-tools && \
    pip-compile requirements.txt -o requirements.lock && \
    pip install --no-cache-dir -r requirements.lock && \
    # Remove temporary files to reduce image size
    rm -rf /tmp/* ~/.cache/pip

# Second stage: Runtime
FROM python:3.10-slim-bullseye AS runtime-stage

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

WORKDIR /app

# Install only runtime dependencies (no dev packages needed)
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    libpoppler-cpp-dev \
    tini \
    ca-certificates \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from build stage
COPY --from=build-stage /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy the compiled requirements and dependency lockfile for reference
COPY --from=build-stage /app/requirements.lock /app/

# Copy only necessary application code
COPY main.py ChatWebUI.py ./

# Pre-download the sentence transformer model to include it in the image
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Create a non-root user for security
RUN groupadd -g 1000 appuser && \
    useradd -u 1000 -g appuser -s /bin/bash -m appuser && \
    chown -R appuser:appuser /app

USER appuser

# Define a healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

EXPOSE 8000

# Use Tini as init system to properly handle signals
ENTRYPOINT ["/usr/bin/tini", "--"]

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
