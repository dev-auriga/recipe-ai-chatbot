from agent import run_agent

if __name__ == "__main__":
    message = "Suggest a recipe with pasta"
    response = run_agent(message)
    print("Bot response:", response)
