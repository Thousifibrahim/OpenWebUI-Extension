"""
Unified AI Client for multiple providers
"""
import asyncio
import json
import time
from typing import Dict, Any, List, Optional, AsyncIterator, Union
from dataclasses import dataclass
from enum import Enum
import httpx
import logging
from app.core.config import settings, AI_MODELS
from app.utils.helpers import calculate_tokens_estimate, calculate_cost_estimate

logger = logging.getLogger(__name__)


class AIProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    OPENROUTER = "openrouter"
    GOOGLE = "google"
    COHERE = "cohere"
    LM_STUDIO = "lm_studio"
    OLLAMA = "ollama"


@dataclass
class AIResponse:
    """Standardized AI response format"""
    content: str
    model: str
    provider: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost: float
    response_time: float
    metadata: Dict[str, Any] = None


class UnifiedAIClient:
    """Unified client for multiple AI providers"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=60.0)
        self.retry_delays = [1, 2, 4, 8]  # Exponential backoff delays
        
        # Provider configurations
        self.provider_configs = {
            AIProvider.OPENAI: {
                "base_url": "https://api.openai.com/v1",
                "chat_endpoint": "/chat/completions",
                "models_endpoint": "/models",
                "headers": lambda api_key: {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
            },
            AIProvider.ANTHROPIC: {
                "base_url": "https://api.anthropic.com/v1",
                "chat_endpoint": "/messages",
                "models_endpoint": "/models",
                "headers": lambda api_key: {
                    "x-api-key": api_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                }
            },
            AIProvider.OPENROUTER: {
                "base_url": "https://openrouter.ai/api/v1",
                "chat_endpoint": "/chat/completions",
                "models_endpoint": "/models",
                "headers": lambda api_key: {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://cenai.app",
                    "X-Title": "CenAI"
                }
            },
            AIProvider.GOOGLE: {
                "base_url": "https://generativelanguage.googleapis.com/v1beta",
                "chat_endpoint": "/models/{model}:generateContent",
                "models_endpoint": "/models",
                "headers": lambda api_key: {
                    "Content-Type": "application/json"
                }
            },
            AIProvider.LM_STUDIO: {
                "base_url": settings.LM_STUDIO_URL,
                "chat_endpoint": "/v1/chat/completions",
                "models_endpoint": "/v1/models",
                "headers": lambda api_key: {
                    "Content-Type": "application/json"
                }
            },
            AIProvider.OLLAMA: {
                "base_url": settings.OLLAMA_URL,
                "chat_endpoint": "/api/chat",
                "models_endpoint": "/api/tags",
                "headers": lambda api_key: {
                    "Content-Type": "application/json"
                }
            }
        }
    
    async def send_message(
        self,
        provider: Union[AIProvider, str],
        model: str,
        messages: List[Dict[str, str]],
        api_key: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        stream: bool = False
    ) -> Union[AIResponse, AsyncIterator[str]]:
        """Send message to AI provider"""
        
        if isinstance(provider, str):
            try:
                provider = AIProvider(provider)
            except ValueError:
                raise ValueError(f"Unsupported provider: {provider}")
        
        start_time = time.time()
        
        try:
            if stream:
                return self._stream_response(
                    provider, model, messages, api_key, temperature, max_tokens, start_time
                )
            else:
                return await self._send_single_message(
                    provider, model, messages, api_key, temperature, max_tokens, start_time
                )
        
        except Exception as e:
            logger.error(f"Error sending message to {provider.value}: {e}")
            raise
    
    async def _send_single_message(
        self,
        provider: AIProvider,
        model: str,
        messages: List[Dict[str, str]],
        api_key: Optional[str],
        temperature: float,
        max_tokens: int,
        start_time: float
    ) -> AIResponse:
        """Send single message (non-streaming)"""
        
        config = self.provider_configs[provider]
        headers = config["headers"](api_key) if api_key else config["headers"]("")
        
        # Prepare request payload based on provider
        payload = self._build_payload(provider, model, messages, temperature, max_tokens)
        
        # Build URL
        url = config["base_url"] + config["chat_endpoint"]
        if provider == AIProvider.GOOGLE:
            url = url.format(model=model) + f"?key={api_key}"
        
        # Send request with retry logic
        response_data = await self._send_with_retry(url, headers, payload)
        
        # Parse response
        return self._parse_response(provider, model, response_data, start_time)
    
    async def _stream_response(
        self,
        provider: AIProvider,
        model: str,
        messages: List[Dict[str, str]],
        api_key: Optional[str],
        temperature: float,
        max_tokens: int,
        start_time: float
    ) -> AsyncIterator[str]:
        """Stream response from AI provider"""
        
        config = self.provider_configs[provider]
        headers = config["headers"](api_key) if api_key else config["headers"]("")
        
        # Prepare streaming payload
        payload = self._build_payload(provider, model, messages, temperature, max_tokens, stream=True)
        
        url = config["base_url"] + config["chat_endpoint"]
        if provider == AIProvider.GOOGLE:
            url = url.format(model=model) + f"?key={api_key}"
        
        try:
            async with self.client.stream(
                "POST", url, headers=headers, json=payload
            ) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]  # Remove "data: " prefix
                        
                        if data_str == "[DONE]":
                            break
                        
                        try:
                            data = json.loads(data_str)
                            content = self._extract_streaming_content(provider, data)
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
        
        except Exception as e:
            logger.error(f"Streaming error with {provider.value}: {e}")
            yield f"Error: {str(e)}"
    
    def _build_payload(
        self,
        provider: AIProvider,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        stream: bool = False
    ) -> Dict[str, Any]:
        """Build request payload for specific provider"""
        
        if provider in [AIProvider.OPENAI, AIProvider.OPENROUTER, AIProvider.LM_STUDIO]:
            return {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": stream
            }
        
        elif provider == AIProvider.ANTHROPIC:
            # Anthropic uses different format
            system_messages = [msg["content"] for msg in messages if msg["role"] == "system"]
            conversation_messages = [msg for msg in messages if msg["role"] != "system"]
            
            payload = {
                "model": model,
                "messages": conversation_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": stream
            }
            
            if system_messages:
                payload["system"] = "\n".join(system_messages)
            
            return payload
        
        elif provider == AIProvider.GOOGLE:
            # Google Gemini format
            contents = []
            for msg in messages:
                if msg["role"] == "user":
                    contents.append({
                        "parts": [{"text": msg["content"]}],
                        "role": "user"
                    })
                elif msg["role"] == "assistant":
                    contents.append({
                        "parts": [{"text": msg["content"]}],
                        "role": "model"
                    })
            
            return {
                "contents": contents,
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_tokens
                }
            }
        
        elif provider == AIProvider.OLLAMA:
            return {
                "model": model,
                "messages": messages,
                "stream": stream,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }
        
        else:
            # Default format
            return {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": stream
            }
    
    def _parse_response(
        self,
        provider: AIProvider,
        model: str,
        response_data: Dict[str, Any],
        start_time: float
    ) -> AIResponse:
        """Parse response from specific provider"""
        
        response_time = time.time() - start_time
        
        if provider in [AIProvider.OPENAI, AIProvider.OPENROUTER, AIProvider.LM_STUDIO]:
            choice = response_data["choices"][0]
            content = choice["message"]["content"]
            usage = response_data.get("usage", {})
            
            prompt_tokens = usage.get("prompt_tokens", 0)
            completion_tokens = usage.get("completion_tokens", 0)
            total_tokens = usage.get("total_tokens", prompt_tokens + completion_tokens)
        
        elif provider == AIProvider.ANTHROPIC:
            content = response_data["content"][0]["text"]
            usage = response_data.get("usage", {})
            
            prompt_tokens = usage.get("input_tokens", 0)
            completion_tokens = usage.get("output_tokens", 0)
            total_tokens = prompt_tokens + completion_tokens
        
        elif provider == AIProvider.GOOGLE:
            content = response_data["candidates"][0]["content"]["parts"][0]["text"]
            usage = response_data.get("usageMetadata", {})
            
            prompt_tokens = usage.get("promptTokenCount", 0)
            completion_tokens = usage.get("candidatesTokenCount", 0)
            total_tokens = usage.get("totalTokenCount", prompt_tokens + completion_tokens)
        
        elif provider == AIProvider.OLLAMA:
            content = response_data["message"]["content"]
            # Ollama doesn't provide token counts, estimate them
            prompt_tokens = calculate_tokens_estimate(str(response_data.get("prompt", "")))
            completion_tokens = calculate_tokens_estimate(content)
            total_tokens = prompt_tokens + completion_tokens
        
        else:
            # Default parsing
            content = str(response_data.get("content", ""))
            prompt_tokens = calculate_tokens_estimate(content) // 2
            completion_tokens = calculate_tokens_estimate(content) // 2
            total_tokens = prompt_tokens + completion_tokens
        
        # Calculate cost
        model_config = self._get_model_config(provider, model)
        cost = calculate_cost_estimate(prompt_tokens, completion_tokens, model_config)
        
        return AIResponse(
            content=content,
            model=model,
            provider=provider.value,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            cost=cost,
            response_time=response_time,
            metadata=response_data
        )
    
    def _extract_streaming_content(self, provider: AIProvider, data: Dict[str, Any]) -> Optional[str]:
        """Extract content from streaming response"""
        
        try:
            if provider in [AIProvider.OPENAI, AIProvider.OPENROUTER, AIProvider.LM_STUDIO]:
                delta = data["choices"][0]["delta"]
                return delta.get("content", "")
            
            elif provider == AIProvider.ANTHROPIC:
                if data.get("type") == "content_block_delta":
                    return data["delta"].get("text", "")
            
            elif provider == AIProvider.OLLAMA:
                return data["message"].get("content", "")
            
        except (KeyError, IndexError):
            pass
        
        return None
    
    async def _send_with_retry(
        self,
        url: str,
        headers: Dict[str, str],
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Send request with exponential backoff retry"""
        
        last_exception = None
        
        for attempt, delay in enumerate(self.retry_delays):
            try:
                response = await self.client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                return response.json()
            
            except httpx.HTTPStatusError as e:
                if e.response.status_code in [429, 500, 502, 503, 504]:
                    # Rate limit or server error - retry
                    last_exception = e
                    if attempt < len(self.retry_delays) - 1:
                        logger.warning(f"Request failed with {e.response.status_code}, retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                else:
                    # Client error - don't retry
                    raise
            
            except (httpx.ConnectTimeout, httpx.ReadTimeout) as e:
                last_exception = e
                if attempt < len(self.retry_delays) - 1:
                    logger.warning(f"Request timeout, retrying in {delay}s...")
                    await asyncio.sleep(delay)
                    continue
                else:
                    raise
        
        # All retries failed
        raise last_exception
    
    def _get_model_config(self, provider: AIProvider, model: str) -> Dict[str, Any]:
        """Get model configuration for cost calculation"""
        
        provider_models = AI_MODELS.get(provider.value, {})
        return provider_models.get(model, {
            "cost_per_1k_input": 0.001,
            "cost_per_1k_output": 0.002
        })
    
    async def get_available_models(self, provider: AIProvider, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get available models from provider"""
        
        config = self.provider_configs[provider]
        headers = config["headers"](api_key) if api_key else config["headers"]("")
        
        url = config["base_url"] + config["models_endpoint"]
        if provider == AIProvider.GOOGLE:
            url += f"?key={api_key}"
        
        try:
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Parse model list based on provider
            if provider in [AIProvider.OPENAI, AIProvider.OPENROUTER, AIProvider.LM_STUDIO]:
                return data.get("data", [])
            elif provider == AIProvider.OLLAMA:
                return data.get("models", [])
            else:
                return data.get("models", [])
        
        except Exception as e:
            logger.error(f"Error fetching models from {provider.value}: {e}")
            return []
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()


# Global client instance
unified_ai_client = UnifiedAIClient()