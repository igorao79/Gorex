import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ViewTransitions } from "next-view-transitions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gorex",
  description: "Управляйте задачами вашей команды с помощью Kanban-доски",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="ru" suppressHydrationWarning>
        <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <SessionProvider>
              {children}
            </SessionProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
