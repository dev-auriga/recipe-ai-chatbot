import { ExternalLink, Flame, Utensils, Soup, Leaf } from "lucide-react";

export default function RecipeCard({ recipe }) {
  return (
    <div className="relative bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      {/* 🍳 Header Image with Overlay */}
      <div className="relative h-64 overflow-hidden">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-sm">
            No Image Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        <div className="absolute bottom-4 left-5">
          <h3 className="text-2xl font-extrabold text-white drop-shadow-lg leading-tight">
            {recipe.title}
          </h3>
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-200 hover:text-blue-100 mt-1 transition"
            >
              View Recipe <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* 🥗 Content Section */}
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          {recipe.readyInMinutes && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 px-3 py-1.5 rounded-full shadow-sm">
              <Flame className="w-4 h-4" /> {recipe.readyInMinutes} min
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-3 py-1.5 rounded-full shadow-sm">
              <Utensils className="w-4 h-4" /> {recipe.servings} servings
            </div>
          )}
        </div>

        {/* Nutrition Info */}
        {recipe.nutrition && (
          <div className="grid grid-cols-4 gap-3 text-center text-xs font-medium">
            {recipe.nutrition.calories && (
              <div className="py-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 shadow-sm">
                <p className="uppercase text-[10px] tracking-wide">Calories</p>
                <p className="text-base font-bold">
                  {recipe.nutrition.calories}
                </p>
              </div>
            )}
            {recipe.nutrition.protein && (
              <div className="py-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-green-800 shadow-sm">
                <p className="uppercase text-[10px] tracking-wide">Protein</p>
                <p className="text-base font-bold">
                  {recipe.nutrition.protein}
                </p>
              </div>
            )}
            {recipe.nutrition.carbs && (
              <div className="py-3 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-800 shadow-sm">
                <p className="uppercase text-[10px] tracking-wide">Carbs</p>
                <p className="text-base font-bold">{recipe.nutrition.carbs}</p>
              </div>
            )}
            {recipe.nutrition.fat && (
              <div className="py-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-red-800 shadow-sm">
                <p className="uppercase text-[10px] tracking-wide">Fat</p>
                <p className="text-base font-bold">{recipe.nutrition.fat}</p>
              </div>
            )}
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-800 mb-2 text-lg">
              <Soup className="w-5 h-5 text-orange-500" /> Ingredients
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  {/* <span className="text-gray-400">•</span> */}
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        {recipe.steps?.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-800 mb-2 text-lg">
              <Leaf className="w-5 h-5 text-green-600" /> Steps
            </h4>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              {recipe.steps.map((st, i) => (
                <li
                  key={i}
                  className="bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition"
                >
                  {st}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Similar Recipes */}
        {recipe.similar?.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-lg">
              Similar Recipes
            </h4>
            <div className="flex flex-wrap gap-2">
              {recipe.similar.map((s) => (
                <a
                  key={s.id}
                  href={`https://spoonacular.com/recipes/${s.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}-${s.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 px-3 py-1.5 rounded-full transition-all shadow-sm"
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
