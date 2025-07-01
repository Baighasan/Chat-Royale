FROM python:3.12-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install uv
RUN pip install uv

# Copy only the MCP application files
COPY pyproject.toml uv.lock ./
COPY src/ ./src/

# Install dependencies and switch to non-root user
RUN python -m venv .venv && \
    . .venv/bin/activate && \
    uv pip install -e . && \
    chown -R appuser:appuser /app

USER appuser

# Command to run the MCP server
CMD ["uv", "run", "src/main.py"]