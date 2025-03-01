# Platform 5 - Advanced AI Management Platform

![Platform 5 Logo](https://img.shields.io/badge/Platform%205-Advanced%20AI%20Management-blue?style=for-the-badge&logo=artificial-intelligence)

> **Platform 5** is a unified web interface that centralizes multiple AI providers into organized "Galaxies" - specialized workspaces for different AI interactions and workflows.

## 🌟 Features

- **🌌 Galaxy System**: Organize AI interactions by context and purpose
- **🔐 Authentication**: Secure user management with JWT tokens
- **🎨 Modern UI**: Beautiful, responsive design with dark/light mode
- **🔄 Real-time**: Live conversation updates and status monitoring
- **📱 PWA Ready**: Progressive Web App capabilities for mobile use
- **🔌 Multi-Provider**: Support for OpenAI, Anthropic, Local AI, and more

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Platform5
   ```

2. **Backend Setup**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the Backend** (Terminal 1)
   ```bash
   # From project root directory
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start the Frontend** (Terminal 2)
   ```bash
   # From frontend directory
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5100
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/v1/docs

## 🔑 Test Credentials

For development and testing:

| Role  | Email             | Password |
|-------|------------------|----------|
| Admin | admin@cenai.com  | admin123 |
| User  | user@cenai.com   | user123  |

## 📁 Project Structure

```
Platform5/
├── app/                          # Backend application
│   ├── api/                      # API routes
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── galaxies.py          # Galaxy management
│   │   └── conversations.py     # Chat conversations
│   ├── core/                    # Core functionality
│   │   ├── config.py            # Application settings
│   │   └── database.py          # Database configuration
│   └── models/                  # Data models
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Application pages
│   │   ├── store/               # State management (Zustand)
│   │   └── types/               # TypeScript definitions
│   ├── public/                  # Static assets
│   └── package.json             # Frontend dependencies
├── .env                         # Environment variables
├── main.py                      # FastAPI application entry
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation and settings
- **Uvicorn** - ASGI server for production
- **JWT** - Secure authentication tokens

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Heroicons** - Beautiful SVG icons

## 🌌 Galaxy System

Platform 5 organizes AI interactions into "Galaxies" - themed workspaces that group related conversations and AI models:

- **🤖 ChatGPT Galaxy**: OpenAI GPT models for general conversations
- **🎭 Claude Galaxy**: Anthropic Claude for thoughtful responses
- **🏠 Local AI Galaxy**: Self-hosted models via Ollama/LM Studio
- **🔬 Analysis Galaxy**: Data analysis and research tasks
- **🎨 Creative Galaxy**: Content creation and artistic projects

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Environment
ENVIRONMENT=development

# Database
DATABASE_URL=sqlite:///./platform5.db

# Security
SECRET_KEY=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# API Settings
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:5100"]

# AI Provider API Keys (Optional)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Port Configuration

- **Frontend**: Port 5100 (configurable in `vite.config.ts`)
- **Backend**: Port 8000 (configurable in `main.py`)

## 📚 API Documentation

The backend provides interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User authentication |
| GET | `/api/v1/galaxies` | List all galaxies |
| GET | `/api/v1/galaxies/{id}` | Get specific galaxy |
| GET | `/api/v1/conversations` | List conversations |
| POST | `/api/v1/conversations` | Create new conversation |

## 🚀 Deployment

### Production Backend

```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Production Frontend

```bash
# Build for production
cd frontend
npm run build

# Serve static files (with nginx, apache, etc.)
# Files will be in frontend/dist/
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app
WORKDIR /app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on port 8000
   lsof -ti:8000 | xargs kill -9
   
   # Kill processes on port 5100
   lsof -ti:5100 | xargs kill -9
   ```

2. **CORS Issues**
   - Ensure frontend URL is in `CORS_ORIGINS` in `.env`
   - Check that ports match in configuration files

3. **Authentication Issues**
   - Verify `SECRET_KEY` is set in `.env`
   - Check that backend is running and accessible

### Development Tips

- Use browser dev tools to monitor network requests
- Check backend logs for API errors
- Frontend state can be inspected with React DevTools
- Database can be examined at `./platform5.db` (SQLite browser)

## 📞 Support

For support and questions:

- 📧 Email: ahilxdesigns@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/platform5/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/platform5/discussions)

---

**Made with ❤️ by the Thousif**

> Centralizing AI, Simplifying Innovation