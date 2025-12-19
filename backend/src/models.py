from enum import Enum
from typing import List, Optional
from sqlmodel import SQLModel, Field
from pydantic import EmailStr
from datetime import datetime, date

class GameMode(str, Enum):
    passthrough = "passthrough"
    walls = "walls"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class Position(SQLModel):
    x: int
    y: int

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    username: str = Field(index=True, unique=True)
    email: EmailStr = Field(index=True, unique=True)
    skin: str = Field(default="green")
    createdAt: datetime

class LeaderboardEntry(SQLModel, table=True):
    id: str = Field(primary_key=True)
    username: str
    score: int
    mode: GameMode
    date: date

class ActivePlayer(SQLModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: List[Position]
    food: Position
    direction: Direction
    startedAt: datetime

# API Models (Response/Request) - keep as SQLModel (inherits Pydantic)
class AuthResponse(SQLModel):
    success: bool
    user: Optional[User] = None
    error: Optional[str] = None

class ApiResponse(SQLModel):
    success: bool
    data: Optional[object] = None
    error: Optional[str] = None

# Request Models
class LoginRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=6)

class SignupRequest(SQLModel):
    username: str
    email: EmailStr
    password: str = Field(min_length=6)

class SubmitScoreRequest(SQLModel):
    score: int
    mode: GameMode

class UpdateProfileRequest(SQLModel):
    skin: str

