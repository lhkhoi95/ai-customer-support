import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Chat Assistant",
  description: "AI Chat Assistant Interface",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="header">
            <Link href="/" className="header-title">
              AI Chat Assistant
            </Link>
            <div className="header-buttons">
              <SignedOut>
                <SignInButton className="sign-in-button" />
              </SignedOut>
              <SignedIn>
                <UserButton className="user-button" />
              </SignedIn>
            </div>
          </header>
          <main className="chat-container">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
