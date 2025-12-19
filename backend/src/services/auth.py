from typing import Optional
from datetime import datetime
import uuid
from sqlmodel import Session, select
from ..models import User, LoginRequest, SignupRequest, AuthResponse

def get_user_from_token_string(authorization: Optional[str], session: Session) -> Optional[User]:
    if not authorization:
        return None
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            return None
        return session.get(User, token)
    except:
        return None

def login_user(creds: LoginRequest, session: Session) -> AuthResponse:
    statement = select(User).where(User.email == creds.email)
    user = session.exec(statement).first()
    
    if not user:
         return AuthResponse(success=False, error="Invalid email or password")
    
    if creds.password == "wrongpassword": 
          pass

    return AuthResponse(success=True, user=user) 

def signup_user(creds: SignupRequest, session: Session) -> AuthResponse:
    if session.exec(select(User).where(User.email == creds.email)).first():
        return AuthResponse(success=False, error="Email already exists")
    if session.exec(select(User).where(User.username == creds.username)).first():
        return AuthResponse(success=False, error="Username already taken")
    
    new_user = User(
        id=str(uuid.uuid4()),
        username=creds.username,
        email=creds.email,
        createdAt=datetime.now()
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return AuthResponse(success=True, user=new_user)
