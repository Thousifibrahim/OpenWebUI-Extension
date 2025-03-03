"""
Simple configuration settings for CenAI application
"""
import os
from typing import List


class Settings:
    """Simple application settings"""
    
    # App Info
    APP_NAME: str = "CenAI - Centralized AI Interface"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "development-secret-key-change-in-production-must-be-very-long"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    ENCRYPTION_KEY: str = "development-encryption-key-32chars"
    
    # Database
    DATABASE_URL: str = "sqlite:///./cenai.db"
    
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5100", 
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://127.0.0.1:5100"
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"


settings = Settings()