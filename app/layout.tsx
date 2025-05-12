import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import ClientNetworkStatus from "@/components/ClientNetworkStatus"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "mail - CEO-Level Reminders to Crush Your Goals",
  description:
    "Get personalized, high-impact motivation delivered straight to your inbox from Elon Musk, Steve Jobs, and other visionaries.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors />
          <ClientNetworkStatus />
        </ThemeProvider>
      </body>
    </html>
  )
}
