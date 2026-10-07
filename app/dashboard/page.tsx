import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import DestinationCard from "@/components/DestinationCard";
import CustomerService from "@/components/CustomerService";
import { destinations } from "@/lib/destinations";

export default function DashboardPage() {
  const popularDestinations = destinations.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-teal-950/70" />

          <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-200 backdrop-blur">
                🌴 Explore Lombok bersama FunTravel
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Perjalanan Lombok
                <span className="block text-teal-300">
                  jadi lebih mudah.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Pesan driver, guide, atau paket perjalanan lengkap untuk
                menjelajahi destinasi terbaik Lombok dengan lebih nyaman.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/booking"
                  className="rounded-2xl bg-teal-600 px-7 py-4 text-center font-bold text-white transition hover:bg-teal-500"
                >
                  Mulai Memesan
                </Link>

                <Link
                  href="/destinasi"
                  className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Jelajahi Destinasi
                </Link>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="hidden lg:block">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-5 rounded-[40px] bg-teal-500/20 blur-3xl" />

                <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
                    <img
                      src="/images/hero.jpg"
                      alt="FunTravel Lombok"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <p className="text-sm font-bold uppercase tracking-widest text-teal-300">
                        FunTravel
                      </p>

                      <p className="mt-2 text-3xl font-black text-white">
                        Wonderful Lombok
                      </p>

                      <p className="mt-2 text-sm text-white/80">
                        Pantai · Gili · Gunung · Budaya · Kuliner
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRO / KEUNGGULAN
        ====================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
              Tentang FunTravel
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Teman perjalanan untuk menjelajahi Lombok
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-500">
              FunTravel membantu wisatawan menemukan destinasi, memilih
              layanan perjalanan, dan mengatur perjalanan Lombok dari satu
              tempat.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl">
                🚗
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Driver lokal
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pilih layanan driver untuk membantu perjalanan kamu selama
                berada di Lombok.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl">
                🧭
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Guide lokal
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dapatkan pendamping perjalanan untuk membantu mengenal
                destinasi dan budaya Lombok.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl">
                📋
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                Paket lengkap
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gabungkan driver dan guide dalam satu layanan perjalanan.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            SERVICES
        ====================================================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
                Pilih layanan
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Mau perjalanan seperti apa?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-slate-500">
                Pilih layanan yang sesuai dengan kebutuhan perjalanan kamu.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <ServiceCard
                icon="🚗"
                title="Driver Saja"
                description="Pesan kendaraan dan driver untuk menemani perjalanan kamu."
                price="Rp550.000"
                service="driver"
              />

              <ServiceCard
                icon="🧭"
                title="Guide Saja"
                description="Jelajahi Lombok bersama guide lokal yang siap menemani."
                price="Rp250.000"
                service="guide"
              />

              <ServiceCard
                icon="🌴"
                title="Paket Lengkap"
                description="Driver dan guide dalam satu paket perjalanan."
                price="Rp850.000"
                service="package"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            DESTINASI POPULER
        ====================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
                Destinasi populer
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Jelajahi Lombok
              </h2>

              <p className="mt-3 max-w-2xl text-slate-500">
                Temukan tempat menarik untuk perjalanan berikutnya.
              </p>
            </div>

            <Link
              href="/destinasi"
              className="font-bold text-teal-700 transition hover:text-teal-900"
            >
              Lihat Semua →
            </Link>
          </div>

          {/* DestinationCard digunakan kembali di Dashboard */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        </section>

        {/* =====================================================
            DRIVER / GUIDE
        ====================================================== */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* DRIVER */}
              <div className="rounded-[32px] bg-slate-950 p-8 text-white sm:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                  🚗
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Driver FunTravel
                </h2>

                <p className="mt-4 leading-7 text-slate-300">
                  Driver membantu perjalanan kamu dari titik pickup menuju
                  destinasi pilihan. Detail driver akan ditampilkan setelah
                  pesanan diproses dan driver ditugaskan oleh admin.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li>✓ Driver lokal</li>
                  <li>✓ Pilihan kendaraan</li>
                  <li>✓ Detail kendaraan</li>
                  <li>✓ Informasi kontak setelah penugasan</li>
                </ul>

                <Link
                  href="/booking?service=driver"
                  className="mt-8 inline-block rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-500"
                >
                  Pesan Driver
                </Link>
              </div>

              {/* GUIDE */}
              <div className="rounded-[32px] bg-teal-950 p-8 text-white sm:p-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                  🧭
                </div>

                <h2 className="mt-6 text-3xl font-black">
                  Guide FunTravel
                </h2>

                <p className="mt-4 leading-7 text-teal-100/70">
                  Guide lokal dapat membantu perjalanan kamu mengenal tempat,
                  budaya, dan pengalaman wisata di Lombok.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-teal-100/80">
                  <li>✓ Guide lokal</li>
                  <li>✓ Pendamping perjalanan</li>
                  <li>✓ Informasi destinasi</li>
                  <li>✓ Detail guide setelah penugasan</li>
                </ul>

                <Link
                  href="/booking?service=guide"
                  className="mt-8 inline-block rounded-2xl bg-white px-6 py-3 font-bold text-teal-900 hover:bg-teal-50"
                >
                  Pesan Guide
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            LAST ORDER
        ====================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-teal-700">
                  Pesanan terakhir
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  Belum ada pesanan
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Pesanan yang kamu buat akan otomatis muncul di halaman
                  Riwayat Pesanan.
                </p>
              </div>

              <Link
                href="/riwayat"
                className="rounded-2xl border border-slate-200 px-6 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Lihat Riwayat
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <CustomerService />
    </div>
  );
}