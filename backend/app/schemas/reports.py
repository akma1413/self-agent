from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any
from enum import Enum


class ReportType(str, Enum):
    NEW_TOOL = "new_tool"
    COMPARISON = "comparison"
    BEST_PRACTICE = "best_practice"


class ReportStatus(str, Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    ARCHIVED = "archived"


class ReportCreate(BaseModel):
    agenda_id: str
    report_type: ReportType
    title: str
    summary: Optional[str] = None
    content: dict


class ReportResponse(BaseModel):
    id: str
    agenda_id: str
    report_type: str
    title: str
    summary: Optional[str]
    content: dict
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime]


class ActionCreate(BaseModel):
    report_id: str
    action_type: str
    title: str
    description: Optional[str] = None
    priority: str = "medium"


class ActionResponse(BaseModel):
    id: str
    report_id: str
    action_type: str
    title: str
    description: Optional[str]
    priority: str
    status: str
    confirmed_at: Optional[datetime]
    executed_at: Optional[datetime]
    created_at: datetime


class ActionConfirm(BaseModel):
    comment: Optional[str] = None
