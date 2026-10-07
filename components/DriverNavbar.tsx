"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    href: "/driver",
    label: "Dashboard",
    icon: "🏠",
  },
  {
    href: "/driver/orders",
    label: "Pesanan Tersedia",
    icon: "📋",
  },
  {
    href: "/driver/history",
    label: "Riwayat Penerimaan",
    icon: "✓",
  },
  {
    href: "/driver/profile",
    label: "Profile",
    icon: "👤",
  },
];

export default function DriverNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] =
    useState(false);

  function isActive(href: string) {
    if (href === "/driver") {
      return pathname === "/driver";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}

          <Link
            href="/driver"
            className="flex items-center gap-3"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-xl shadow-sm">
              🚗
            </div>

            <div>
              <p className="text-base font-black leading-none text-slate-900">
                FunTravel
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-teal-600">
                Driver
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-1 md:flex">
            {menuItems.map((item) => {
              const active =
                isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* DRIVER STATUS */}

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold text-emerald-700">
                Area Driver
              </span>
            </div>
          </div>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg md:hidden"
            aria-label="Buka menu"
          >
            {mobileOpen
              ? "✕"
              : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}

        {mobileOpen && (
          <div className="border-t border-slate-100 py-3 md:hidden">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const active =
                  isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-teal-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">
                      {item.icon}
                    </span>

                    <span>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold text-emerald-700">
                Mode Driver Aktif
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}