# db/setup_db.py
import os
import sys

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from db.database import engine, Base
from db.models import Conversation  # Force import to register model

if __name__ == "__main__":
    print(f"Creating database at: {os.path.join(PROJECT_ROOT, 'chat_history.db')}")
    Base.metadata.create_all(bind=engine)
    print("Table 'conversations' created successfully!")