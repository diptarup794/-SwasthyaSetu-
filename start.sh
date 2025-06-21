#!/bin/bash

# SwasthyaSetu Healthcare Platform Startup Script
# This script helps you set up and run the platform quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed!"
}

# Function to check Node.js version
check_node_version() {
    local node_version=$(node -v | cut -d'v' -f2)
    local major_version=$(echo $node_version | cut -d'.' -f1)
    
    if [ "$major_version" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $node_version"
        exit 1
    fi
    
    print_success "Node.js version $node_version is compatible!"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Created .env file from .env.example"
            print_warning "Please edit .env file with your configuration before continuing"
        else
            print_error ".env.example file not found!"
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    npm install
    
    print_status "Installing frontend dependencies..."
    cd client
    npm install
    cd ..
    
    print_success "All dependencies installed!"
}

# Function to start services
start_services() {
    print_status "Starting services with Docker Compose..."
    
    # Start database services first
    print_status "Starting database services..."
    docker-compose up -d mongo redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Start all services
    print_status "Starting all services..."
    docker-compose up -d
    
    print_success "All services started!"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:5000/health >/dev/null 2>&1; then
            print_success "Backend API is healthy!"
            break
        fi
        
        print_status "Waiting for backend API... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Backend API failed to start properly"
        exit 1
    fi
    
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend is healthy!"
            break
        fi
        
        print_status "Waiting for frontend... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Frontend failed to start properly"
        exit 1
    fi
}

# Function to display access information
display_access_info() {
    echo ""
    echo "🎉 SwasthyaSetu Healthcare Platform is now running!"
    echo ""
    echo "📱 Access URLs:"
    echo "   Frontend:     http://localhost:3000"
    echo "   Backend API:  http://localhost:5000"
    echo "   Health Check: http://localhost:5000/health"
    echo ""
    echo "📊 Monitoring:"
    echo "   Grafana:      http://localhost:3001 (admin/admin)"
    echo "   Prometheus:   http://localhost:9090"
    echo "   Kibana:       http://localhost:5601"
    echo ""
    echo "🔧 Management:"
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo ""
    echo "📚 Documentation:"
    echo "   README:       https://github.com/swasthya-setu/README.md"
    echo "   API Docs:     http://localhost:5000/api-docs"
    echo ""
}

# Function to run in development mode
run_development() {
    print_status "Starting in development mode..."
    
    # Start database services
    docker-compose up -d mongo redis
    
    # Wait for databases
    sleep 5
    
    # Start backend in development mode
    print_status "Starting backend server..."
    npm run dev &
    local backend_pid=$!
    
    # Start frontend in development mode
    print_status "Starting frontend server..."
    cd client
    npm start &
    local frontend_pid=$!
    cd ..
    
    print_success "Development servers started!"
    echo ""
    echo "🔧 Development Mode:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user interrupt
    trap "kill $backend_pid $frontend_pid; docker-compose down; exit" INT
    wait
}

# Function to show help
show_help() {
    echo "SwasthyaSetu Healthcare Platform Startup Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -d, --dev      Run in development mode"
    echo "  -p, --prod     Run in production mode (default)"
    echo "  -s, --setup    Only setup environment and install dependencies"
    echo "  -c, --check    Only check prerequisites and health"
    echo ""
    echo "Examples:"
    echo "  $0              # Start in production mode"
    echo "  $0 --dev        # Start in development mode"
    echo "  $0 --setup      # Setup environment only"
    echo ""
}

# Main script logic
main() {
    local mode="production"
    local setup_only=false
    local check_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--dev)
                mode="development"
                shift
                ;;
            -p|--prod)
                mode="production"
                shift
                ;;
            -s|--setup)
                setup_only=true
                shift
                ;;
            -c|--check)
                check_only=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🏥 SwasthyaSetu Healthcare Platform"
    echo "=================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    check_node_version
    
    if [ "$check_only" = true ]; then
        print_success "Prerequisites check completed!"
        exit 0
    fi
    
    # Setup environment
    setup_environment
    
    if [ "$setup_only" = true ]; then
        install_dependencies
        print_success "Setup completed! Edit .env file and run again to start services."
        exit 0
    fi
    
    # Install dependencies
    install_dependencies
    
    # Start services based on mode
    if [ "$mode" = "development" ]; then
        run_development
    else
        start_services
        check_health
        display_access_info
    fi
}

# Run main function with all arguments
main "$@" 