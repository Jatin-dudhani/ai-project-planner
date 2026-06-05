import { Syne, DM_Sans, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/sonner"

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "AI Project Planner",
  description: "Turn your app ideas into actionable project briefs with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <div className="fixed inset-0 z-[-3] overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/8 animate-orb-drift blur-3xl" />
          <div className="absolute -bottom-40 -right-40 size-80 rounded-full bg-primary/10 animate-orb-drift-2 blur-3xl" />
          <div className="absolute top-1/4 left-1/2 size-64 rounded-full bg-accent/10 animate-float-slow blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 size-72 rounded-full bg-chart-3/8 animate-orb-drift blur-3xl" />
        </div>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <main id="main-content" className="flex-1 w-full px-4 md:px-8 py-6 md:py-8">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <SiteFooter />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
