FROM python:3.12-slim

# Create a non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install uv
RUN pip install uv

# Copy the entire application
COPY . .

# Install dependencies and switch to non-root user
RUN python -m venv .venv && \
    . .venv/bin/activate && \
    uv pip install -e . && \
    chown -R appuser:appuser /app

USER appuser

# Command to run the MCP server
CMD ["uv", "run", "src/main.py"]