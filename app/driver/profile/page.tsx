"use client";

import { useEffect, useState } from "react";
import DriverNavbar from "@/components/DriverNavbar";
import {
  Driver,
  getDrivers,
  updateDriver,
} from "@/lib/drivers";

export default function DriverProfilePage() {
  const [drivers, setDrivers] =
    useState<Driver[]>([]);

  const [selectedDriverId, setSelectedDriverId] =
    useState("DRV-001");

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const data = getDrivers();

    setDrivers(data);

    if (data.length > 0) {
      setSelectedDriverId(
        data[0].id
      );
    }
  }, []);

  const driver = drivers.find(
    (item) =>
      item.id ===
      selectedDriverId
  );

  function changeStatus(
    status:
      | "available"
      | "busy"
      | "offline"
  ) {
    if (!driver) {
      return;
    }

    updateDriver(
      driver.id,
      {
        status,
      }
    );

    setDrivers(
      getDrivers()
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  return (
    <>
      <DriverNavbar />

      <main className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-teal-600">
              Driver Area
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
              Profile Driver
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Informasi akun dan status
              operasional driver.
            </p>
          </div>

          {/* DRIVER SELECTOR */}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Akun Driver
            </label>

            <select
              value={
                selectedDriverId
              }
              onChange={(event) =>
                setSelectedDriverId(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-500"
            >
              {drivers.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name} —{" "}
                    {item.vehicle}
                  </option>
                )
              )}
            </select>
          </section>

          {driver && (
            <>
              {/* PROFILE */}

              <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal-100 text-4xl">
                    🚗
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Driver
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      {driver.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      ID: {driver.id}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Nomor Telepon
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {driver.phone ||
                        "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Kendaraan
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {driver.vehicle ||
                        "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Nomor Polisi
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {driver.plateNumber ||
                        "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Rating
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      ⭐{" "}
                      {Number(
                        driver.rating ??
                          0
                      ).toFixed(1)}
                    </p>
                  </div>
                </div>
              </section>

              {/* STATUS */}

              <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="font-black text-slate-900">
                    Status Operasional
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Tentukan apakah kamu
                    sedang menerima pesanan.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    disabled={
                      driver.status ===
                      "busy"
                    }
                    onClick={() =>
                      changeStatus(
                        "available"
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      driver.status ===
                      "available"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-xl">
                      🟢
                    </p>

                    <p className="mt-2 font-black text-slate-900">
                      Tersedia
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Bisa menerima pesanan
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={
                      driver.status ===
                      "busy"
                    }
                    onClick={() =>
                      changeStatus(
                        "offline"
                      )
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      driver.status ===
                      "offline"
                        ? "border-slate-400 bg-slate-100"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-xl">
                      ⚪
                    </p>

                    <p className="mt-2 font-black text-slate-900">
                      Offline
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Tidak menerima pesanan
                    </p>
                  </button>

                  <div
                    className={`rounded-2xl border p-4 ${
                      driver.status ===
                      "busy"
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-xl">
                      🟠
                    </p>

                    <p className="mt-2 font-black text-slate-900">
                      Sedang Bertugas
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Otomatis saat mengambil
                      pesanan
                    </p>
                  </div>
                </div>

                {saved && (
                  <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    ✓ Status berhasil
                    diperbarui.
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}