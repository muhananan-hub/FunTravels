"use client";

import { useEffect, useMemo, useState } from "react";
import DriverNavbar from "@/components/DriverNavbar";
import {
  BookingOrder,
  formatRupiah,
  getBookings,
  updateBooking,
} from "@/lib/bookings";
import {
  Driver,
  getDrivers,
  updateDriver,
} from "@/lib/drivers";

export default function DriverOrdersPage() {
  const [drivers, setDrivers] =
    useState<Driver[]>([]);

  const [bookings, setBookings] =
    useState<BookingOrder[]>([]);

  const [selectedDriverId, setSelectedDriverId] =
    useState("DRV-001");

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const loadedDrivers =
      getDrivers();

    const loadedBookings =
      getBookings();

    setDrivers(loadedDrivers);
    setBookings(loadedBookings);

    if (
      loadedDrivers.length > 0 &&
      !loadedDrivers.some(
        (driver) =>
          driver.id ===
          selectedDriverId
      )
    ) {
      setSelectedDriverId(
        loadedDrivers[0].id
      );
    }

    setLoading(false);
  }

  const currentDriver = useMemo(
    () =>
      drivers.find(
        (driver) =>
          driver.id ===
          selectedDriverId
      ),
    [drivers, selectedDriverId]
  );

  const availableBookings =
    useMemo(() => {
      return bookings.filter(
        (booking) => {
          if (
            booking.status ===
              "cancelled" ||
            booking.status ===
              "completed"
          ) {
            return false;
          }

          if (booking.driverId) {
            return false;
          }

          if (
            booking.service !==
              "driver" &&
            booking.service !==
              "package"
          ) {
            return false;
          }

          if (
            booking.driver &&
            booking.driver.status !==
              "pending"
          ) {
            return false;
          }

          return true;
        }
      );
    }, [bookings]);

  function acceptBooking(
    booking: BookingOrder
  ) {
    if (!currentDriver) {
      alert(
        "Driver belum dipilih."
      );
      return;
    }

    if (
      currentDriver.status !==
      "available"
    ) {
      alert(
        "Driver sedang tidak tersedia."
      );
      return;
    }

    setProcessingId(booking.id);

    try {
      const latestBookings =
        getBookings();

      const latest =
        latestBookings.find(
          (item) =>
            item.id === booking.id
        );

      if (!latest) {
        alert(
          "Pesanan tidak ditemukan."
        );

        loadData();
        return;
      }

      if (latest.driverId) {
        alert(
          "Pesanan sudah diambil driver lain."
        );

        loadData();
        return;
      }

      const acceptedAt =
        new Date().toISOString();

      const nextStatus =
        latest.service ===
        "package"
          ? latest.guideId
            ? "confirmed"
            : "driver_accepted"
          : "driver_accepted";

      updateBooking(
        latest.id,
        {
          driverId:
            currentDriver.id,

          driverAcceptedAt:
            acceptedAt,

          status:
            nextStatus,

          driver: {
            id:
              currentDriver.id,

            name:
              currentDriver.name,

            phone:
              currentDriver.phone,

            vehicle:
              currentDriver.vehicle,

            plateNumber:
              currentDriver.plateNumber,

            photo:
              currentDriver.photo ||
              "",

            status:
              "accepted",

            acceptedAt,
          },
        }
      );

      updateDriver(
        currentDriver.id,
        {
          status: "busy",
        }
      );

      loadData();

      alert(
        `Pesanan ${latest.id} berhasil diterima.`
      );
    } catch (error) {
      console.error(error);

      alert(
        "Gagal menerima pesanan."
      );
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <>
        <DriverNavbar />

        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
          <p className="text-sm font-bold text-slate-500">
            Memuat pesanan...
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <DriverNavbar />

      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-teal-600">
                Driver Area
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                Pesanan Tersedia
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Pilih perjalanan yang ingin
                kamu terima.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ↻ Refresh
            </button>
          </div>

          {/* DRIVER */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Driver Aktif
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-900">
                  {currentDriver?.name ||
                    "-"}
                </h2>

                <p className="text-sm text-slate-500">
                  {currentDriver?.vehicle ||
                    "-"}{" "}
                  •{" "}
                  {currentDriver?.plateNumber ||
                    "-"}
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
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-500"
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
          </section>

          {/* COUNT */}

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">
              Perjalanan
            </h2>

            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-black text-teal-700">
              {availableBookings.length}{" "}
              tersedia
            </span>
          </div>

          {/* EMPTY */}

          {availableBookings.length ===
          0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-5xl">
                🕐
              </div>

              <h3 className="mt-4 font-black text-slate-900">
                Belum ada pesanan
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Pesanan customer yang
                membutuhkan driver akan
                muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-5">
              {availableBookings.map(
                (booking) => (
                  <article
                    key={booking.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-black text-slate-400">
                            {booking.id}
                          </p>

                          <h3 className="mt-1 text-lg font-black text-slate-900">
                            {booking.service ===
                            "package"
                              ? booking.packageName ||
                                booking.destinationName
                              : booking.destinationName}
                          </h3>
                        </div>

                        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                          Menunggu Driver
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold text-slate-400">
                            PICKUP
                          </p>

                          <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
                            {booking.pickup}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-bold text-slate-400">
                            TUJUAN
                          </p>

                          <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
                            {
                              booking.destinationName
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-slate-400">
                            Jarak
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {booking.distance ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Durasi
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {booking.duration ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Penumpang
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {booking.passengers ||
                              0}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Tanggal
                          </p>

                          <p className="mt-1 text-sm font-black">
                            {booking.date ||
                              "-"}
                          </p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                          <p className="text-xs font-bold text-amber-600">
                            CATATAN CUSTOMER
                          </p>

                          <p className="mt-1 text-sm text-amber-900">
                            {booking.notes}
                          </p>
                        </div>
                      )}

                      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
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
                        </div>

                        <button
                          type="button"
                          disabled={
                            processingId ===
                              booking.id ||
                            !currentDriver ||
                            currentDriver.status !==
                              "available"
                          }
                          onClick={() =>
                            acceptBooking(
                              booking
                            )
                          }
                          className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {processingId ===
                          booking.id
                            ? "Memproses..."
                            : "✓ Terima Pesanan"}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}