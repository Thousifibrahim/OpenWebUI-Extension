"""
Conversations API routes - Simplified for testing
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel

router = APIRouter()

# Pydantic models
class ConversationResponse(BaseModel):
    id: int
    title: str
    galaxy_id: int
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: str
    galaxy_id: int

# Mock conversation data
MOCK_CONVERSATIONS = [
    {
        "id": 1,
        "title": "Welcome to ChatGPT Galaxy",
        "galaxy_id": 1,
        "created_at": "2025-09-30T00:00:00",
        "updated_at": "2025-09-30T00:00:00"
    },
    {
        "id": 2,
        "title": "Claude Introduction",
        "galaxy_id": 2,
        "created_at": "2025-09-30T00:01:00",
        "updated_at": "2025-09-30T00:01:00"
    }
]

@router.get("/", response_model=List[ConversationResponse])
async def list_conversations():
    """Get all conversations"""
    return [ConversationResponse(**conv) for conv in MOCK_CONVERSATIONS]

@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: int):
    """Get a specific conversation by ID"""
    for conv in MOCK_CONVERSATIONS:
        if conv["id"] == conversation_id:
            return ConversationResponse(**conv)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Conversation not found"
    )

@router.post("/", response_model=ConversationResponse)
async def create_conversation(conv_data: ConversationCreate):
    """Create a new conversation"""
    new_conversation = {
        "id": len(MOCK_CONVERSATIONS) + 1,
        "title": conv_data.title,
        "galaxy_id": conv_data.galaxy_id,
        "created_at": "2025-10-04T00:00:00",
        "updated_at": "2025-10-04T00:00:00"
    }
    MOCK_CONVERSATIONS.append(new_conversation)
    return ConversationResponse(**new_conversation)

@router.get("/test")
async def test_conversations():
    """Test endpoint"""
    return {"message": "Conversations endpoint working", "count": len(MOCK_CONVERSATIONS)}