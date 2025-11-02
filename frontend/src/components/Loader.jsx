import React from "react";

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 select-none">
      {/* Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer rotating gradient ring */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-orange-400 to-yellow-400 animate-spin-slow blur-[1px] shadow-lg shadow-orange-400/30"></div>

        {/* Middle soft glow */}
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-orange-200/50 to-transparent blur-md"></div>

        {/* Inner circle */}
        <div className="absolute w-14 h-14 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700"></div>

        {/* Center icon */}
        <div className="absolute text-3xl animate-bounce drop-shadow-sm">
          🍳
        </div>
      </div>

      {/* Text */}
      <p className="mt-8 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-yellow-500 animate-text-shimmer italic tracking-wide">
        Cooking up ideas...
      </p>

      {/* Animations */}
      <style jsx>{`
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes text-shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2.8s linear infinite;
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Loader;
