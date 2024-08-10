import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Chat Assistant",
  description: "AI Chat Assistant Interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="header-bar">
          AI Chat Assistant
        </header>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
