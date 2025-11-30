# Docker Setup Guide for Sentenex

This guide will help you run Sentenex in a Docker container.

## Prerequisites

- Docker installed on your system ([Download Docker](https://www.docker.com/products/docker-desktop/))
- Docker Compose (usually included with Docker Desktop)
- CoinMarketCap API key
- OpenAI API key

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Create a `.env` file** in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your API keys:
   ```env
   CMC_API_KEY=your_actual_cmc_api_key
   OPENAI_API_KEY=your_actual_openai_api_key
   ```

3. **Build and run**:
   ```bash
   docker-compose up -d
   ```

4. **Check if it's running**:
   ```bash
   docker-compose ps
   ```

5. **View logs**:
   ```bash
   docker-compose logs -f
   ```

6. **Stop the container**:
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker directly

1. **Build the Docker image**:
   ```bash
   docker build -t sentenex-api .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name sentenex-api \
     -p 8000:8000 \
     -e CMC_API_KEY=your_cmc_api_key \
     -e OPENAI_API_KEY=your_openai_api_key \
     sentenex-api
   ```

   Or use a `.env` file:
   ```bash
   docker run -d \
     --name sentenex-api \
     -p 8000:8000 \
     --env-file .env \
     sentenex-api
   ```

3. **Check if it's running**:
   ```bash
   docker ps
   ```

4. **View logs**:
   ```bash
   docker logs -f sentenex-api
   ```

5. **Stop the container**:
   ```bash
   docker stop sentenex-api
   docker rm sentenex-api
   ```

## Testing the API

Once the container is running, test the API:

```bash
# Health check
curl http://localhost:8000/api/health

# Root endpoint
curl http://localhost:8000/

# Activate agent
curl -X POST http://localhost:8000/api/activate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "APT",
    "stablecoin": "USDC",
    "portfolio_amount": 100.0,
    "risk_level": "moderate"
  }'
```

## Accessing the API

- **API Base URL**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

## Troubleshooting

### Container won't start

1. **Check logs**:
   ```bash
   docker-compose logs
   # or
   docker logs sentenex-api
   ```

2. **Verify environment variables**:
   ```bash
   docker exec sentenex-api env | grep API_KEY
   ```

3. **Check if port 8000 is already in use**:
   ```bash
   lsof -i :8000  # macOS/Linux
   netstat -ano | findstr :8000  # Windows
   ```

### API returns errors

1. **Verify API keys are correct** in your `.env` file
2. **Check container health**:
   ```bash
   docker-compose ps
   # Should show "healthy" status
   ```

3. **Restart the container**:
   ```bash
   docker-compose restart
   ```

### Rebuild after code changes

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production, consider:

1. **Use environment variables** instead of `.env` file
2. **Add reverse proxy** (nginx) in front
3. **Use Docker secrets** for sensitive data
4. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```

## Files Included

- `Dockerfile` - Docker image definition
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build
- `.env.example` - Example environment variables file

## Support

If you encounter issues, check:
1. Docker is running: `docker --version`
2. Port 8000 is available
3. API keys are valid
4. Container logs for errors

