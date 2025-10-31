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
