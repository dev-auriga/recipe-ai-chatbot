import { useState, useEffect, useRef } from "react";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import { getConversations, sendMessage } from "./api";

function App() {
  const [messages, setMessages] = useState([]); // each: { text, sender, recipes? }
  const [loading, setLoading] = useState(false);
  const userId = "anonymous";
  const chatRef = useRef(null);

  // Load saved conversations
  useEffect(() => {
    async function load() {
      try {
        const convs = await getConversations(userId);
        const msgs = convs.flatMap((c) => [
          { text: c.user_message, sender: "user" },
          { text: c.bot_response, sender: "bot" },
        ]);
        setMessages(msgs);
      } catch (e) {
        console.warn("Could not load conversations", e);
      }
    }
    load();
  }, []);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle message send
  const handleSend = async (msg) => {
    setMessages((m) => [...m, { text: msg, sender: "user" }]);
    setLoading(true);

    try {
      const res = await sendMessage(userId, msg); // { text, recipes }
      setMessages((m) => [
        ...m,
        {
          text: res.text || "No response received.",
          sender: "bot",
          recipes: res.recipes || [],
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { text: "Sorry — couldn't reach the server.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col"
        style={{ height: "88vh" }}
      >
        {/* Header */}
        <header className="p-4 border-b bg-white/70 backdrop-blur">
          <h1 className="text-2xl font-semibold text-gray-800">
            🍳 Recipe Chatbot
          </h1>
          <p className="text-sm text-gray-500">
            Complete recipes, ingredients, steps & nutrition — powered by
            Spoonacular + LLM
          </p>
        </header>

        {/* Chat Area */}
        <div ref={chatRef} className="flex-1 overflow-y-auto">
          <ChatWindow messages={messages} loading={loading} />
        </div>

        {/* Input */}
        <div className="border-t bg-gray-50">
          <MessageInput onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
