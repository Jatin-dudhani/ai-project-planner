import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/sonner"

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata = {
  title: "AI Project Planner — System Architecture & Starter Prompts",
  description:
    "Transform application concepts into structured technical briefs, relational schemas, route hierarchies, and master AI coding prompts.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen flex flex-col text-neutral-900 dark:text-neutral-100 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main id="main-content" className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="w-full max-w-7xl mx-auto">{children}</div>
          </main>
          <SiteFooter />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
