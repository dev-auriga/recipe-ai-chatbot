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
