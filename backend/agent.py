# backend/agent.py
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any
import requests
import re
import html
from backend.config import SPOONACULAR_API_KEY, GROQ_API_KEY

# Setup LLM
llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=GROQ_API_KEY, temperature=0.6)

class AgentState(TypedDict):
    user_message: str
    recipes: List[Dict[str, Any]]
    final_response: str

# Utilities
def strip_html(text: str) -> str:
    if not text:
        return ""
    # Unescape HTML entities then remove tags
    t = html.unescape(text)
    t = re.sub(r"<br\s*/?>", "\n", t)
    t = re.sub(r"<[^>]+>", "", t)
    # Normalize whitespace
    t = re.sub(r"\n\s+\n", "\n\n", t)
    return t.strip()

# 1) Search top recipes -> fetch details & nutrition & similar
def call_api(state: AgentState) -> AgentState:
    query = state["user_message"]
    recipes_out = []
    base_search = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "query": query,
        "number": 3,
        "addRecipeInformation": True,
        "fillIngredients": True,
        "apiKey": SPOONACULAR_API_KEY
    }

    try:
        resp = requests.get(base_search, params=params, timeout=12)
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results", []) or []
    except Exception as e:
        results = []

    # 🔁 Fallback: if no results, use findByIngredients
    if not results:
        try:
            fb_url = "https://api.spoonacular.com/recipes/findByIngredients"
            fb_params = {
                "ingredients": query,
                "number": 3,
                "ranking": 1,
                "ignorePantry": True,
                "apiKey": SPOONACULAR_API_KEY
            }
            fb_resp = requests.get(fb_url, params=fb_params, timeout=10)
            fb_resp.raise_for_status()
            fb_data = fb_resp.json()
            results = fb_data or []
        except Exception:
            results = []

    # 🧩 Build detailed recipe data
    for r in results:
        rid = r.get("id")
        title = r.get("title")
        image = None
        if info and info.get("image"):
            image = info.get("image")
        elif r.get("image"):
            image = r.get("image")
        elif rid:
            image = f"https://spoonacular.com/recipeImages/{rid}-636x393.jpg"
        else:
            image = None
        source_url = r.get("sourceUrl") or r.get("spoonacularSourceUrl") or None

        # If fallback mode, fetch full info
        info_url = f"https://api.spoonacular.com/recipes/{rid}/information"
        try:
            info_resp = requests.get(info_url, params={"apiKey": SPOONACULAR_API_KEY}, timeout=10)
            info_resp.raise_for_status()
            info = info_resp.json()
        except Exception:
            info = {}

        ready_in = info.get("readyInMinutes")
        servings = info.get("servings")
        summary = strip_html(info.get("summary", "") or "")

        # Ingredients
        ingredients = []
        for ig in info.get("extendedIngredients", []):
            orig = ig.get("originalString") or ig.get("original")
            if orig:
                ingredients.append(strip_html(orig))

        # Steps
        steps = []
        ais = info.get("analyzedInstructions") or []
        if ais:
            for section in ais:
                for step in section.get("steps", []):
                    st = step.get("step")
                    if st:
                        steps.append(strip_html(st))
        elif info.get("instructions"):
            instructions_text = strip_html(info["instructions"])
            for s in re.split(r'(?<=[.!?])\s+', instructions_text):
                s = s.strip()
                if s:
                    steps.append(s)

        # Nutrition
        try:
            nut_resp = requests.get(
                f"https://api.spoonacular.com/recipes/{rid}/nutritionWidget.json",
                params={"apiKey": SPOONACULAR_API_KEY},
                timeout=8
            )
            if nut_resp.status_code == 200:
                nut = nut_resp.json()
                calories = nut.get("calories")
                carbs = nut.get("carbs")
                fat = nut.get("fat")
                protein = nut.get("protein")
            else:
                calories = carbs = fat = protein = None
        except Exception:
            calories = carbs = fat = protein = None

        # Similar recipes
        try:
            sim_resp = requests.get(
                f"https://api.spoonacular.com/recipes/{rid}/similar",
                params={"number": 3, "apiKey": SPOONACULAR_API_KEY},
                timeout=8
            )
            if sim_resp.status_code == 200:
                sim_json = sim_resp.json() or []
                similar = [{"id": s.get("id"), "title": s.get("title")} for s in sim_json]
            else:
                similar = []
        except Exception:
            similar = []

        recipes_out.append({
            "id": rid,
            "title": title,
            "image": image,
            "sourceUrl": source_url,
            "readyInMinutes": ready_in,
            "servings": servings,
            "summary": summary,
            "ingredients": ingredients,
            "steps": steps,
            "nutrition": {
                "calories": calories,
                "carbs": carbs,
                "fat": fat,
                "protein": protein
            },
            "similar": similar
        })

    state["recipes"] = recipes_out
    return state


