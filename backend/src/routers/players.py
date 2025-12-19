from fastapi import APIRouter
from typing import List, Optional

from ..models import ApiResponse, ActivePlayer
from ..database import db

router = APIRouter(prefix="/players", tags=["players"])

@router.get("/", response_model=ApiResponse)
async def get_active_players():
    # simulate some movement or just return static for API
    return ApiResponse(success=True, data=db.get_active_players())

@router.get("/{player_id}", response_model=ApiResponse)
async def get_player_state(player_id: str):
    player = db.get_player(player_id)
    return ApiResponse(success=True, data=player)
