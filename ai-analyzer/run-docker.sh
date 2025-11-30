#!/bin/bash

# Quick Docker setup script for Sentenex

echo "🚀 Sentenex Docker Setup"
echo "========================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ Created .env file"
        echo "⚠️  Please edit .env file and add your API keys:"
        echo "   - CMC_API_KEY"
        echo "   - OPENAI_API_KEY"
        echo ""
        read -p "Press Enter after you've added your API keys..."
    else
        echo "❌ env.example not found. Creating basic .env file..."
        cat > .env << EOF
CMC_API_KEY=your_cmc_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
EOF
        echo "✅ Created .env file"
        echo "⚠️  Please edit .env file and add your API keys"
        exit 1
    fi
fi

# Build and run
echo ""
echo "🔨 Building Docker image..."
docker-compose build

echo ""
echo "🚀 Starting Sentenex API..."
docker-compose up -d

echo ""
echo "⏳ Waiting for API to be ready..."
sleep 5

# Check health
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo ""
    echo "✅ Sentenex API is running!"
    echo ""
    echo "📍 API Endpoints:"
    echo "   - API: http://localhost:8000"
    echo "   - Docs: http://localhost:8000/docs"
    echo "   - Health: http://localhost:8000/api/health"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop: docker-compose down"
    echo "   - Restart: docker-compose restart"
else
    echo ""
    echo "⚠️  API might still be starting. Check logs with:"
    echo "   docker-compose logs -f"
fi