# 2) LLM synthesizes a Markdown-styled full reply (with intro & per-recipe bullets)
def process_with_llm(state: AgentState) -> AgentState:
    recipes = state.get("recipes", []) or []
    if not recipes:
        state["final_response"] = "I couldn't find recipes for that query. Could you give me more details (e.g., ingredients you have)?"
        return state

    # Prepare a compact textual representation for the LLM (not HTML)
    blocks = []
    for r in recipes:
        block = {
            "title": r.get("title"),
            "time": r.get("readyInMinutes"),
            "servings": r.get("servings"),
            "calories": r.get("nutrition", {}).get("calories"),
            "ingredients": r.get("ingredients")[:12],  # sample
            "steps_count": len(r.get("steps", [])),
            "link": r.get("sourceUrl")
        }
        blocks.append(block)

    recipes_text = ""
    for b in blocks:
        parts = [f"Title: {b['title']}"]
        if b["time"]:
            parts.append(f"Time: {b['time']} min")
        if b["servings"]:
            parts.append(f"Serves: {b['servings']}")
        if b["calories"]:
            parts.append(f"Calories: {b['calories']}")
        parts.append(f"Ingredients sample: {', '.join(b['ingredients'][:6]) if b['ingredients'] else 'N/A'}")
        parts.append(f"Steps count: {b['steps_count']}")
        parts.append(f"Link: {b['link']}")
        recipes_text += "\n".join(parts) + "\n\n---\n\n"

    prompt_template = """
You are a professional, friendly recipe assistant (no HTML). The user asked: {user_message}

Below are the top recipes found (each block separated by ---). Using only the provided information (and not inventing details), produce a Markdown-formatted message that includes:

- A short chef-style introduction recommending which recipe to try and WHY (1-2 sentences).
- For each recipe (numbered), include:
  - A bold title line (e.g., **1) Garlic Chicken Stir-Fry**)
  - A one-line summary (1 sentence) highlighting what the dish is and a pro (e.g., quick, healthy).
  - A **Ingredients** subheading with the full ingredient list (if available in provided JSON, else list "See recipe link").
  - A **Steps** subheading containing either a numbered step list if steps are available or "See recipe link".
  - A **Nutrition** subheading listing Calories, Carbs, Fat, Protein (if available). Use "N/A" when missing.
  - A "Source" line with "View full recipe: <url>" (so frontend can render link).

- At the end include a "Similar recipes:" bullet list with titles (if available).
- Keep the reply concise but full — do not include raw HTML tags. Use Markdown features (**, ###, 1., -).
- Use plain text only; do NOT include HTML tags or HTML entities.

Here are the recipe blocks:

{recipes_text}
"""
    prompt = ChatPromptTemplate.from_template(prompt_template)
    chain = prompt | llm
    try:
        resp = chain.invoke({"user_message": state["user_message"], "recipes_text": recipes_text})
        final_text = resp.content
        # Ensure no HTML sneaks through
        final_text = strip_html(final_text)
    except Exception:
        final_text = "I found recipes; see the detailed cards below. (Summary unavailable due to LLM error.)"

    state["final_response"] = final_text
    return state

# Build the graph and compile
graph = StateGraph(AgentState)
graph.add_node("call_api", call_api)
graph.add_node("process_llm", process_with_llm)
graph.add_edge("call_api", "process_llm")
graph.add_edge("process_llm", END)
graph.set_entry_point("call_api")
app = graph.compile()

# Public function used by FastAPI
def run_agent(message: str) -> dict:
    """
    Returns:
      {
        "text": <markdown text produced by LLM>,
        "recipes": [ {id,title,image,sourceUrl,readyInMinutes,servings,summary,ingredients,steps,nutrition,similar}, ... ]
      }
    """
    inputs = {"user_message": message}
    result = app.invoke(inputs)
    return {
        "text": result.get("final_response", ""),
        "recipes": result.get("recipes", [])
    }
