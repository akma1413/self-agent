from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PrincipleCreate(BaseModel):
    content: str
    category: Optional[str] = None


class PrincipleUpdate(BaseModel):
    content: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


class PrincipleResponse(BaseModel):
    id: str
    content: str
    category: Optional[str]
    confidence_score: float
    source_count: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PrincipleEvidence(BaseModel):
    id: str
    conversation_id: str
    excerpt: str
    relevance_score: float


class PrincipleWithEvidence(PrincipleResponse):
    evidences: List[PrincipleEvidence] = []


class ExtractionRequest(BaseModel):
    conversation_ids: Optional[List[str]] = None  # None means all


class ExtractionResponse(BaseModel):
    extracted_count: int
    principles: List[PrincipleResponse]
