"""
Model Registry and Router for AI model management
"""
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import json
import logging
from app.core.config import AI_MODELS, DEFAULT_GALAXIES
from app.services.ai_client import AIProvider
from app.utils.helpers import safe_get

logger = logging.getLogger(__name__)


class TaskType(Enum):
    """Different types of AI tasks"""
    CODE = "code"
    CREATIVE = "creative"
    ANALYSIS = "analysis"
    RESEARCH = "research"
    CHAT = "chat"
    TRANSLATION = "translation"
    SUMMARIZATION = "summarization"
    REASONING = "reasoning"


class PerformanceLevel(Enum):
    """Performance levels for model selection"""
    FAST = "fast"
    BALANCED = "balanced"
    PREMIUM = "premium"


@dataclass
class ModelInfo:
    """Model information and capabilities"""
    id: str
    name: str
    provider: AIProvider
    cost_per_1k_input: float
    cost_per_1k_output: float
    max_tokens: int
    capabilities: List[str]
    best_for: List[TaskType]
    performance_level: PerformanceLevel
    context_window: int = 4096
    supports_streaming: bool = True
    supports_functions: bool = False
    description: str = ""
    
    @property
    def cost_ratio(self) -> float:
        """Cost ratio for comparison (output/input)"""
        if self.cost_per_1k_input == 0:
            return 0
        return self.cost_per_1k_output / self.cost_per_1k_input
    
    @property
    def average_cost_per_1k(self) -> float:
        """Average cost per 1k tokens"""
        return (self.cost_per_1k_input + self.cost_per_1k_output) / 2


class ModelRegistry:
    """Registry for managing available AI models"""
    
    def __init__(self):
        self.models: Dict[str, ModelInfo] = {}
        self._load_default_models()
    
    def _load_default_models(self):
        """Load default model configurations"""
        
        # OpenAI Models
        self.register_model(ModelInfo(
            id="gpt-4",
            name="GPT-4",
            provider=AIProvider.OPENAI,
            cost_per_1k_input=0.03,
            cost_per_1k_output=0.06,
            max_tokens=8192,
            context_window=8192,
            capabilities=["text", "code", "reasoning", "analysis"],
            best_for=[TaskType.CODE, TaskType.REASONING, TaskType.ANALYSIS],
            performance_level=PerformanceLevel.PREMIUM,
            supports_functions=True,
            description="Most capable OpenAI model, excellent for complex reasoning and code generation"
        ))
        
        self.register_model(ModelInfo(
            id="gpt-3.5-turbo",
            name="GPT-3.5 Turbo",
            provider=AIProvider.OPENAI,
            cost_per_1k_input=0.001,
            cost_per_1k_output=0.002,
            max_tokens=4096,
            context_window=4096,
            capabilities=["text", "code", "chat"],
            best_for=[TaskType.CHAT, TaskType.CODE, TaskType.SUMMARIZATION],
            performance_level=PerformanceLevel.FAST,
            supports_functions=True,
            description="Fast and cost-effective model for most common tasks"
        ))
        
        # Anthropic Models
        self.register_model(ModelInfo(
            id="claude-3-opus-20240229",
            name="Claude 3 Opus",
            provider=AIProvider.ANTHROPIC,
            cost_per_1k_input=0.015,
            cost_per_1k_output=0.075,
            max_tokens=4096,
            context_window=200000,
            capabilities=["text", "reasoning", "creative", "analysis"],
            best_for=[TaskType.CREATIVE, TaskType.ANALYSIS, TaskType.RESEARCH],
            performance_level=PerformanceLevel.PREMIUM,
            description="Most capable Anthropic model with excellent reasoning and creative abilities"
        ))
        
        self.register_model(ModelInfo(
            id="claude-3-sonnet-20240229",
            name="Claude 3 Sonnet",
            provider=AIProvider.ANTHROPIC,
            cost_per_1k_input=0.003,
            cost_per_1k_output=0.015,
            max_tokens=4096,
            context_window=200000,
            capabilities=["text", "reasoning", "code", "analysis"],
            best_for=[TaskType.CODE, TaskType.ANALYSIS, TaskType.REASONING],
            performance_level=PerformanceLevel.BALANCED,
            description="Balanced model with good performance across various tasks"
        ))
        
        self.register_model(ModelInfo(
            id="claude-3-haiku-20240307",
            name="Claude 3 Haiku",
            provider=AIProvider.ANTHROPIC,
            cost_per_1k_input=0.00025,
            cost_per_1k_output=0.00125,
            max_tokens=4096,
            context_window=200000,
            capabilities=["text", "chat", "summarization"],
            best_for=[TaskType.CHAT, TaskType.SUMMARIZATION],
            performance_level=PerformanceLevel.FAST,
            description="Fast and efficient model for quick responses"
        ))
        
        # Add more models as needed
        logger.info(f"Loaded {len(self.models)} default models")
    
    def register_model(self, model: ModelInfo):
        """Register a new model"""
        self.models[model.id] = model
        logger.debug(f"Registered model: {model.id}")
    
    def get_model(self, model_id: str) -> Optional[ModelInfo]:
        """Get model by ID"""
        return self.models.get(model_id)
    
    def list_models(
        self,
        provider: Optional[AIProvider] = None,
        task_type: Optional[TaskType] = None,
        performance_level: Optional[PerformanceLevel] = None,
        max_cost: Optional[float] = None
    ) -> List[ModelInfo]:
        """List models with optional filters"""
        
        filtered_models = list(self.models.values())
        
        if provider:
            filtered_models = [m for m in filtered_models if m.provider == provider]
        
        if task_type:
            filtered_models = [m for m in filtered_models if task_type in m.best_for]
        
        if performance_level:
            filtered_models = [m for m in filtered_models if m.performance_level == performance_level]
        
        if max_cost:
            filtered_models = [m for m in filtered_models if m.average_cost_per_1k <= max_cost]
        
        # Sort by performance level and cost
        performance_order = {
            PerformanceLevel.FAST: 1,
            PerformanceLevel.BALANCED: 2,
            PerformanceLevel.PREMIUM: 3
        }
        
        filtered_models.sort(key=lambda m: (performance_order[m.performance_level], m.average_cost_per_1k))
        
        return filtered_models
    
    def get_models_by_provider(self, provider: AIProvider) -> List[ModelInfo]:
        """Get all models for a specific provider"""
        return [model for model in self.models.values() if model.provider == provider]
    
    def search_models(self, query: str) -> List[ModelInfo]:
        """Search models by name or description"""
        query = query.lower()
        results = []
        
        for model in self.models.values():
            if (query in model.name.lower() or 
                query in model.description.lower() or
                query in model.id.lower()):
                results.append(model)
        
        return results


