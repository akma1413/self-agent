from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AgendaCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str


class AgendaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None


class AgendaResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
