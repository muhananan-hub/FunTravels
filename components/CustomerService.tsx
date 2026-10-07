"use client";

import { useState } from "react";

export default function CustomerService() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100%-40px)] max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-teal-700 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-100">
              FunTravel Customer Service
            </p>

            <h3 className="mt-1 text-lg font-black">
              Ada yang bisa kami bantu?
            </h3>
          </div>

          <div className="space-y-3 p-5">
            <a
              href="https://wa.me/6280000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-green-50 p-4"
            >
              <p className="font-bold text-green-700">WhatsApp</p>
              <p className="mt-1 text-sm text-slate-500">
                Hubungi customer service
              </p>
            </a>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-bold text-slate-800">Jam Operasional</p>
              <p className="mt-1 text-sm text-slate-500">
                Setiap hari · 08.00 - 22.00 WITA
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-2xl text-white shadow-xl transition hover:scale-105 hover:bg-teal-800"
        aria-label="Customer Service"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}