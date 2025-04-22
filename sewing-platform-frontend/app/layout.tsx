import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ResponsiveNavbar from "../components/ResponsiveNavbar";
import { cookies } from "next/headers";
import jwt_decode from "jwt-decode";
import AnalyticsProvider from "../src/components/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tailors - Custom Sewing Platform",
  description: "Find tailors and sewing services for your custom clothing needs",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side authentication check
  const cookieStore = cookies();
  const authToken = cookieStore.get('authToken')?.value;

  let isLoggedIn = false;
  let userRole = '';
  let userName = '';

  if (authToken) {
    try {
      const decodedToken: any = jwt_decode(authToken);
      isLoggedIn = true;
      userRole = decodedToken.user?.role || '';
      userName = decodedToken.user?.name || '';
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <AnalyticsProvider>
          <div className="flex flex-col min-h-screen">
            <header>
              <ResponsiveNavbar 
                isLoggedIn={isLoggedIn} 
                userRole={userRole} 
                userName={userName} 
              />
            </header>
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-gray-100 dark:bg-gray-900 py-6 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  © {new Date().getFullYear()} Tailors. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
