import type { Metadata } from "next";
import { Inter, Pacifico } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-cursive" });

export const metadata: Metadata = {
  title: "Adventure Atlas",
  description: "Discover places near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${pacifico.variable} font-sans antialiased text-white bg-slate-900`}>
        {children}
      </body>
    </html>
  );
}