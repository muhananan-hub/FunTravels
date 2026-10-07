"use client";

import { useEffect, useMemo, useState } from "react";
import DriverNavbar from "@/components/DriverNavbar";
import {
  BookingOrder,
  formatRupiah,
  getBookings,
} from "@/lib/bookings";
import {
  Driver,
  getDrivers,
} from "@/lib/drivers";

export default function DriverHistoryPage() {
  const [drivers, setDrivers] =
    useState<Driver[]>([]);

  const [bookings, setBookings] =
    useState<BookingOrder[]>([]);

  const [selectedDriverId, setSelectedDriverId] =
    useState("DRV-001");

  useEffect(() => {
    const loadedDrivers =
      getDrivers();

    const loadedBookings =
      getBookings();

    setDrivers(loadedDrivers);
    setBookings(loadedBookings);

    if (loadedDrivers.length > 0) {
      setSelectedDriverId(
        loadedDrivers[0].id
      );
    }
  }, []);

  const myBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.driverId ===
          selectedDriverId
      ),
    [bookings, selectedDriverId]
  );

  return (
    <>
      <DriverNavbar />

      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-teal-600">
              Driver Area
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Riwayat Penerimaan
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Daftar perjalanan yang pernah
              kamu terima.
            </p>
          </div>

          {/* DRIVER */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Driver
                </p>

                <p className="mt-1 font-black text-slate-900">
                  {drivers.find(
                    (driver) =>
                      driver.id ===
                      selectedDriverId
                  )?.name || "-"}
                </p>
              </div>

              <select
                value={
                  selectedDriverId
                }
                onChange={(event) =>
                  setSelectedDriverId(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold"
              >
                {drivers.map(
                  (driver) => (
                    <option
                      key={driver.id}
                      value={driver.id}
                    >
                      {driver.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* HISTORY */}

          <div className="mt-6 space-y-4">
            {myBookings.length ===
            0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="text-4xl">
                  📋
                </div>

                <h2 className="mt-3 font-black text-slate-900">
                  Belum ada riwayat
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Pesanan yang kamu terima
                  akan muncul di sini.
                </p>
              </div>
            ) : (
              myBookings.map(
                (booking) => (
                  <article
                    key={booking.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                          {booking.id}
                        </p>

                        <h2 className="mt-1 text-lg font-black text-slate-900">
                          {booking.service ===
                          "package"
                            ? booking.packageName ||
                              booking.destinationName
                            : booking.destinationName}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {booking.pickup}{" "}
                          →{" "}
                          {
                            booking.destinationName
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            📅{" "}
                            {booking.date ||
                              "-"}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            📍{" "}
                            {booking.distance ||
                              "-"}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            👥{" "}
                            {booking.passengers ||
                              0}{" "}
                            orang
                          </span>
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-xs text-slate-400">
                          Nilai perjalanan
                        </p>

                        <p className="mt-1 text-xl font-black text-teal-700">
                          {formatRupiah(
                            Number(
                              booking.totalPrice ??
                                0
                            )
                          )}
                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                          ✓ Pernah Diterima
                        </span>
                      </div>
                    </div>
                  </article>
                )
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}