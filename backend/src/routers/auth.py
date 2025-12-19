from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
from sqlmodel import Session
from ..models import AuthResponse, LoginRequest, SignupRequest, User, UpdateProfileRequest
from ..services import auth as auth_service
from ..database import get_session

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_current_user(authorization: Optional[str] = Header(None), session: Session = Depends(get_session)) -> Optional[User]:
    return auth_service.get_user_from_token_string(authorization, session)

@router.put("/profile", response_model=AuthResponse)
async def update_profile(
    profile_req: UpdateProfileRequest, 
    user: Optional[User] = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    if not user:
        return AuthResponse(success=False, error="Not authenticated")
    
    user.skin = profile_req.skin
    session.add(user)
    session.commit()
    session.refresh(user)
    return AuthResponse(success=True, user=user)

@router.post("/login", response_model=AuthResponse)
async def login(creds: LoginRequest, session: Session = Depends(get_session)):
    return auth_service.login_user(creds, session)

@router.post("/signup", response_model=AuthResponse)
async def signup(creds: SignupRequest, session: Session = Depends(get_session)):
    return auth_service.signup_user(creds, session)

@router.post("/logout")
async def logout():
    return {"success": True}

@router.get("/me")
async def get_me(user: Optional[User] = Depends(get_current_user)):
    return {"success": True, "data": user}
