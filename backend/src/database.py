from sqlmodel import SQLModel, create_engine, Session
from .models import User, LeaderboardEntry, ActivePlayer
import os

sqlite_file_name = "snake.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# Helper for ActivePlayers (keep in-memory for now as it's ephemeral game state)
class GameStateStore:
    def __init__(self):
        self.active_players = []

    def get_active_players(self):
        return self.active_players
    
    def get_player(self, player_id):
        return next((p for p in self.active_players if p.id == player_id), None)

db = GameStateStore()
