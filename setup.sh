#!/usr/bin/env bash
set -e  # exit on error

# === CONFIG ===
PROJECT_NAME="RecipeAI"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
PY_VERSION="3.10"

# === HEADER ===
echo "🔧 Setting up $PROJECT_NAME ..."
echo "-------------------------------------------"

# === 1. Python Environment ===
echo "🐍 Checking Python..."
if ! command -v python3 &>/dev/null; then
  echo "❌ Python3 not found. Please install Python $PY_VERSION+ and rerun."
  exit 1
fi

echo "📦 Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

echo "📥 Upgrading pip..."
pip install --upgrade pip

echo "📥 Installing backend dependencies..."
pip install -r $BACKEND_DIR/requirements.txt || {
  echo "❌ requirements.txt not found. Creating a default one..."
  cat > $BACKEND_DIR/requirements.txt <<'EOF'
fastapi
uvicorn
requests
python-dotenv
langchain
langchain-core
langchain-groq
langgraph
EOF
  pip install -r $BACKEND_DIR/requirements.txt
}

# === 2. Environment Variables ===
echo "🗝️  Setting up environment variables..."
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<'EOF'
# === SPOONACULAR & GROQ KEYS ===
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# === SERVER CONFIG ===
HOST=0.0.0.0
PORT=8000
EOF
  echo "✅ Created $ENV_FILE — please edit it with your actual API keys."
else
  echo "ℹ️  Found existing $ENV_FILE"
fi

# === 3. Frontend Setup ===
echo "🌐 Setting up React frontend..."
cd $FRONTEND_DIR

if ! command -v npm &>/dev/null; then
  echo "❌ npm not found. Please install Node.js (v18+) and rerun."
  exit 1
fi

echo "📦 Installing Node dependencies..."
npm install

# build Tailwind if applicable
if grep -q "tailwindcss" package.json; then
  echo "🎨 Detected TailwindCSS setup — building styles..."
  npx tailwindcss init -p || true
fi

cd ..

# === 4. Run instructions ===
echo ""
echo "🚀 Setup complete!"
echo "-------------------------------------------"
echo "To start the backend server:"
echo "  source .venv/bin/activate"
echo "  cd $BACKEND_DIR && uvicorn main:app --reload --port 8000"
echo ""
echo "To start the frontend:"
echo "  cd $FRONTEND_DIR && npm run dev"
echo ""
echo "Then open 👉 http://localhost:5173"
echo "-------------------------------------------"
