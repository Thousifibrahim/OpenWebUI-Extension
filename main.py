"""
Minimal FastAPI app for testing authentication
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5100", "http://127.0.0.1:5100"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

@app.get("/")
def root():
    return {"message": "CenAI API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """Login endpoint"""
    if credentials.email == "admin@cenai.com" and credentials.password == "admin123":
        return LoginResponse(
            access_token="mock_token_admin_123456789",
            token_type="bearer",
            user=User(
                id=1,
                email="admin@cenai.com",
                full_name="CenAI Admin",
                is_active=True,
                created_at="2025-10-04T00:00:00"
            )
        )
    elif credentials.email == "user@cenai.com" and credentials.password == "user123":
        return LoginResponse(
            access_token="mock_token_user_123456789",
            token_type="bearer",
            user=User(
                id=2,
                email="user@cenai.com",
                full_name="CenAI User",
                is_active=True,
                created_at="2025-10-04T00:00:00"
            )
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/v1/galaxies")
def get_galaxies():
    """Get all galaxies"""
    return [
        {
            "id": 1,
            "name": "ChatGPT Galaxy",
            "description": "OpenAI GPT models for general conversations",
            "icon": "🤖",
            "color": "#10a37f",
            "system_prompt": "You are a helpful AI assistant.",
            "is_active": True,
            "created_at": "2025-09-30T00:00:00"
        },
        {
            "id": 2,
            "name": "Claude Galaxy",
            "description": "Anthropic Claude models for thoughtful responses",
            "icon": "🎭",
            "color": "#d4a574",
            "system_prompt": "You are Claude, an AI assistant created by Anthropic.",
            "is_active": True,
            "created_at": "2025-09-30T00:00:00"
        },
        {
            "id": 3,
            "name": "Local AI Galaxy",
            "description": "Local AI models via Ollama",
            "icon": "🏠",
            "color": "#6366f1",
            "system_prompt": "You are a helpful local AI assistant.",
            "is_active": True,
            "created_at": "2025-09-30T00:00:00"
        }
    ]