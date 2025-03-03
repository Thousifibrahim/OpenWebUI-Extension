"""
API Key Management Service
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import APIKey, User
from app.core.crud import APIKeyCRUD
from app.core.security import encrypt_api_key, decrypt_api_key, mask_api_key, validate_api_key_format
from app.core.database import get_db_session
import httpx
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class APIKeyService:
    """Service for managing AI provider API keys"""
    
    def __init__(self):
        self.provider_configs = {
            "openai": {
                "name": "OpenAI",
                "test_endpoint": "https://api.openai.com/v1/models",
                "headers_format": lambda key: {"Authorization": f"Bearer {key}"},
                "test_model": "gpt-3.5-turbo"
            },
            "anthropic": {
                "name": "Anthropic",
                "test_endpoint": "https://api.anthropic.com/v1/messages",
                "headers_format": lambda key: {
                    "x-api-key": key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                "test_model": "claude-3-haiku-20240307"
            },
            "openrouter": {
                "name": "OpenRouter",
                "test_endpoint": "https://openrouter.ai/api/v1/models",
                "headers_format": lambda key: {"Authorization": f"Bearer {key}"},
                "test_model": "openai/gpt-3.5-turbo"
            },
            "google": {
                "name": "Google AI",
                "test_endpoint": "https://generativelanguage.googleapis.com/v1/models",
                "headers_format": lambda key: {},
                "test_model": "gemini-pro"
            },
            "cohere": {
                "name": "Cohere",
                "test_endpoint": "https://api.cohere.ai/v1/models",
                "headers_format": lambda key: {"Authorization": f"Bearer {key}"},
                "test_model": "command"
            }
        }
    
    async def add_api_key(
        self, 
        user_id: int, 
        provider: str, 
        api_key: str, 
        key_name: str = None,
        test_connection: bool = True
    ) -> Dict[str, Any]:
        """Add a new API key for a user"""
        
        # Validate provider
        if provider not in self.provider_configs:
            return {
                "success": False,
                "error": f"Unsupported provider: {provider}",
                "supported_providers": list(self.provider_configs.keys())
            }
        
        # Validate API key format
        if not validate_api_key_format(provider, api_key):
            return {
                "success": False,
                "error": f"Invalid API key format for {provider}"
            }
        
        # Test connection if requested
        if test_connection:
            test_result = await self.test_api_key(provider, api_key)
            if not test_result["valid"]:
                return {
                    "success": False,
                    "error": f"API key test failed: {test_result.get('error', 'Invalid key')}"
                }
        
        # Encrypt and store the API key
        try:
            encrypted_key = encrypt_api_key(api_key)
            
            with get_db_session() as db:
                # Check if user already has a key for this provider
                existing_keys = APIKeyCRUD.get_by_user_and_provider(db, user_id, provider)
                if existing_keys:
                    # Deactivate existing keys
                    for key in existing_keys:
                        key.is_active = False
                
                # Create new API key
                api_key_obj = APIKeyCRUD.create(
                    db=db,
                    user_id=user_id,
                    provider_name=provider,
                    encrypted_key=encrypted_key,
                    key_name=key_name or f"{self.provider_configs[provider]['name']} Key"
                )
                
                return {
                    "success": True,
                    "api_key_id": api_key_obj.id,
                    "provider": provider,
                    "key_name": api_key_obj.key_name,
                    "masked_key": mask_api_key(api_key),
                    "test_result": test_result if test_connection else None
                }
                
        except Exception as e:
            logger.error(f"Error adding API key: {e}")
            return {
                "success": False,
                "error": "Failed to store API key"
            }
    
    async def test_api_key(self, provider: str, api_key: str) -> Dict[str, Any]:
        """Test if an API key is valid"""
        
        if provider not in self.provider_configs:
            return {"valid": False, "error": "Unsupported provider"}
        
        config = self.provider_configs[provider]
        headers = config["headers_format"](api_key)
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                if provider == "anthropic":
                    # Anthropic requires a message to test
                    response = await client.post(
                        config["test_endpoint"],
                        headers=headers,
                        json={
                            "model": config["test_model"],
                            "max_tokens": 10,
                            "messages": [{"role": "user", "content": "Hello"}]
                        }
                    )
                elif provider == "google":
                    # Google API uses API key as query parameter
                    response = await client.get(
                        f"{config['test_endpoint']}?key={api_key}",
                        headers=headers
                    )
                else:
                    # Standard GET request to models endpoint
                    response = await client.get(
                        config["test_endpoint"],
                        headers=headers
                    )
                
                if response.status_code in [200, 201]:
                    return {
                        "valid": True,
                        "provider": provider,
                        "status_code": response.status_code
                    }
                else:
                    return {
                        "valid": False,
                        "error": f"HTTP {response.status_code}: {response.text[:200]}",
                        "status_code": response.status_code
                    }
                    
        except httpx.TimeoutException:
            return {"valid": False, "error": "Request timeout"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def get_user_api_keys(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all API keys for a user (masked for security)"""
        
        with get_db_session() as db:
            api_keys = APIKeyCRUD.get_active_keys(db, user_id)
            
            result = []
            for key in api_keys:
                try:
                    decrypted_key = decrypt_api_key(key.encrypted_key)
                    result.append({
                        "id": key.id,
                        "provider": key.provider_name,
                        "key_name": key.key_name,
                        "masked_key": mask_api_key(decrypted_key),
                        "created_at": key.created_at,
                        "last_used": key.last_used,
                        "total_requests": key.total_requests,
                        "total_cost": key.total_cost,
                        "is_active": key.is_active
                    })
                except Exception as e:
                    logger.error(f"Error decrypting API key {key.id}: {e}")
                    result.append({
                        "id": key.id,
                        "provider": key.provider_name,
                        "key_name": key.key_name,
                        "masked_key": "*** DECRYPTION ERROR ***",
                        "created_at": key.created_at,
                        "last_used": key.last_used,
                        "total_requests": key.total_requests,
                        "total_cost": key.total_cost,
                        "is_active": False
                    })
            
            return result
    
    def get_api_key_for_provider(self, user_id: int, provider: str) -> Optional[str]:
        """Get decrypted API key for a specific provider"""
        
        with get_db_session() as db:
            api_keys = APIKeyCRUD.get_by_user_and_provider(db, user_id, provider)
            
            if api_keys:
                try:
                    # Return the most recently created active key
                    latest_key = max(api_keys, key=lambda k: k.created_at)
                    return decrypt_api_key(latest_key.encrypted_key)
                except Exception as e:
                    logger.error(f"Error decrypting API key for {provider}: {e}")
                    return None
            
            return None
    
    def remove_api_key(self, user_id: int, key_id: int) -> bool:
        """Remove (deactivate) an API key"""
        
        with get_db_session() as db:
            return APIKeyCRUD.deactivate(db, key_id, user_id)
    
    async def test_all_user_keys(self, user_id: int) -> Dict[str, Dict[str, Any]]:
        """Test all API keys for a user"""
        
        user_keys = self.get_user_api_keys(user_id)
        results = {}
        
        for key_info in user_keys:
            provider = key_info["provider"]
            
            # Get the actual API key for testing
            actual_key = self.get_api_key_for_provider(user_id, provider)
            if actual_key:
                test_result = await self.test_api_key(provider, actual_key)
                results[provider] = {
                    "key_id": key_info["id"],
                    "key_name": key_info["key_name"],
                    "test_result": test_result
                }
            else:
                results[provider] = {
                    "key_id": key_info["id"],
                    "key_name": key_info["key_name"],
                    "test_result": {"valid": False, "error": "Could not decrypt key"}
                }
        
        return results
    
    def update_usage_stats(self, user_id: int, provider: str, cost: float = 0.0) -> None:
        """Update usage statistics for an API key"""
        
        with get_db_session() as db:
            api_keys = APIKeyCRUD.get_by_user_and_provider(db, user_id, provider)
            
            if api_keys:
                latest_key = max(api_keys, key=lambda k: k.created_at)
                latest_key.total_requests += 1
                latest_key.total_cost += cost
                latest_key.last_used = datetime.utcnow()
                db.commit()
    
    def get_supported_providers(self) -> List[Dict[str, str]]:
        """Get list of supported AI providers"""
        
        return [
            {
                "id": provider_id,
                "name": config["name"],
                "test_model": config["test_model"]
            }
            for provider_id, config in self.provider_configs.items()
        ]


# Global service instance
api_key_service = APIKeyService()