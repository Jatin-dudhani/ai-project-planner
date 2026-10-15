export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          <span>AI Project Planner</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Architect software briefs, data models, and coding prompts</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Client-side storage enabled</span>
          <span aria-hidden="true">·</span>
          <span>Powered by Next.js &amp; Google Gemini</span>
        </div>
      </div>
    </footer>
  )
}
