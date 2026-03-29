"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";

const navItems = [
  { href: "/#pain", label: "こんな被害に" },
  { href: "/#flow", label: "手続きの流れ" },
  { href: "/fee", label: "費用一覧" },
  { href: "/simulator", label: "費用シミュレーター" },
  { href: "/#faq", label: "よくある質問" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // トップページ以外は常にsolid
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    handler(); // 初期チェック
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          transparent
            ? "bg-transparent"
            : "bg-white/97 backdrop-blur-md shadow-sm border-b border-gray-100"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-bold leading-none transition-colors ${transparent ? "text-white" : "text-gray-900"}`}>
                弁護士法人AURA
              </span>
              <span className={`text-[10px] leading-tight transition-colors ${transparent ? "text-blue-200" : "text-gray-400"}`}>
                発信者情報開示請求
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  transparent ? "text-white/80 hover:text-white" : "text-gray-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: tel + CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="tel:0365555370"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                transparent ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              03-6555-5370
            </a>
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-5 shadow-sm">
              <Link href="/contact">無料相談する</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden flex h-9 w-9 items-center justify-center rounded transition-colors ${
              transparent ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-700">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-900">弁護士法人AURA</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t space-y-2">
              <a
                href="tel:0365555370"
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Phone className="h-4 w-4" />
                03-6555-5370
              </a>
              <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                <Link href="/contact" onClick={() => setOpen(false)}>
                  無料相談する（無料）
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sticky CTA — ホームページ以外では少し控えめに */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden">
        <Link
          href="/contact"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/30 active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          スクリーンショットを送って無料相談
        </Link>
      </div>
    </>
  );
}
