export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-500/10 py-8">
      <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Derinay — psikologlar için finans & danışan takibi
      </div>
    </footer>
  )
}
