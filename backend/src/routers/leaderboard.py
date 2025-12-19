from fastapi import APIRouter, HTTPException, Header, Depends
from typing import List, Optional
from datetime import date
import uuid
from sqlmodel import Session, select

from ..models import ApiResponse, LeaderboardEntry, SubmitScoreRequest, GameMode, User, ActivePlayer
from ..database import get_session
from .auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("/", response_model=ApiResponse)
async def get_leaderboard(mode: Optional[GameMode] = None, username: Optional[str] = None, session: Session = Depends(get_session)):
    query = select(LeaderboardEntry)
    if mode:
        query = query.where(LeaderboardEntry.mode == mode)
    if username:
        query = query.where(LeaderboardEntry.username == username)
    
    entries = session.exec(query).all()
    # Sort by score descending
    sorted_entries = sorted(entries, key=lambda x: x.score, reverse=True)
    return ApiResponse(success=True, data=sorted_entries)

@router.post("/", response_model=ApiResponse)
async def submit_score(score_req: SubmitScoreRequest, user: Optional[User] = Depends(get_current_user), session: Session = Depends(get_session)):
    if not user:
        return ApiResponse(success=False, error="Must be logged in to submit score")
    
    entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        username=user.username,
        score=score_req.score,
        mode=score_req.mode,
        date=date.today()
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return ApiResponse(success=True, data=entry)
