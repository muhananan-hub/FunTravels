import Link from "next/link";
import type { Destination } from "@/lib/destinations";

type DestinationCardProps = {
  destination: Destination;
};

export default function DestinationCard({
  destination,
}: DestinationCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm backdrop-blur">
            {destination.category}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>📍</span>
          <span>{destination.location}</span>
        </div>

        <h3 className="mt-2 text-xl font-black text-slate-900">
          {destination.name}
        </h3>

        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
          {destination.description}
        </p>

        {/* PRICE */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-400">
            Estimasi layanan mulai dari
          </p>

          <p className="mt-1 text-xl font-black text-teal-700">
            Rp{destination.price.toLocaleString("id-ID")}
          </p>
        </div>

        {/* BUTTON */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href={`/destinasi/${destination.id}`}
            className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Detail
          </Link>

          <Link
            href={`/booking?destination=${destination.id}`}
            className="rounded-xl bg-teal-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-teal-800"
          >
            Pesan
          </Link>
        </div>
      </div>
    </article>
  );
}