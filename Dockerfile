FROM python:3.12-slim

WORKDIR /app

# Copy project files
COPY requirements.txt server.py ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the MCP server
CMD ["python", "server.py"]