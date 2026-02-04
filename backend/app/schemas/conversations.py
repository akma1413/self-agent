from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum


class Platform(str, Enum):
    CLAUDE = "claude"
    CHATGPT = "chatgpt"
    GEMINI = "gemini"


class ConversationCreate(BaseModel):
    platform: Platform
    external_id: Optional[str] = None
    title: Optional[str] = None
    content: str
    metadata: dict = {}
    conversation_date: Optional[datetime] = None


class ConversationResponse(BaseModel):
    id: str
    platform: str
    external_id: Optional[str]
    title: Optional[str]
    content: str
    metadata: dict
    conversation_date: Optional[datetime]
    imported_at: datetime


class ConversationImportRequest(BaseModel):
    platform: Platform
    file_content: str  # JSON string from export


class ConversationImportResponse(BaseModel):
    imported_count: int
    conversations: List[ConversationResponse]
