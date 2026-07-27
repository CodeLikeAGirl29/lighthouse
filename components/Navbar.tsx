"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/property-canvas", label: "Property Canvas" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="absolute top-0 left-0 w-full z-10 flex items-center justify-between px-6 md:px-12 py-6 bg-gradient-to-b from-abyss/90 to-transparent">
      {/* Wordmark — display face + a small beacon dot standing in for the lamp */}
      <div className="heading text-2xl text-foam tracking-wide flex items-center gap-2.5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-beacon opacity-60"></span>
          <span className="relative inline-flex rounded-full size-2 bg-beacon"></span>
        </span>
        Lighthouse
      </div>

      {/* Main Navigation Links */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-steel">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                isActive
                  ? "text-beacon border-b-2 border-beacon pb-1"
                  : "hover:text-foam transition"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right Utility */}
      <div className="flex items-center space-x-6 text-sm font-medium">
        <button className="bg-beacon hover:brightness-110 transition text-abyss px-5 py-2.5 rounded shadow-lg text-sm font-bold tracking-wide hidden sm:block">
          + New Listing
        </button>
      </div>
    </nav>
  );
}
