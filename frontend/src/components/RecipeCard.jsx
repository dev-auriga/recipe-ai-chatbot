import { ExternalLink } from "lucide-react";

export default function RecipeCard({ recipe }) {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
          {recipe.title}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
            >
              <ExternalLink className="inline-block w-4 h-4" />
            </a>
          )}
        </h3>

        {recipe.summary && (
          <p className="text-sm text-gray-600 line-clamp-3">{recipe.summary}</p>
        )}

        {/* Nutrition Section */}
        {recipe.nutrition && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-center">
            {recipe.nutrition.calories && (
              <div className="bg-blue-50 rounded-md p-2">
                <span className="font-medium text-blue-700">Calories</span>
                <p>{recipe.nutrition.calories}</p>
              </div>
            )}
            {recipe.nutrition.protein && (
              <div className="bg-green-50 rounded-md p-2">
                <span className="font-medium text-green-700">Protein</span>
                <p>{recipe.nutrition.protein}</p>
              </div>
            )}
            {recipe.nutrition.carbs && (
              <div className="bg-yellow-50 rounded-md p-2">
                <span className="font-medium text-yellow-700">Carbs</span>
                <p>{recipe.nutrition.carbs}</p>
              </div>
            )}
            {recipe.nutrition.fat && (
              <div className="bg-red-50 rounded-md p-2">
                <span className="font-medium text-red-700">Fat</span>
                <p>{recipe.nutrition.fat}</p>
              </div>
            )}
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div>
            <h4 className="font-semibold mt-2 text-gray-700">Ingredients:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {recipe.ingredients.slice(0, 10).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        {recipe.steps?.length > 0 && (
          <div>
            <h4 className="font-semibold mt-2 text-gray-700">Steps:</h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              {recipe.steps.slice(0, 5).map((st, i) => (
                <li key={i}>{st}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Similar Recipes */}
        {recipe.similar?.length > 0 && (
          <div className="mt-3">
            <h4 className="font-semibold text-gray-700">Similar Recipes:</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {recipe.similar.map((s) => (
                <a
                  key={s.id}
                  href={`https://spoonacular.com/recipes/${s.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-${s.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
