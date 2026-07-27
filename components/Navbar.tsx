import React from "react";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-gradient-to-b from-black/60 to-transparent">
      {/* Logo (Adventure Atlas cursive style mapped to Lighthouse) */}
      <div className="font-cursive text-3xl text-white tracking-wide flex items-center gap-2 heading">
        Lighthouse
      </div>

      {/* Main Navigation Links */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-200">
        <a
          href="#"
          className="text-purple-400 border-b-2 border-purple-400 pb-1"
        >
          Dashboard
        </a>
        <div className="group relative cursor-pointer flex items-center space-x-1 hover:text-white">
          <a
            href="/property-canvas"
            className="hover:text-purple-400 transition"
          >
            <span>Property Canvas</span>
          </a>
        </div>
        <a href="/settings" className="hover:text-white transition">
          <span>Settings</span>
        </a>
      </div>

      {/* Right Utility */}
      <div className="flex items-center space-x-6 text-sm font-medium">
        <button className="bg-[#7c3aed] hover:bg-[#6d28d9] transition text-white px-5 py-2.5 rounded shadow-lg text-sm font-semibold tracking-wide hidden sm:block">
          + New Listing
        </button>
      </div>
    </nav>
  );
}
