import Link from "next/link";

export function Navbar() {
  return (
    <header className="w-full border-b border-[var(--border-primary)] bg-[var(--bg-page)]">
      <div className="flex h-14 items-center justify-between px-4 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm text-[var(--text-primary)] transition-colors hover:text-white"
        >
          <span className="text-base font-bold text-[var(--accent-green)]">
            &gt;
          </span>
          <span>devroast</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center">
          <Link
            href="/leaderboard"
            className="font-mono text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            leaderboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
