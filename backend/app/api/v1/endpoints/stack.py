from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_supabase_client

router = APIRouter()


class StackItem(BaseModel):
    id: str | None = None
    category: str
    tool_name: str
    version: str | None = None
    config: dict = {}
    notes: str | None = None


class StackItemCreate(BaseModel):
    category: str
    tool_name: str
    version: str | None = None
    config: dict = {}
    notes: str | None = None


class StackItemUpdate(BaseModel):
    tool_name: str | None = None
    version: str | None = None
    config: dict | None = None
    notes: str | None = None


@router.get("", response_model=List[StackItem])
async def list_stack():
    """Get all stack items."""
    client = get_supabase_client()
    result = client.table("user_stack").select("*").order("category").execute()
    return result.data


@router.get("/{category}", response_model=StackItem)
async def get_stack_item(category: str):
    """Get a specific stack item by category."""
    client = get_supabase_client()
    result = client.table("user_stack").select("*").eq("category", category).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Stack item not found: {category}")
    return result.data


@router.post("", response_model=StackItem)
async def create_stack_item(item: StackItemCreate):
    """Add a new stack item."""
    client = get_supabase_client()
    result = client.table("user_stack").insert(item.model_dump()).execute()
    return result.data[0]


@router.put("/{category}", response_model=StackItem)
async def update_stack_item(category: str, item: StackItemUpdate):
    """Update a stack item by category."""
    client = get_supabase_client()

    # Filter out None values
    update_data = {k: v for k, v in item.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = client.table("user_stack").update(update_data).eq("category", category).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Stack item not found: {category}")
    return result.data[0]


@router.delete("/{category}")
async def delete_stack_item(category: str):
    """Delete a stack item by category."""
    client = get_supabase_client()
    result = client.table("user_stack").delete().eq("category", category).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Stack item not found: {category}")
    return {"message": f"Deleted stack item: {category}"}