class ModelRouter:
    """Smart router for selecting appropriate models"""
    
    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        
        # Task-to-model preferences
        self.task_preferences = {
            TaskType.CODE: ["gpt-4", "claude-3-sonnet-20240229", "gpt-3.5-turbo"],
            TaskType.CREATIVE: ["claude-3-opus-20240229", "gpt-4", "claude-3-sonnet-20240229"],
            TaskType.ANALYSIS: ["gpt-4", "claude-3-opus-20240229", "claude-3-sonnet-20240229"],
            TaskType.RESEARCH: ["claude-3-opus-20240229", "gpt-4", "claude-3-sonnet-20240229"],
            TaskType.CHAT: ["gpt-3.5-turbo", "claude-3-haiku-20240307", "gpt-4"],
            TaskType.SUMMARIZATION: ["claude-3-haiku-20240307", "gpt-3.5-turbo", "claude-3-sonnet-20240229"],
            TaskType.REASONING: ["gpt-4", "claude-3-opus-20240229", "claude-3-sonnet-20240229"],
            TaskType.TRANSLATION: ["gpt-4", "gpt-3.5-turbo", "claude-3-sonnet-20240229"]
        }
        
        # Galaxy-to-task mapping
        self.galaxy_task_mapping = {
            "Code Galaxy": [TaskType.CODE, TaskType.REASONING],
            "Design Galaxy": [TaskType.CREATIVE, TaskType.ANALYSIS],
            "Content Galaxy": [TaskType.CREATIVE, TaskType.SUMMARIZATION],
            "Research Galaxy": [TaskType.RESEARCH, TaskType.ANALYSIS],
            "Business Galaxy": [TaskType.ANALYSIS, TaskType.REASONING]
        }
    
    def recommend_model(
        self,
        galaxy_name: Optional[str] = None,
        task_description: Optional[str] = None,
        cost_preference: str = "balanced",  # "cost", "balanced", "performance"
        available_providers: Optional[List[AIProvider]] = None,
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> List[ModelInfo]:
        """Recommend models based on context and preferences"""
        
        # Determine task types
        task_types = self._infer_task_types(galaxy_name, task_description)
        
        # Get candidate models
        candidates = []
        for task_type in task_types:
            preferred_models = self.task_preferences.get(task_type, [])
            for model_id in preferred_models:
                model = self.registry.get_model(model_id)
                if model and model not in candidates:
                    candidates.append(model)
        
        # Filter by available providers
        if available_providers:
            candidates = [m for m in candidates if m.provider in available_providers]
        
        # Apply cost preference
        candidates = self._apply_cost_preference(candidates, cost_preference)
        
        # Apply user preferences
        if user_preferences:
            candidates = self._apply_user_preferences(candidates, user_preferences)
        
        return candidates[:5]  # Return top 5 recommendations
    
    def get_best_model_for_task(
        self,
        task_type: TaskType,
        cost_preference: str = "balanced",
        available_providers: Optional[List[AIProvider]] = None
    ) -> Optional[ModelInfo]:
        """Get the best model for a specific task"""
        
        recommendations = self.recommend_model(
            task_description=task_type.value,
            cost_preference=cost_preference,
            available_providers=available_providers
        )
        
        return recommendations[0] if recommendations else None
    
    def compare_models(self, model_ids: List[str]) -> Dict[str, Any]:
        """Compare multiple models across different metrics"""
        
        models = [self.registry.get_model(model_id) for model_id in model_ids]
        models = [m for m in models if m is not None]
        
        if not models:
            return {"error": "No valid models found"}
        
        comparison = {
            "models": [],
            "cost_comparison": {
                "cheapest": None,
                "most_expensive": None,
                "average_input_cost": 0,
                "average_output_cost": 0
            },
            "performance_distribution": {
                "fast": 0,
                "balanced": 0,
                "premium": 0
            },
            "provider_distribution": {},
            "capabilities_overlap": []
        }
        
        total_input_cost = 0
        total_output_cost = 0
        cheapest_model = None
        most_expensive_model = None
        
        for model in models:
            model_data = {
                "id": model.id,
                "name": model.name,
                "provider": model.provider.value,
                "cost_per_1k_input": model.cost_per_1k_input,
                "cost_per_1k_output": model.cost_per_1k_output,
                "average_cost": model.average_cost_per_1k,
                "performance_level": model.performance_level.value,
                "max_tokens": model.max_tokens,
                "context_window": model.context_window,
                "capabilities": model.capabilities,
                "best_for": [task.value for task in model.best_for]
            }
            comparison["models"].append(model_data)
            
            # Cost analysis
            total_input_cost += model.cost_per_1k_input
            total_output_cost += model.cost_per_1k_output
            
            if cheapest_model is None or model.average_cost_per_1k < cheapest_model.average_cost_per_1k:
                cheapest_model = model
            
            if most_expensive_model is None or model.average_cost_per_1k > most_expensive_model.average_cost_per_1k:
                most_expensive_model = model
            
            # Performance distribution
            comparison["performance_distribution"][model.performance_level.value] += 1
            
            # Provider distribution
            provider = model.provider.value
            comparison["provider_distribution"][provider] = comparison["provider_distribution"].get(provider, 0) + 1
        
        # Finalize cost comparison
        comparison["cost_comparison"]["cheapest"] = cheapest_model.id if cheapest_model else None
        comparison["cost_comparison"]["most_expensive"] = most_expensive_model.id if most_expensive_model else None
        comparison["cost_comparison"]["average_input_cost"] = total_input_cost / len(models)
        comparison["cost_comparison"]["average_output_cost"] = total_output_cost / len(models)
        
        # Find capability overlap
        if models:
            all_capabilities = set(models[0].capabilities)
            for model in models[1:]:
                all_capabilities &= set(model.capabilities)
            comparison["capabilities_overlap"] = list(all_capabilities)
        
        return comparison
    
    def estimate_cost(
        self,
        model_id: str,
        input_tokens: int,
        estimated_output_tokens: int
    ) -> Dict[str, float]:
        """Estimate cost for a request"""
        
        model = self.registry.get_model(model_id)
        if not model:
            return {"error": "Model not found"}
        
        input_cost = (input_tokens / 1000) * model.cost_per_1k_input
        output_cost = (estimated_output_tokens / 1000) * model.cost_per_1k_output
        total_cost = input_cost + output_cost
        
        return {
            "model": model_id,
            "input_tokens": input_tokens,
            "output_tokens": estimated_output_tokens,
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "total_cost": round(total_cost, 6),
            "cost_per_1k_input": model.cost_per_1k_input,
            "cost_per_1k_output": model.cost_per_1k_output
        }
    
    def _infer_task_types(self, galaxy_name: Optional[str], task_description: Optional[str]) -> List[TaskType]:
        """Infer task types from galaxy and description"""
        
        task_types = []
        
        # From galaxy
        if galaxy_name:
            galaxy_tasks = self.galaxy_task_mapping.get(galaxy_name, [])
            task_types.extend(galaxy_tasks)
        
        # From description
        if task_description:
            description_lower = task_description.lower()
            
            if any(word in description_lower for word in ["code", "program", "debug", "function", "class"]):
                task_types.append(TaskType.CODE)
            
            if any(word in description_lower for word in ["write", "story", "creative", "poem", "design"]):
                task_types.append(TaskType.CREATIVE)
            
            if any(word in description_lower for word in ["analyze", "analysis", "compare", "evaluate"]):
                task_types.append(TaskType.ANALYSIS)
            
            if any(word in description_lower for word in ["research", "study", "investigate", "find"]):
                task_types.append(TaskType.RESEARCH)
            
            if any(word in description_lower for word in ["chat", "talk", "conversation", "discuss"]):
                task_types.append(TaskType.CHAT)
            
            if any(word in description_lower for word in ["summarize", "summary", "brief", "tldr"]):
                task_types.append(TaskType.SUMMARIZATION)
            
            if any(word in description_lower for word in ["translate", "translation", "language"]):
                task_types.append(TaskType.TRANSLATION)
            
            if any(word in description_lower for word in ["reason", "logic", "solve", "problem"]):
                task_types.append(TaskType.REASONING)
        
        # Default fallback
        if not task_types:
            task_types = [TaskType.CHAT]
        
        return list(set(task_types))  # Remove duplicates
    
    def _apply_cost_preference(self, models: List[ModelInfo], cost_preference: str) -> List[ModelInfo]:
        """Apply cost preference to model list"""
        
        if cost_preference == "cost":
            # Prioritize cheapest models
            return sorted(models, key=lambda m: m.average_cost_per_1k)
        elif cost_preference == "performance":
            # Prioritize premium models
            performance_order = {
                PerformanceLevel.PREMIUM: 0,
                PerformanceLevel.BALANCED: 1,
                PerformanceLevel.FAST: 2
            }
            return sorted(models, key=lambda m: (performance_order[m.performance_level], m.average_cost_per_1k))
        else:  # balanced
            # Balance between cost and performance
            return sorted(models, key=lambda m: (
                m.performance_level != PerformanceLevel.BALANCED,
                m.average_cost_per_1k
            ))
    
    def _apply_user_preferences(self, models: List[ModelInfo], preferences: Dict[str, Any]) -> List[ModelInfo]:
        """Apply user preferences to model selection"""
        
        # Preferred providers
        preferred_providers = preferences.get("preferred_providers", [])
        if preferred_providers:
            provider_models = [m for m in models if m.provider.value in preferred_providers]
            other_models = [m for m in models if m.provider.value not in preferred_providers]
            models = provider_models + other_models
        
        # Budget limit
        budget_limit = preferences.get("budget_limit")
        if budget_limit:
            models = [m for m in models if m.average_cost_per_1k <= budget_limit]
        
        # Performance preference
        performance_pref = preferences.get("performance_preference")
        if performance_pref and performance_pref in ["fast", "balanced", "premium"]:
            pref_level = PerformanceLevel(performance_pref)
            pref_models = [m for m in models if m.performance_level == pref_level]
            other_models = [m for m in models if m.performance_level != pref_level]
            models = pref_models + other_models
        
        return models


# Global instances
model_registry = ModelRegistry()
model_router = ModelRouter(model_registry)