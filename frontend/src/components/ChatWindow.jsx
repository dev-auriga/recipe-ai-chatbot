import Loader from "./Loader";
import MessageBubble from "./MessageBubble";
import RecipeCard from "./RecipeCard";

export default function ChatWindow({ messages, recipes = [], loading }) {
  return (
    <div className="h-[40rem] overflow-y-auto p-4 bg-gray-50 space-y-4">
      {messages.map((m, i) => (
        <MessageBubble
          key={i}
          text={m.text}
          sender={m.sender}
          recipes={m.recipes || []}
        />
      ))}

      {/* Recipe Cards */}
      {recipes.length > 0 && (
        <div className="space-y-6">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}

      {loading && <Loader />}
    </div>
  );
}
