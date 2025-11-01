import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RecipeCard from "./RecipeCard";

export default function MessageBubble({ text, sender, recipes = [] }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex w-full mb-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-2xl p-4 rounded-2xl ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-50 text-gray-800 rounded-bl-none shadow-md border border-gray-200"
        }`}
      >
        {/* Message text */}
        {text && (
          <div
            className={`prose max-w-none ${
              isUser
                ? "prose-invert prose-p:leading-snug"
                : "prose-p:leading-snug"
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        )}

        {/* Recipes Grid (for bot only) */}
        {!isUser && recipes.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipes.map((recipe, i) => (
              <RecipeCard key={i} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
