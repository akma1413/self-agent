from fastapi import APIRouter, HTTPException
from typing import List
from app.core.database import get_supabase_client
from app.schemas.conversations import (
    ConversationCreate,
    ConversationResponse,
    ConversationImportRequest,
    ConversationImportResponse,
    Platform,
)
from app.services.principles.parser import ConversationParser

router = APIRouter()
parser = ConversationParser()


@router.get("", response_model=List[ConversationResponse])
async def list_conversations(platform: Platform | None = None, limit: int = 100):
    client = get_supabase_client()
    query = client.table("conversations").select("*").limit(limit)

    if platform:
        query = query.eq("platform", platform.value)

    result = query.order("imported_at", desc=True).execute()
    return result.data


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str):
    client = get_supabase_client()
    result = client.table("conversations").select("*").eq("id", conversation_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return result.data


@router.post("/import", response_model=ConversationImportResponse)
async def import_conversations(request: ConversationImportRequest):
    """Import conversations from AI platform export file"""
    try:
        conversations = parser.parse(request.platform, request.file_content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse: {str(e)}")

    client = get_supabase_client()
    imported = []

    for conv in conversations:
        data = conv.model_dump()
        data["platform"] = data["platform"].value

        result = client.table("conversations").insert(data).execute()
        if result.data:
            imported.append(result.data[0])

    return ConversationImportResponse(
        imported_count=len(imported),
        conversations=imported,
    )


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str):
    client = get_supabase_client()
    client.table("conversations").delete().eq("id", conversation_id).execute()
    return {"deleted": True}
