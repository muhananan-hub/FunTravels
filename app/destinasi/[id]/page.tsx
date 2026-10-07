import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { destinations, getDestinationById } from "@/lib/destinations";

type DestinationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return destinations.map((destination) => ({
    id: destination.id,
  }));
}

export default async function DestinationDetailPage({
  params,
}: DestinationDetailPageProps) {
  const { id } = await params;

  const destination = getDestinationById(id);

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* IMAGE */}
        <section className="bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Link
              href="/destinasi"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white"
            >
              ← Kembali ke Destinasi
            </Link>

            <div className="mt-6 overflow-hidden rounded-[32px]">
              <div className="relative h-[350px] sm:h-[500px]">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 sm:p-10">
                  <span className="rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white">
                    {destination.category}
                  </span>

                  <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">
                    {destination.name}
                  </h1>

                  <p className="mt-3 text-sm text-white/80">
                    📍 {destination.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div>
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-2xl font-black text-slate-900">
                Tentang destinasi
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                {destination.longDescription}
              </p>

              <h3 className="mt-10 text-xl font-black text-slate-900">
                Yang bisa kamu nikmati
              </h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {destination.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-2xl bg-teal-50 p-4 text-sm font-semibold text-teal-800"
                  >
                    ✓ {highlight}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BOOKING CARD */}
          <aside>
            <div className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-7 shadow-lg">
              <p className="text-sm text-slate-400">
                Estimasi layanan mulai dari
              </p>

              <p className="mt-2 text-3xl font-black text-teal-700">
                Rp{destination.price.toLocaleString("id-ID")}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Harga merupakan estimasi awal dan dapat berubah berdasarkan
                jenis layanan, kendaraan, rute, jumlah penumpang, dan kebutuhan
                perjalanan.
              </p>

              <Link
                href={`/booking?destination=${destination.id}`}
                className="mt-7 block rounded-2xl bg-teal-700 px-6 py-4 text-center font-bold text-white transition hover:bg-teal-800"
              >
                Pesan Destinasi Ini
              </Link>

              <Link
                href="/booking"
                className="mt-3 block rounded-2xl border border-slate-200 px-6 py-4 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Lihat Semua Layanan
              </Link>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}