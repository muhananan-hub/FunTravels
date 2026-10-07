"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomerService from "@/components/CustomerService";
import BookingForm from "@/components/BookingForm";
import { BookingService } from "@/lib/bookings";

export default function BookingPage() {
  const searchParams = useSearchParams();

  const serviceParam =
    searchParams.get("service");

  const destination =
    searchParams.get("destination") || "";

  const service: BookingService =
    serviceParam === "guide"
      ? "guide"
      : serviceParam === "package"
      ? "package"
      : "driver";

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <section className="bg-slate-900 px-5 py-16 text-white">
          <div className="mx-auto max-w-6xl">
            <span className="rounded-full bg-teal-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-teal-300">
              Mulai Memesan
            </span>

            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Atur perjalanan Lombok kamu
              dengan FunTravel.
            </h1>

            <p className="mt-5 max-w-2xl text-slate-300">
              Pilih layanan Driver, Guide, atau
              Paket Lengkap kemudian isi detail
              perjalananmu.
            </p>
          </div>
        </section>

        <section className="px-5 py-10 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <BookingForm
              initialService={service}
              initialDestination={destination}
            />
          </div>
        </section>
      </main>

      <CustomerService />
      <Footer />
    </>
  );
}