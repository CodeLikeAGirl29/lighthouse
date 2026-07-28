import type { Metadata } from "next";
import { Open_Sans, Urbanist } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });
const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Lighthouse AI",
  description:
    "Turn a property listing into a complete marketing kit — MLS copy, social captions, and more — in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${urbanist.variable} font-sans antialiased text-foam bg-abyss`}
      >
        {children}
      </body>
    </html>
  );
}
