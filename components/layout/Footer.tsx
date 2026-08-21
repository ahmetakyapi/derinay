export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-500/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1.5 px-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <span className="font-display font-semibold tracking-tight text-slate-700 dark:text-slate-200">Derinay</span>
        <span>© {new Date().getFullYear()} — psikologlar için finans &amp; danışan takibi</span>
      </div>
    </footer>
  )
}
