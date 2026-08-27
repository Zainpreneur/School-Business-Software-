import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="text-xl font-bold text-slate-800">Page not found</h1>
      <p className="text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 text-brand-600 hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
}
