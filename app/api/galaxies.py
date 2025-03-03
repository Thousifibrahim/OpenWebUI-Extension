"""
Galaxy API routes - Simplified for testing
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class GalaxyResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    color: str
    system_prompt: str
    is_active: bool
    created_at: str
    
    class Config:
        from_attributes = True

class GalaxyCreate(BaseModel):
    name: str
    description: str
    icon: str
    color: str
    system_prompt: str

# Mock galaxy data
MOCK_GALAXIES = [
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

@router.get("/", response_model=List[GalaxyResponse])
async def list_galaxies():
    """Get all galaxies"""
    return [GalaxyResponse(**galaxy) for galaxy in MOCK_GALAXIES]

@router.get("/{galaxy_id}", response_model=GalaxyResponse)
async def get_galaxy(galaxy_id: int):
    """Get a specific galaxy by ID"""
    for galaxy in MOCK_GALAXIES:
        if galaxy["id"] == galaxy_id:
            return GalaxyResponse(**galaxy)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Galaxy not found"
    )

@router.post("/", response_model=GalaxyResponse)
async def create_galaxy(galaxy_data: GalaxyCreate):
    """Create a new galaxy"""
    new_galaxy = {
        "id": len(MOCK_GALAXIES) + 1,
        "name": galaxy_data.name,
        "description": galaxy_data.description,
        "icon": galaxy_data.icon,
        "color": galaxy_data.color,
        "system_prompt": galaxy_data.system_prompt,
        "is_active": True,
        "created_at": "2025-10-04T00:00:00"
    }
    MOCK_GALAXIES.append(new_galaxy)
    return GalaxyResponse(**new_galaxy)

@router.get("/test")
async def test_galaxies():
    """Test endpoint"""
    return {"message": "Galaxies endpoint working", "count": len(MOCK_GALAXIES)}