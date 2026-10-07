"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomerService from "@/components/CustomerService";
import OrderCard from "@/components/OrderCard";
import {
  BookingOrder,
  getCustomerBookings,
} from "@/lib/bookings";

type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
};

export default function RiwayatPage() {
  const [orders, setOrders] =
    useState<BookingOrder[]>([]);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // ============================================================
  // BACA USER YANG SEDANG LOGIN
  // ============================================================

  useEffect(() => {
    const loadCustomer = () => {
      const loggedIn =
        localStorage.getItem(
          "funtravel_logged_in"
        );

      if (loggedIn !== "true") {
        setCurrentUser(null);
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const userRaw =
        localStorage.getItem(
          "funtravel_current_user"
        );

      if (!userRaw) {
        setCurrentUser(null);
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        const user: CurrentUser =
          JSON.parse(userRaw);

        setCurrentUser(user);

        // ======================================================
        // AMBIL HANYA BOOKING CUSTOMER INI
        // ======================================================

        setOrders(
          getCustomerBookings(
            user.id,
            user.email
          )
        );
      } catch (error) {
        console.error(
          "Gagal membaca data customer:",
          error
        );

        setCurrentUser(null);
        setOrders([]);
      }

      setIsLoading(false);
    };

    loadCustomer();
  }, []);

  // ============================================================
  // REFRESH BOOKING OTOMATIS
  // ============================================================

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const loadOrders = () => {
      const latestOrders =
        getCustomerBookings(
          currentUser.id,
          currentUser.email
        );

      setOrders(latestOrders);
    };

    // Baca ulang ketika halaman aktif
    loadOrders();

    // ==========================================================
    // POLLING SETIAP 3 DETIK
    // ==========================================================

    const interval =
      window.setInterval(() => {
        loadOrders();
      }, 3000);

    // ==========================================================
    // STORAGE EVENT
    // ==========================================================

    const handleStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key === "funtravel_bookings" ||
        event.key ===
          "funtravel_current_user" ||
        event.key ===
          "funtravel_logged_in" ||
        event.key === null
      ) {
        loadOrders();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {
      window.clearInterval(interval);

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [currentUser]);

  // ============================================================
  // BELUM LOGIN
  // ============================================================

  if (!isLoading && !currentUser) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen">
          <section className="bg-slate-900 px-5 py-14 text-white">
            <div className="mx-auto max-w-6xl">
              <span className="text-sm font-bold uppercase tracking-wider text-teal-400">
                FunTravel
              </span>

              <h1 className="mt-3 text-4xl font-black">
                Riwayat Pesanan
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                Silakan login terlebih dahulu
                untuk melihat riwayat pesananmu.
              </p>
            </div>
          </section>

          <section className="px-5 py-10">
            <div className="mx-auto max-w-5xl">
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <div className="text-5xl">
                  🔐
                </div>

                <h2 className="mt-4 text-xl font-black">
                  Kamu belum login
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Login ke akun FunTravel untuk
                  melihat semua pesanan perjalanan
                  milikmu.
                </p>

                <a
                  href="/profile"
                  className="mt-6 inline-block rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700"
                >
                  Login
                </a>

              </div>
            </div>
          </section>
        </main>

        <CustomerService />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <section className="bg-slate-900 px-5 py-14 text-white">
          <div className="mx-auto max-w-6xl">

            <span className="text-sm font-bold uppercase tracking-wider text-teal-400">
              FunTravel
            </span>

            <h1 className="mt-3 text-4xl font-black">
              Riwayat Pesanan
            </h1>

            <p className="mt-3 max-w-2xl text-slate-300">
              Semua pesanan perjalanan yang dibuat
              melalui akunmu akan muncul di sini.
            </p>

          </div>
        </section>

        {/* ================================================== */}
        {/* DAFTAR PESANAN */}
        {/* ================================================== */}

        <section className="px-5 py-10">
          <div className="mx-auto max-w-5xl">

            {isLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                <div className="text-4xl">
                  ⏳
                </div>

                <h2 className="mt-4 text-xl font-black">
                  Memuat pesanan...
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Mohon tunggu sebentar.
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <div className="text-5xl">
                  🧳
                </div>

                <h2 className="mt-4 text-xl font-black">
                  Belum ada pesanan
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Kamu belum memiliki pesanan.
                  Mulai rencanakan perjalananmu
                  bersama FunTravel.
                </p>

                <a
                  href="/booking"
                  className="mt-6 inline-block rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700"
                >
                  Mulai Memesan
                </a>

              </div>
            ) : (
              <div className="space-y-6">

                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                  />
                ))}

              </div>
            )}

          </div>
        </section>

      </main>

      <CustomerService />
      <Footer />
    </>
  );
}