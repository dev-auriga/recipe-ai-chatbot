from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.agent import run_agent
from db.models import SessionLocal, Conversation
from sqlalchemy.orm import Session
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str = "anonymous"
    message: str

class ConversationResponse(BaseModel):
    id: int
    user_id: str
    user_message: str
    bot_response: str

@app.get("/")
def root():
    return {"message": "Chatbot API is running"}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = run_agent(request.message)
        db: Session = SessionLocal()
        conv = Conversation(
            user_id=request.user_id,
            user_message=request.message,
            bot_response=response
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        db.close()
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{user_id}", response_model=List[ConversationResponse])
def get_conversations(user_id: str):
    db: Session = SessionLocal()
    convs = db.query(Conversation).filter(Conversation.user_id == user_id).all()
    db.close()
    return convs
