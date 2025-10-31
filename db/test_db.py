from db.database import SessionLocal
from db.models import Conversation

if __name__ == "__main__":
    db = SessionLocal()
    try:
        conv = Conversation(user_id="test", user_message="Hello", bot_response="Hi")
        db.add(conv)
        db.commit()
        print("DB test successful.")
    finally:
        db.close()
