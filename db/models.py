from sqlalchemy import Column, Integer, String
from db.database import Base

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_message = Column(String)
    bot_response = Column(String)
