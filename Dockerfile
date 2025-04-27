FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy project files
COPY . .

# Install dependencies
RUN python -m venv .venv
RUN uv pip install -e .

# Command to run the MCP server
CMD ["uv", "run", "src/main.py"]