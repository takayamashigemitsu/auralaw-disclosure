"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Scale, X } from "lucide-react";

const navItems = [
  { href: "/#about", label: "開示請求とは" },
  { href: "/#flow", label: "手続きの流れ" },
  { href: "/#fee", label: "費用" },
  { href: "/simulator", label: "費用シミュレーター" },
  { href: "/contact", label: "無料相談" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-blue-700" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              弁護士法人AURA
            </span>
            <span className="text-[10px] text-gray-500 leading-none">
              発信者情報開示請求サポート
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="sm">
            <Link href="/contact">無料相談する</Link>
          </Button>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="mt-8 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-gray-700 hover:text-blue-700"
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild className="mt-4">
                <Link href="/contact" onClick={() => setOpen(false)}>
                  無料相談する
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
