"""
Authentication API routes - Simplified for testing
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter()

# Pydantic models for request/response
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: str
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

@router.post("/login", response_model=LoginResponse)
async def login(user_data: UserLogin):
    """User login endpoint"""
    try:
        # Temporary mock authentication for testing
        if user_data.email == "admin@cenai.com" and user_data.password == "admin123":
            # Create mock access token
            access_token = "mock_token_admin_123456789"
            
            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=1,
                    email="admin@cenai.com",
                    full_name="CenAI Admin",
                    is_active=True,
                    created_at="2025-09-30T00:00:00"
                )
            )
        elif user_data.email == "user@cenai.com" and user_data.password == "user123":
            # Create mock access token
            access_token = "mock_token_user_123456789"
            
            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse(
                    id=2,
                    email="user@cenai.com",
                    full_name="CenAI User",
                    is_active=True,
                    created_at="2025-09-30T00:00:00"
                )
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/login")
async def login_test():
    """Test endpoint for login"""
    return {"message": "Login endpoint working", "status": "ok"}

@router.post("/register", response_model=LoginResponse)
async def register(user_data: UserRegister):
    """User registration endpoint"""
    try:
        # Simple mock registration - just create a user response
        access_token = "mock_token_new_user_123456789"
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=999,
                email=user_data.email,
                full_name=user_data.full_name,
                is_active=True,
                created_at="2025-10-04T00:00:00"
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.get("/me")
async def get_current_user():
    """Get current user info"""
    return {
        "message": "User endpoint working",
        "user": {
            "id": 1,
            "email": "admin@cenai.com",
            "full_name": "CenAI Admin",
            "is_active": True
        }
    }