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
