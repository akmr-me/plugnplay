"use client";
export function Note({ children }) {
  return (
    <div className="bg-gray-50 border-l-4 border-l-gray-400 p-3 my-4">
      <div className="flex items-start">
        <span className="text-gray-500 mr-2">💡</span>
        <p className="text-sm text-gray-700">{children}</p>
      </div>
    </div>
  );
}
