"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DestinationCard from "@/components/DestinationCard";
import { destinations } from "@/lib/destinations";

const categories = [
  "Semua",
  "Pantai",
  "Gunung",
  "Air Terjun",
  "Gili",
  "Alam",
  "Budaya",
  "Kuliner",
];

export default function DestinasiPage() {
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filteredDestinations = useMemo(() => {
    return destinations.filter((destination) => {
      const matchesCategory =
        category === "Semua" ||
        destination.category === category;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        destination.name.toLowerCase().includes(searchText) ||
        destination.location.toLowerCase().includes(searchText) ||
        destination.category.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* HEADER */}
        <section className="bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
              Explore Lombok
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Temukan destinasi favoritmu di Lombok
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
              Dari pantai, Gili, pegunungan, air terjun, budaya hingga kuliner
              khas Lombok.
            </p>
          </div>
        </section>

        {/* FILTER */}
        <section className="sticky top-[73px] z-40 border-b border-slate-200 bg-white/95 py-4 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* SEARCH */}
              <div className="relative w-full lg:max-w-sm">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari destinasi..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 pl-11 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>
              </div>

              {/* CATEGORY */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((item) => {
                  const active = category === item;

                  return (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition ${
                        active
                          ? "bg-teal-700 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* DESTINATION GRID */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Destinasi
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Menampilkan {filteredDestinations.length} destinasi
              </p>
            </div>
          </div>

          {filteredDestinations.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <div className="text-5xl">🔎</div>

              <h3 className="mt-5 text-xl font-black text-slate-900">
                Destinasi tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Coba gunakan kata pencarian atau kategori lain.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCategory("Semua");
                }}
                className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
              >
                Reset Filter
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}