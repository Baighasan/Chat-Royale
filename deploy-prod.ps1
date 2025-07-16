# Production Deployment Script for Chat Royale (Windows PowerShell)
param(
    [switch]$SkipEnvCheck
)

Write-Host "🚀 Starting production deployment..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
} catch {
    Write-Error "Docker Compose is not installed. Please install it and try again."
    exit 1
}

# Check for environment files
Write-Status "Checking environment files..."

if (-not (Test-Path "src/backend/.env")) {
    Write-Warning "Backend .env file not found. Creating from template..."
    if (Test-Path "src/backend/env.production.example") {
        Copy-Item "src/backend/env.production.example" "src/backend/.env"
        Write-Warning "Please edit src/backend/.env with your actual values before continuing."
        Read-Host "Press Enter after you've configured the environment variables"
    } else {
        Write-Error "Backend environment template not found. Please create src/backend/.env manually."
        exit 1
    }
}

if (-not (Test-Path "src/mcp/.env")) {
    Write-Warning "MCP .env file not found. Creating from template..."
    if (Test-Path "src/mcp/env.production.example") {
        Copy-Item "src/mcp/env.production.example" "src/mcp/.env"
        Write-Warning "Please edit src/mcp/.env with your actual values before continuing."
        Read-Host "Press Enter after you've configured the environment variables"
    } else {
        Write-Error "MCP environment template not found. Please create src/mcp/.env manually."
        exit 1
    }
}

# Set production environment
$env:NODE_ENV = "production"

# Stop existing containers
Write-Status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
Write-Status "Building and starting services in production mode..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
Write-Status "Waiting for services to be healthy..."
Start-Sleep -Seconds 30

# Check service health
Write-Status "Checking service health..."

# Check backend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "✅ Backend is healthy"
    } else {
        throw "Backend returned status code $($response.StatusCode)"
    }
} catch {
    Write-Error "❌ Backend health check failed"
    docker-compose logs chat-royale-backend
    exit 1
}

# Check MCP server health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/mcp" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "✅ MCP server is healthy"
    } else {
        throw "MCP server returned status code $($response.StatusCode)"
    }
} catch {
    Write-Warning "⚠️  MCP server health check failed (this might be expected if MCP doesn't have a health endpoint)"
}

# Check frontend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "✅ Frontend is healthy"
    } else {
        throw "Frontend returned status code $($response.StatusCode)"
    }
} catch {
    Write-Error "❌ Frontend health check failed"
    docker-compose logs chat-royale-frontend
    exit 1
}

Write-Status "🎉 Production deployment completed successfully!"
Write-Status "Frontend: http://localhost"
Write-Status "Backend API: http://localhost:3001"
Write-Status "MCP Server: http://localhost:8000"

# Show running containers
Write-Status "Running containers:"
docker-compose ps

Write-Host ""
Write-Status "To view logs: docker-compose logs -f [service-name]"
Write-Status "To stop services: docker-compose down" 