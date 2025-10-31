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
