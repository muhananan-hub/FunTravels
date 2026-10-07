"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  CustomerUser,
  addUser,
  getUserByEmail,
} from "@/lib/users";

// ============================================================
// STORAGE KEY
// ============================================================

const CURRENT_USER_KEY =
  "funtravel_current_user";

const LOGGED_IN_KEY =
  "funtravel_logged_in";

// ============================================================
// TYPE CURRENT USER
// ============================================================

type CurrentUser = CustomerUser;

// ============================================================
// PROFILE PAGE
// ============================================================

export default function ProfilePage() {
  // ==========================================================
  // MODE
  // ==========================================================

  const [mode, setMode] =
    useState<"login" | "register">(
      "login"
    );

  // ==========================================================
  // USER
  // ==========================================================

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // ==========================================================
  // FORM
  // ==========================================================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // ==========================================================
  // MESSAGE
  // ==========================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================================
  // CEK USER LOGIN
  // ==========================================================

  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const loggedIn =
          localStorage.getItem(
            LOGGED_IN_KEY
          ) === "true";

        if (!loggedIn) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        const raw =
          localStorage.getItem(
            CURRENT_USER_KEY
          );

        if (!raw) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        const user =
          JSON.parse(raw) as CurrentUser;

        if (
          !user ||
          !user.id ||
          !user.email
        ) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        setCurrentUser(user);
      } catch (error) {
        console.error(
          "Gagal membaca sesi customer:",
          error
        );

        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  // ==========================================================
  // GANTI MODE
  // ==========================================================

  function changeMode(
    value: "login" | "register"
  ) {
    setMode(value);

    setError("");
    setSuccess("");

    setPassword("");
    setConfirmPassword("");
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanPassword =
      password.trim();

    // --------------------------------------------------------
    // VALIDASI
    // --------------------------------------------------------

    if (!cleanEmail) {
      setError(
        "Silakan masukkan email."
      );
      return;
    }

    if (!cleanPassword) {
      setError(
        "Silakan masukkan password."
      );
      return;
    }

    // --------------------------------------------------------
    // CARI CUSTOMER
    // --------------------------------------------------------

    const user =
      getUserByEmail(cleanEmail);

    if (!user) {
      setError(
        "Akun dengan email tersebut belum terdaftar."
      );
      return;
    }

    // --------------------------------------------------------
    // DEMO AUTHENTICATION
    //
    // Untuk prototype ini password belum
    // disimpan di database.
    //
    // Nanti saat Supabase dibuat,
    // authentication akan dipindahkan
    // ke Supabase Auth.
    // --------------------------------------------------------

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(user)
    );

    localStorage.setItem(
      LOGGED_IN_KEY,
      "true"
    );

    setCurrentUser(user);

    setPassword("");

    setSuccess(
      "Login berhasil. Selamat datang di FunTravel!"
    );
  }

  // ==========================================================
  // REGISTER
  // ==========================================================

  function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanPassword =
      password.trim();

    const cleanConfirmPassword =
      confirmPassword.trim();

    // --------------------------------------------------------
    // VALIDASI NAMA
    // --------------------------------------------------------

    if (!cleanName) {
      setError(
        "Silakan masukkan nama lengkap."
      );
      return;
    }

    // --------------------------------------------------------
    // VALIDASI EMAIL
    // --------------------------------------------------------

    if (!cleanEmail) {
      setError(
        "Silakan masukkan email."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        "Format email tidak valid."
      );
      return;
    }

    // --------------------------------------------------------
    // VALIDASI PASSWORD
    // --------------------------------------------------------

    if (!cleanPassword) {
      setError(
        "Silakan masukkan password."
      );
      return;
    }

    if (cleanPassword.length < 6) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (
      cleanPassword !==
      cleanConfirmPassword
    ) {
      setError(
        "Konfirmasi password tidak sama."
      );
      return;
    }

    // --------------------------------------------------------
    // CEK EMAIL
    // --------------------------------------------------------

    const existingUser =
      getUserByEmail(cleanEmail);

    if (existingUser) {
      setError(
        "Email tersebut sudah terdaftar. Silakan login."
      );
      return;
    }

    // --------------------------------------------------------
    // BUAT CUSTOMER
    // --------------------------------------------------------

    const newUser: CustomerUser = {
      id: `USR-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      createdAt:
        new Date().toISOString(),
    };

    // --------------------------------------------------------
    // SIMPAN CUSTOMER
    // --------------------------------------------------------

    const savedUser =
      addUser(newUser);

    if (!savedUser) {
      setError(
        "Gagal membuat akun. Email mungkin sudah terdaftar."
      );
      return;
    }

    // --------------------------------------------------------
    // LOGIN OTOMATIS
    // --------------------------------------------------------

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(savedUser)
    );

    localStorage.setItem(
      LOGGED_IN_KEY,
      "true"
    );

    setCurrentUser(savedUser);

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setSuccess(
      "Pendaftaran berhasil! Akun kamu sudah dibuat."
    );
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  function handleLogout() {
    localStorage.removeItem(
      CURRENT_USER_KEY
    );

    localStorage.setItem(
      LOGGED_IN_KEY,
      "false"
    );

    setCurrentUser(null);

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    setMode("login");

    setError("");

    setSuccess(
      "Kamu berhasil logout."
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="text-center">
            <div className="text-4xl">
              ⏳
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Memuat akun...
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================================
  // USER SUDAH LOGIN
  // ==========================================================

  if (currentUser) {
    return (
      <>
        <Navbar />

        <main className="min-h-[70vh] bg-slate-50 px-5 py-12">
          <div className="mx-auto max-w-5xl">

            {/* HEADER */}

            <div className="mb-8">
              <span className="text-sm font-bold uppercase tracking-wider text-teal-600">
                FunTravel
              </span>

              <h1 className="mt-2 text-4xl font-black text-slate-900">
                Profile
              </h1>

              <p className="mt-3 text-slate-500">
                Kelola informasi akun FunTravel
                kamu.
              </p>
            </div>

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                {success}
              </div>
            )}

            {/* PROFILE CARD */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* TOP */}

              <div className="bg-slate-900 px-6 py-8 text-white sm:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-3xl font-black">
                    {currentUser.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">
                      Selamat datang
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      {currentUser.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-300">
                      {currentUser.email}
                    </p>
                  </div>

                </div>
              </div>

              {/* DATA */}

              <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ID Customer
                  </p>

                  <p className="mt-2 break-all font-bold text-slate-900">
                    {currentUser.id}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Nama
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {currentUser.name}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </p>

                  <p className="mt-2 break-all font-bold text-slate-900">
                    {currentUser.email}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Terdaftar
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {new Date(
                      currentUser.createdAt
                    ).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3 border-t border-slate-100 p-6 sm:p-8">

                <a
                  href="/booking"
                  className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                >
                  🧳 Buat Pesanan
                </a>

                <a
                  href="/riwayat"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  📦 Riwayat Pesanan
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  🚪 Logout
                </button>

              </div>
            </div>

          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================================
  // LOGIN / REGISTER
  // ==========================================================

  return (
    <>
      <Navbar />

      <main className="min-h-[70vh] bg-slate-50 px-5 py-12">
        <div className="mx-auto max-w-md">

          {/* HEADER */}

          <div className="mb-8 text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-600">
              FunTravel
            </span>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              {mode === "login"
                ? "Login"
                : "Buat Akun"}
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              {mode === "login"
                ? "Login untuk mengelola perjalanan dan pesananmu."
                : "Daftar akun untuk mulai menggunakan FunTravel."}
            </p>
          </div>

          {/* TAB */}

          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-200 p-1">

            <button
              type="button"
              onClick={() =>
                changeMode("login")
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() =>
                changeMode("register")
              }
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Register
            </button>

          </div>

          {/* MESSAGE */}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              {success}
            </div>
          )}

          {/* FORM */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            {mode === "login" ? (
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-teal-700"
                >
                  Login
                </button>

              </form>
            ) : (
              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >

                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Nama lengkap"
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Minimal 6 karakter"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* CONFIRM PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Konfirmasi Password
                  </label>

                  <input
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-teal-700"
                >
                  Daftar Sekarang
                </button>

              </form>
            )}

          </div>

          {/* INFO */}

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">
            Dengan menggunakan FunTravel,
            kamu dapat membuat pesanan dan
            melihat riwayat perjalanan melalui
            akunmu.
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
}