#!/bin/bash

# Exit on any error
set -e

# Create directories
mkdir -p backend db frontend/src/components

# Root files
cat << 'EOF' > .env
OPENAI_API_KEY=your_openai_key_here
SPOONACULAR_API_KEY=your_spoonacular_key_here
DATABASE_URL=sqlite:///chat_history.db
EOF

cat << 'EOF' > requirements.txt
fastapi==0.104.1
uvicorn==0.24.0.post1
langchain==0.1.10
langgraph==0.0.20
langchain_openai==0.0.8
sqlalchemy==2.0.23
python-dotenv==1.0.0
requests==2.31.0
EOF

cat << 'EOF' > setup.sh
#!/bin/bash
pip install -r requirements.txt
python db/setup_db.py
cd frontend && npm install
cd ..
EOF

cat << 'EOF' > start_backend.sh
#!/bin/bash
uvicorn backend.main:app --reload
EOF

cat << 'EOF' > start_frontend.sh
#!/bin/bash
cd frontend && npm run dev
EOF

cat << 'EOF' > open_frontend.sh
#!/bin/bash
xdg-open http://localhost:5173  # Linux
# open http://localhost:5173  # Uncomment for macOS
# start http://localhost:5173  # Uncomment for Windows
EOF

chmod +x *.sh

# Backend files
cat << 'EOF' > backend/main.py
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
EOF

cat << 'EOF' > backend/agent.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from typing import TypedDict
import requests
from backend.config import SPOONACULAR_API_KEY, OPENAI_API_KEY

llm = ChatOpenAI(model="gpt-3.5-turbo", api_key=OPENAI_API_KEY)

class AgentState(TypedDict):
    user_message: str
    api_result: str
    final_response: str

def call_api(state: AgentState) -> AgentState:
    query = state["user_message"]
    url = f"https://api.spoonacular.com/recipes/complexSearch?query={query}&apiKey={SPOONACULAR_API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        recipes = data.get("results", [])
        if recipes:
            state["api_result"] = f"Suggested recipe: {recipes[0]['title']} - {recipes[0]['sourceUrl']}"
        else:
            state["api_result"] = "No recipes found."
    else:
        state["api_result"] = "API call failed."
    return state

def process_with_llm(state: AgentState) -> AgentState:
    prompt = ChatPromptTemplate.from_template(
        "Based on user query: {user_message} and API result: {api_result}, generate a helpful response."
    )
    chain = prompt | llm
    response = chain.invoke({"user_message": state["user_message"], "api_result": state["api_result"]})
    state["final_response"] = response.content
    return state

graph = StateGraph(AgentState)
graph.add_node("call_api", call_api)
graph.add_node("process_llm", process_with_llm)
graph.add_edge("call_api", "process_llm")
graph.add_edge("process_llm", END)
graph.set_entry_point("call_api")
app = graph.compile()

def run_agent(message: str) -> str:
    inputs = {"user_message": message}
    result = app.invoke(inputs)
    return result["final_response"]
 pacientes
EOF

cat << 'EOF' > backend/config.py
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///chat_history.db")
EOF

cat << 'EOF' > backend/test_agent.py
from agent import run_agent

if __name__ == "__main__":
    message = "Suggest a recipe with pasta"
    response = run_agent(message)
    print("Bot response:", response)
EOF

# DB files
cat << 'EOF' > db/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
EOF

cat << 'EOF' > db/models.py
from sqlalchemy import Column, Integer, String
from db.database import Base

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_message = Column(String)
    bot_response = Column(String)
EOF

cat << 'EOF' > db/setup_db.py
from db.database import engine, Base

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")
EOF

cat << 'EOF' > db/test_db.py
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
EOF

# Frontend files
cat << 'EOF' > frontend/package.json
{
  "name": "chatbot-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16",
    "vite": "^4.4.5"
  }
}
EOF

cat << 'EOF' > frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: []
}
EOF

cat << 'EOF' > frontend/postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat << 'EOF' > frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
EOF

cat << 'EOF' > frontend/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recipe Chatbot</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

cat << 'EOF' > frontend/src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat << 'EOF' > frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

cat << 'EOF' > frontend/src/App.jsx
import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import { getConversations, sendMessage } from './api';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = 'anonymous';

  useEffect(() => {
    async function load() {
      const convs = await getConversations(userId);
      setMessages(convs.flatMap(c => [
        { text: c.user_message, sender: 'user' },
        { text: c.bot_response, sender: 'bot' }
      ]));
    }
    load();
  }, []);

  const handleSend = async (msg) => {
    setMessages(m => [...m, { text: msg, sender: 'user' }]);
    setLoading(true);
    const res = await sendMessage(userId, msg);
    setMessages(m => [...m, { text: res, sender: 'bot' }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
        <ChatWindow messages={messages} loading={loading} />
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}

export default App;
EOF

cat << 'EOF' > frontend/src/components/ChatWindow.jsx
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, loading }) {
  return (
    <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
      {messages.map((m, i) => (
        <MessageBubble key={i} text={m.text} sender={m.sender} />
      ))}
      {loading && <div className="text-center text-gray-500">Thinking...</div>}
    </div>
  );
}
EOF

cat << 'EOF' > frontend/src/components/MessageInput.jsx
import { useState } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={submit} className="p-4 border-t flex">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Ask for a recipe..."
        className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        Send
      </button>
    </form>
  );
}
EOF

cat << 'EOF' > frontend/src/components/MessageBubble.jsx
export default function MessageBubble({ text, sender }) {
  const isUser = sender === 'user';
  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className={`max-w-xs p-3 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
        {text}
      </div>
    </div>
  );
}
EOF

cat << 'EOF' > frontend/src/api.js
import axios from 'axios';

const API = 'http://localhost:8000';

export const sendMessage = (userId, message) =>
  axios.post(`${API}/chat`, { user_id: userId, message }).then(r => r.data.response);

export const getConversations = (userId) =>
  axios.get(`${API}/conversations/${userId}`).then(r => r.data);
EOF

# Initialize Git
git init
git add .
git commit -m "Initial commit: Full-stack Recipe Chatbot with LangChain + FastAPI + React"

echo "Project created successfully!"
echo "Next steps:"
echo "1. cd into project folder"
echo "2. Edit .env with your API keys"
echo "3. Run: ./setup.sh"
echo "4. Run: ./start_backend.sh  (in one terminal)"
echo "5. Run: ./start_frontend.sh  (in another)"
echo "6. Open: http://localhost:5173"