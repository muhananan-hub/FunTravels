"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Driver,
  DRIVER_SESSION_KEY,
  getDrivers,
  saveDriver,
} from "@/lib/drivers";

type Mode =
  | "login"
  | "register";

function normalizePhone(
  phone: string
) {
  return phone.replace(/\D/g, "");
}

function generateDriverId(
  drivers: Driver[]
) {
  const numbers =
    drivers
      .map((driver) => {
        const match =
          driver.id.match(
            /^DRV-(\d+)$/
          );

        return match
          ? Number(match[1])
          : 0;
      });

  const nextNumber =
    Math.max(
      0,
      ...numbers
    ) + 1;

  return `DRV-${String(
    nextNumber
  ).padStart(3, "0")}`;
}

export default function DriverLoginPage() {
  const router =
    useRouter();

  const [mode, setMode] =
    useState<Mode>("login");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * Login
   */
  const [loginPhone, setLoginPhone] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  /*
   * Register
   */
  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [vehicle, setVehicle] =
    useState("");

  const [plateNumber, setPlateNumber] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  /*
   * Kalau sudah login, langsung ke driver dashboard.
   */
  useEffect(() => {
    const session =
      localStorage.getItem(
        DRIVER_SESSION_KEY
      );

    if (session) {
      router.replace("/driver");
    }
  }, [router]);

  function resetMessages() {
    setError("");
    setMessage("");
  }

  function switchMode(
    newMode: Mode
  ) {
    resetMessages();
    setMode(newMode);
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  function handleLogin(
    event: FormEvent
  ) {
    event.preventDefault();

    resetMessages();

    const normalizedPhone =
      normalizePhone(
        loginPhone
      );

    if (!normalizedPhone) {
      setError(
        "Masukkan nomor WhatsApp/telepon."
      );

      return;
    }

    if (!loginPassword) {
      setError(
        "Masukkan password."
      );

      return;
    }

    setLoading(true);

    const drivers =
      getDrivers();

    const driver =
      drivers.find(
        (item) =>
          normalizePhone(
            item.phone
          ) ===
          normalizedPhone
      );

    if (!driver) {
      setLoading(false);

      setError(
        "Akun driver tidak ditemukan."
      );

      return;
    }

    /*
     * DEMO:
     * Sistem saat ini masih menggunakan localStorage.
     *
     * Karena password belum disimpan di tipe Driver,
     * login belum melakukan verifikasi password sebenarnya.
     *
     * Nanti bisa dipindahkan ke Supabase Auth.
     */

    localStorage.setItem(
      DRIVER_SESSION_KEY,
      JSON.stringify({
        driverId: driver.id,
        loginAt:
          new Date().toISOString(),
      })
    );

    /*
     * Simpan juga status terbaru supaya dashboard
     * bisa menampilkan status akun.
     */
    setMessage(
      driver.accountStatus ===
        "approved"
        ? "Login berhasil. Selamat datang, Partner FunTravel."
        : driver.accountStatus ===
            "rejected"
          ? "Login berhasil. Akun kamu masih ditolak."
          : "Login berhasil. Akun kamu masih menunggu persetujuan admin."
    );

    setTimeout(() => {
      router.replace("/driver");
    }, 500);
  }

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  function handleRegister(
    event: FormEvent
  ) {
    event.preventDefault();

    resetMessages();

    if (!name.trim()) {
      setError(
        "Nama lengkap wajib diisi."
      );

      return;
    }

    const normalizedPhone =
      normalizePhone(phone);

    if (
      !normalizedPhone ||
      normalizedPhone.length <
        8
    ) {
      setError(
        "Nomor telepon tidak valid."
      );

      return;
    }

    if (!vehicle.trim()) {
      setError(
        "Jenis kendaraan wajib diisi."
      );

      return;
    }

    if (!plateNumber.trim()) {
      setError(
        "Nomor kendaraan wajib diisi."
      );

      return;
    }

    if (
      password.length <
      6
    ) {
      setError(
        "Password minimal 6 karakter."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Konfirmasi password tidak sama."
      );

      return;
    }

    setLoading(true);

    const drivers =
      getDrivers();

    const existingDriver =
      drivers.find(
        (driver) =>
          normalizePhone(
            driver.phone
          ) ===
          normalizedPhone
      );

    if (existingDriver) {
      setLoading(false);

      setError(
        "Nomor telepon tersebut sudah terdaftar."
      );

      return;
    }

    const newDriver: Driver = {
      id: generateDriverId(
        drivers
      ),

      name:
        name.trim(),

      phone:
        normalizedPhone,

      photo: "",

      vehicle:
        vehicle.trim(),

      plateNumber:
        plateNumber
          .trim()
          .toUpperCase(),

      /*
       * Driver baru belum bisa menerima order.
       */
      status: "offline",

      /*
       * WAJIB menunggu admin.
       */
      accountStatus:
        "pending",

      rating: 0,

      totalTrips: 0,

      createdAt:
        new Date().toISOString(),
    };

    saveDriver(
      newDriver
    );

    /*
     * Login langsung setelah daftar.
     * Tetapi status akun tetap pending.
     */
    localStorage.setItem(
      DRIVER_SESSION_KEY,
      JSON.stringify({
        driverId:
          newDriver.id,
        loginAt:
          new Date().toISOString(),
      })
    );

    setLoading(false);

    setMessage(
      "Pendaftaran berhasil. Akun kamu sedang menunggu persetujuan admin."
    );

    setTimeout(() => {
      router.replace("/driver");
    }, 700);
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white text-2xl font-black shadow-lg shadow-emerald-500/20">
            F
          </div>

          <h1 className="mt-5 text-3xl font-black text-white">
            FunTravel Driver
          </h1>

          <p className="mt-2 text-slate-400">
            Portal Partner Driver FunTravel
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* Mode */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() =>
                switchMode(
                  "login"
                )
              }
              className={`py-3 rounded-lg text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode(
                  "register"
                )
              }
              className={`py-3 rounded-lg text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Daftar Partner
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form
              onSubmit={
                handleLogin
              }
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nomor WhatsApp
                </label>

                <input
                  value={
                    loginPhone
                  }
                  onChange={(e) =>
                    setLoginPhone(
                      e.target.value
                    )
                  }
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={
                    loginPassword
                  }
                  onChange={(e) =>
                    setLoginPassword(
                      e.target.value
                    )
                  }
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 transition"
              >
                {loading
                  ? "Memproses..."
                  : "Login sebagai Driver"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={
                handleRegister
              }
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Lengkap
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Nama lengkap"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nomor WhatsApp
                </label>

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Kendaraan
                </label>

                <input
                  value={vehicle}
                  onChange={(e) =>
                    setVehicle(
                      e.target.value
                    )
                  }
                  placeholder="Toyota Avanza"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nomor Kendaraan
                </label>

                <input
                  value={
                    plateNumber
                  }
                  onChange={(e) =>
                    setPlateNumber(
                      e.target.value
                    )
                  }
                  placeholder="DR 1234 XX"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Konfirmasi Password
                </label>

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Ulangi password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Approval info */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex gap-3">
                  <div className="text-xl">
                    🟡
                  </div>

                  <div>
                    <p className="font-bold text-amber-900 text-sm">
                      Persetujuan Admin
                    </p>

                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Setelah mendaftar,
                      akun kamu harus
                      disetujui admin
                      terlebih dahulu
                      sebelum dapat
                      menerima pesanan
                      wisatawan.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 transition"
              >
                {loading
                  ? "Mendaftarkan..."
                  : "Daftar sebagai Partner"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="w-full mt-5 text-sm font-semibold text-slate-500 hover:text-emerald-600"
          >
            ← Kembali ke FunTravel
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 FunTravel Lombok
        </p>
      </div>
    </main>
  );
}