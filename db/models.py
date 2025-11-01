# db/models.py
from sqlalchemy import Column, Integer, String
from db.database import Base, SessionLocal  # <-- ADD THIS LINE

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_message = Column(String)
    bot_response = Column(String)

# Re-export so main.py can do: from db.models import SessionLocal, Conversation
__all__ = ["Conversation", "SessionLocal"]