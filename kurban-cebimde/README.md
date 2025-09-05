# 🐑 Kurban Cebimde - Complete Project

**Kurban Cebimde** is a comprehensive kurban donation platform that enables users to make religious donations and receive digital certificates. The project consists of a mobile application, admin panel, and a production-ready backend API.

## 🏗️ Project Architecture

```
kurban-cebimde/
├── backend/                 # FastAPI Backend API
├── admin-panel/            # React Admin Panel
├── src/                    # React Native Mobile App
├── assets/                 # Static assets
└── docs/                   # Documentation
```

## 🚀 Features

### Mobile Application (React Native)
- **User Authentication**: Registration, login, password reset
- **Donation Management**: Create and manage kurban donations
- **Payment Processing**: Integrated with Stripe and iyzico
- **Certificate Generation**: Digital kurban certificates
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Local data caching

### Admin Panel (React + TypeScript)
- **Dashboard**: Real-time statistics and monitoring
- **User Management**: User administration and verification
- **Order Management**: Donation order processing
- **Payment Tracking**: Payment status monitoring
- **Certificate Management**: Certificate generation and distribution
- **Analytics**: Detailed reporting and insights

### Backend API (FastAPI)
- **Production-Ready**: Scalable, secure, and monitored
- **Authentication**: JWT-based with role-based access control
- **Payment Integration**: Stripe and iyzico support
- **File Storage**: S3/MinIO with presigned URLs
- **Background Tasks**: Celery for async processing
- **Real-time Communication**: WebSocket support
- **Monitoring**: Prometheus + Grafana integration
- **Security**: Rate limiting, CORS, secure headers

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache & Queue**: Redis + Celery
- **File Storage**: MinIO (S3 compatible)
- **Payment**: Stripe + iyzico
- **Monitoring**: Prometheus + Grafana + Sentry
- **Testing**: pytest + httpx
- **Documentation**: Auto-generated OpenAPI/Swagger

### Frontend (Admin Panel)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Headless UI + Heroicons

### Mobile App
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State Management**: Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI**: Native Base + React Native Elements

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for admin panel)
- Python 3.12+ (for backend development)
- Expo CLI (for mobile development)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/kurban-cebimde.git
cd kurban-cebimde
```

### 2. Backend Setup
```bash
cd backend

# Copy environment file
cp env.example .env

# Start all services
make up

# Run migrations
make migrate

# Create test data
python scripts/create_test_data.py

# Check health
make health
```

### 3. Admin Panel Setup
```bash
cd admin-panel

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Mobile App Setup
```bash
# Install Expo CLI
npm install -g @expo/cli

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

## 🔧 Development Commands

### Backend
```bash
cd backend

# Development
make dev              # Start development server
make test             # Run tests
make lint             # Code linting
make fmt              # Code formatting
make migrate          # Run database migrations
make revision         # Create new migration

# Docker
make up               # Start all services
make down             # Stop all services
make logs             # View logs
make rebuild          # Rebuild containers

# Monitoring
make monitoring       # Start monitoring stack
make health           # Check service health
```

### Admin Panel
```bash
cd admin-panel

npm run dev           # Development server
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # ESLint
npm run type-check    # TypeScript check
```

### Mobile App
```bash
npx expo start        # Start Expo development server
npx expo build        # Build for production
npx expo publish      # Publish to Expo
```

## 🌐 Service URLs

After starting the services:

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:3000
- **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)
- **MailHog**: http://localhost:8025

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update current user
- `GET /api/v1/users/me/donations` - Get user donations
- `GET /api/v1/users/me/certificates` - Get user certificates

### Orders
- `POST /api/v1/orders/` - Create donation order
- `GET /api/v1/orders/` - Get user orders
- `GET /api/v1/orders/{order_id}` - Get specific order
- `PUT /api/v1/orders/{order_id}/niyet` - Confirm niyet

### Payments
- `POST /api/v1/payments/intent` - Create payment intent
- `GET /api/v1/payments/{payment_id}` - Get payment details
- `GET /api/v1/payments/` - Get user payments

### Certificates
- `POST /api/v1/certificates/` - Create certificate
- `GET /api/v1/certificates/` - Get user certificates
- `GET /api/v1/certificates/{certificate_id}/download` - Download certificate

### Files
- `POST /api/v1/files/presign-upload` - Get upload URL
- `GET /api/v1/files/presign-download/{file_key}` - Get download URL

### WebSocket
- `GET /ws/user/{user_id}` - User-specific updates
- `GET /ws/admin` - Admin broadcasts

## 🔐 Security Features

- **JWT Authentication**: Access and refresh tokens
- **Role-Based Access Control**: User and admin roles
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request control
- **Input Validation**: Pydantic schema validation
- **Password Hashing**: BCrypt with salt
- **Secure Headers**: HSTS, CSP, XSS protection
- **Webhook Verification**: Signature validation

## 📈 Monitoring & Observability

### Metrics
- Request rate and response times
- Error rates and status codes
- Database connection pool status
- Redis cache hit rates
- Payment success rates
- Certificate generation metrics

### Logging
- Structured logging with structlog
- Request/response logging
- Error tracking with Sentry
- Performance monitoring

### Health Checks
- Database connectivity
- Redis connectivity
- External service status
- Application health endpoints

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run integration tests
pytest tests/integration/
```

### Frontend Tests
```bash
cd admin-panel

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Environment Variables
```bash
# Copy production environment
cp env.example .env.prod

# Update with production values
APP_ENV=production
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port
S3_ENDPOINT=https://your-s3-endpoint
STRIPE_SECRET_KEY=sk_live_...
SENTRY_DSN=https://...
```

### Docker Production Build
```bash
# Build production image
docker build -t kurban-cebimde:latest .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline
The project includes GitHub Actions workflows for:
- Automated testing
- Code quality checks
- Security scanning
- Docker image building
- Automated deployment

## 📚 Documentation

- **API Documentation**: http://localhost:8000/docs
- **Backend README**: [backend/README.md](backend/README.md)
- **Admin Panel README**: [admin-panel/README.md](admin-panel/README.md)
- **Architecture Docs**: [docs/architecture.md](docs/architecture.md)
- **Deployment Guide**: [docs/deployment.md](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/kurban-cebimde/issues)
- **Documentation**: [Project Wiki](https://github.com/your-org/kurban-cebimde/wiki)
- **Email**: support@kurbancebimde.com

## 🙏 Acknowledgments

- FastAPI community for the excellent framework
- React Native and Expo teams
- All contributors and supporters

---

**Kurban Cebimde** - Making religious donations accessible and transparent in the digital age. 🐑✨
