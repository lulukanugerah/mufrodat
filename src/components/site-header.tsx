import Link from "next/link";
import { BookOpen, Gamepad2, House, ShieldCheck, Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Mufrodat Kids beranda">
          <span className="brand-mark">م</span>
          <span className="brand-copy">
            <strong>Mufrodat Kids</strong>
            <small>Belajar Arab jadi seru!</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="/" className="nav-link"><House size={17} /> Beranda</Link>
          <Link href="/materi" className="nav-link"><BookOpen size={17} /> Materi</Link>
          <Link href="/permainan" className="nav-link"><Gamepad2 size={17} /> Permainan</Link>
        </nav>
        <Link href="/admin/login" className="teacher-link"><ShieldCheck size={16} /> Area Guru</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand"><Sparkles size={17} /> Mufrodat Kids</div>
        <p>Belajar kosakata Bahasa Arab dengan gambar, suara, dan permainan.</p>
        <small>© {new Date().getFullYear()} Mufrodat Kids · Media pembelajaran Bahasa Arab</small>
      </div>
    </footer>
  );
}
