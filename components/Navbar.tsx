"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Destinasi",
    href: "/destinasi",
  },
  {
    name: "Riwayat Pesanan",
    href: "/riwayat",
  },
  {
    name: "Mulai Memesan",
    href: "/booking",
  },
  {
    name: "Profile",
    href: "/profile",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-xl font-black text-white">
            F
          </div>

          <div>
            <div className="text-lg font-black tracking-tight text-slate-900">
              FunTravel
            </div>
            <div className="text-xs text-slate-500">
              Explore Lombok
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-1 lg:flex">
          {menus.map((menu) => {
            const active =
              pathname === menu.href ||
              (menu.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {menu.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
          aria-label="Buka menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {menus.map((menu) => {
              const active =
                pathname === menu.href ||
                (menu.href === "/dashboard" && pathname === "/");

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {menu.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}