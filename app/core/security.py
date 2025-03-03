"""
Security utilities for authentication and encryption
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from app.core.config import settings
import secrets
import base64

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Encryption for API keys
def get_encryption_key() -> bytes:
    """Get or generate encryption key"""
    key = settings.ENCRYPTION_KEY
    if isinstance(key, str):
        key = key.encode()
    
    # Ensure key is exactly 32 bytes, then base64 encode it
    if len(key) < 32:
        key = key.ljust(32, b'0')
    elif len(key) > 32:
        key = key[:32]
    
    return base64.urlsafe_b64encode(key)

fernet = Fernet(get_encryption_key())

# Token settings
ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Ensure password is a string and not too long
    if not isinstance(password, str):
        password = str(password)
    
    # Bcrypt has a limit of 72 bytes
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def encrypt_api_key(api_key: str) -> str:
    """Encrypt API key for secure storage"""
    return fernet.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt API key"""
    return fernet.decrypt(encrypted_key.encode()).decode()


def generate_api_key_id() -> str:
    """Generate a random API key identifier"""
    return secrets.token_urlsafe(32)


def mask_api_key(api_key: str, show_chars: int = 4) -> str:
    """Mask API key for display (show only first/last chars)"""
    if len(api_key) <= show_chars * 2:
        return "*" * len(api_key)
    return f"{api_key[:show_chars]}{'*' * (len(api_key) - show_chars * 2)}{api_key[-show_chars:]}"


def validate_api_key_format(provider: str, api_key: str) -> bool:
    """Validate API key format for different providers"""
    validation_rules = {
        "openai": lambda key: key.startswith("sk-") and len(key) > 40,
        "anthropic": lambda key: key.startswith("sk-ant-") and len(key) > 40,
        "openrouter": lambda key: key.startswith("sk-or-") and len(key) > 40,
        "google": lambda key: len(key) > 30,  # Google API keys vary
        "cohere": lambda key: len(key) > 30,
        "local": lambda key: True,  # Local models don't need API keys
    }
    
    validator = validation_rules.get(provider.lower())
    if validator:
        return validator(api_key)
    return len(api_key) > 10  # Basic length check for unknown providers