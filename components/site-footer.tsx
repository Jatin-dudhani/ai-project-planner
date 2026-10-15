export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-auto bg-white dark:bg-zinc-950 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">AI Project Planner</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span>Architect software briefs, data models, and coding prompts</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Client-side storage</span>
          <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">·</span>
          <span>Next.js &amp; Gemini</span>
        </div>
      </div>
    </footer>
  )
}
