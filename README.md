---
# 🧑‍🍳 RecipeAI — Conversational Recipe Chatbot

A full-stack conversational chatbot that helps you discover, understand, and cook recipes — powered by **LangChain**, **LangGraph**, **FastAPI**, and **React (Vite + Tailwind)** with persistent chat history in a database.

This project showcases how to integrate **LLMs** with **external APIs (Spoonacular)** for real-world data enrichment and present it through a modern, elegant chat interface.
---

## 🏗️ Tech Stack

| Layer           | Technology                                 |
| --------------- | ------------------------------------------ |
| **Frontend**    | React 18 + Vite + Tailwind CSS             |
| **Backend**     | FastAPI                                    |
| **AI/Logic**    | LangChain + LangGraph + Llama 3 (Groq API) |
| **Data Source** | Spoonacular API                            |
| **Database**    | SQLite (default) or PostgreSQL             |
| **Language**    | Python 3.10+                               |

---

## 📁 Project Structure

```
recipeai-chatbot/
├── backend/
│   ├── agent.py             # LangChain + LangGraph agent logic (LLM + Spoonacular API)
│   ├── config.py            # API key + env configuration
│   ├── main.py              # FastAPI app entry point (chat + conversation routes)
│   ├── requirements.txt     # Backend dependencies
│   └── test_agent.py        # Local agent test script
│
├── db/
│   ├── database.py          # SQLAlchemy database setup
│   ├── models.py            # Conversation history models
│   ├── setup_db.py          # Create tables
│   └── test_db.py           # DB verification
│
├── frontend/
│   ├── index.html           # App entry page (🧑‍🍳 favicon)
│   ├── src/
│   │   ├── api.js           # Axios calls to FastAPI
│   │   ├── App.jsx          # Root app logic
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── RecipeCard.jsx
│   │   └── main.jsx         # React entry point
│   └── tailwind.config.js   # Tailwind setup
│
├── .env                     # API keys + database URL
├── .env.example             # Example environment file
├── setup.sh                 # Install dependencies & initialize DB
├── start_backend.sh         # Run FastAPI backend
├── start_frontend.sh        # Run React frontend (Vite dev)
└── README.md
```

---

## ✨ Features

- **Conversational Recipe Discovery**
  Chat naturally — ask “something with chickpeas and onions” or “a quick chicken with rice dinner”.

- **Rich Recipe Details**
  The bot retrieves:

  - Full ingredient list
  - Step-by-step cooking instructions
  - Nutrition facts (calories, protein, carbs, fat)
  - Prep time and servings
  - Similar recipe suggestions

- **Beautiful UI**
  A clean, modern chat interface built with Tailwind CSS — shows recipe cards with images, facts, and clickable links.

- **Hybrid Intelligence**
  Uses **Spoonacular API** for factual data and **LLM** for natural, context-aware responses.

- **Persistent Conversations**
  Stores user messages and bot replies in SQLite or PostgreSQL.

- **Extensible Agent Graph**
  Built with **LangGraph**, so you can easily add more tools (e.g., restaurant finder, calorie calculator, wine pairing).

---

## ⚙️ Setup & Installation

### 1️⃣ Environment Setup

Clone and enter the project:

```bash
git clone https://github.com/yourname/recipeai-chatbot.git
cd recipeai-chatbot
```

Copy the environment template and fill in your keys:

```bash
cp .env.example .env
```

**Required in `.env`:**

```
OPENAI_API_KEY=your_openai_or_groq_key
SPOONACULAR_API_KEY=your_spoonacular_key
DATABASE_URL=sqlite:///./chat_history.db
```

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
python ../db/setup_db.py  # Initialize the database
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🧠 Example Usage

You can ask:

- “Give me a recipe for chicken with rice”
- “How can I make something with chickpeas and onions?”
- “Show me healthy breakfast options”

The bot replies with:

- Beautifully formatted recipe cards
- Images
- Nutrition facts
- Similar recipes and article links

---

## 🧩 API Endpoints

| Method | Endpoint                   | Description                                         |
| ------ | -------------------------- | --------------------------------------------------- |
| `GET`  | `/`                        | Health check                                        |
| `GET`  | `/conversations/{user_id}` | Retrieve chat history                               |
| `POST` | `/chat`                    | Send a message and receive LLM + API-enhanced reply |

---

## 🧪 Testing

Test the backend agent:

```bash
python backend/test_agent.py
```

Test the database:

```bash
python db/test_db.py
```

---

## 🚀 Future Enhancements

- 🔄 Real-time streaming responses
- 🧭 Multi-agent routing (nutrition analyzer, meal planner, etc.)
- 🧑‍💻 User authentication
- ☁️ Cloud deployment with Docker & Gunicorn
- 🎙️ Voice input/output
- ⚡ Redis caching for faster API lookups

---

## 🧑‍🍳 Credits

Built with ❤️ using
**FastAPI**, **LangChain**, **LangGraph**, **React**, and **Tailwind CSS**
by a developer who loves both code and good food 🍽️

---
