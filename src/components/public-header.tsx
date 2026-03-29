"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className={`text-base font-bold leading-none transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>
                弁護士法人AURA
              </span>
              <span className={`text-[10px] leading-tight transition-colors ${scrolled ? "text-gray-400" : "text-blue-200"}`}>
                発信者情報開示請求
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                  scrolled ? "text-gray-600" : "text-white/80"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-5">
              <Link href="/contact">無料相談する</Link>
            </Button>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden flex h-9 w-9 items-center justify-center rounded transition-colors ${
              scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
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
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="font-bold text-gray-900">弁護士法人AURA</span>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t">
                <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  <Link href="/contact" onClick={() => setOpen(false)}>
                    無料相談する（無料）
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden">
        <Link
          href="/contact"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 text-base font-bold text-white shadow-lg active:scale-95 transition-transform"
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
