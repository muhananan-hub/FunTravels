"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  GUIDE_SESSION_KEY,
  Guide,
  getGuideByPhone,
  saveGuide,
} from "@/lib/guides";

type Mode = "login" | "register";

export default function GuideLoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [languages, setLanguages] = useState(
    "Bahasa Indonesia, English"
  );

  const [specialties, setSpecialties] = useState(
    "Pantai, Budaya, Wisata Lombok"
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session =
      localStorage.getItem(GUIDE_SESSION_KEY);

    if (session) {
      router.replace("/guide");
    }
  }, [router]);

  function normalizePhone(value: string) {
    return value.replace(/\D/g, "");
  }

  function parseList(value: string) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleLogin(event: FormEvent) {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedPhone =
      normalizePhone(phone);

    if (!normalizedPhone) {
      setError("Masukkan nomor WhatsApp.");
      return;
    }

    if (!password.trim()) {
      setError("Masukkan password.");
      return;
    }

    const guide =
      getGuideByPhone(normalizedPhone);

    if (!guide) {
      setError(
        "Akun Guide tidak ditemukan. Silakan daftar terlebih dahulu."
      );
      return;
    }

    localStorage.setItem(
      GUIDE_SESSION_KEY,
      JSON.stringify({
        guideId: guide.id,
        phone: guide.phone,
        loginAt: new Date().toISOString(),
      })
    );

    router.replace("/guide");
  }

  function handleRegister(event: FormEvent) {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedPhone =
      normalizePhone(phone);

    if (!name.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!normalizedPhone) {
      setError("Nomor WhatsApp wajib diisi.");
      return;
    }

    if (normalizedPhone.length < 10) {
      setError(
        "Nomor WhatsApp tidak valid."
      );
      return;
    }

    if (!languages.trim()) {
      setError(
        "Masukkan minimal satu bahasa."
      );
      return;
    }

    if (!specialties.trim()) {
      setError(
        "Masukkan minimal satu spesialisasi."
      );
      return;
    }

    if (!password.trim()) {
      setError("Password wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Konfirmasi password tidak cocok."
      );
      return;
    }

    const existingGuide =
      getGuideByPhone(normalizedPhone);

    if (existingGuide) {
      setError(
        "Nomor WhatsApp sudah terdaftar sebagai Guide."
      );
      return;
    }

    setLoading(true);

    const newGuide: Guide = {
      id: `GUI-${Date.now()}`,

      name: name.trim(),

      phone: normalizedPhone,

      photo: "",

      languages: parseList(languages),

      specialties:
        parseList(specialties),

      status: "offline",

      accountStatus: "pending",

      rejectionReason: "",

      approvedAt: undefined,

      approvedBy: undefined,

      rating: 0,

      totalTrips: 0,

      createdAt:
        new Date().toISOString(),
    };

    saveGuide(newGuide);

    localStorage.setItem(
      GUIDE_SESSION_KEY,
      JSON.stringify({
        guideId: newGuide.id,
        phone: newGuide.phone,
        loginAt: new Date().toISOString(),
      })
    );

    setMessage(
      "Pendaftaran berhasil. Akun Anda menunggu persetujuan Admin."
    );

    setTimeout(() => {
      router.replace("/guide");
    }, 700);
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);

    setError("");
    setMessage("");

    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* LEFT */}
        <div className="hidden lg:flex bg-slate-900 text-white p-10 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-2xl">
                🧭
              </div>

              <div>
                <h1 className="font-bold text-xl">
                  FunTravel
                </h1>

                <p className="text-sm text-slate-400">
                  Guide Partner
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Bergabung sebagai
              <br />
              Guide FunTravel
            </h2>

            <p className="mt-5 text-slate-300 leading-relaxed">
              Terima pesanan wisatawan,
              dampingi perjalanan mereka,
              dan kelola perjalanan langsung
              melalui dashboard Guide.
            </p>
          </div>

          <div className="space-y-4">
            <Feature
              icon="📋"
              title="Terima Pesanan"
              text="Guide dapat menerima order yang tersedia."
            />

            <Feature
              icon="🧭"
              title="Kelola Perjalanan"
              text="Pantau status perjalanan dari dashboard."
            />

            <Feature
              icon="⭐"
              title="Bangun Rating"
              text="Riwayat perjalanan dan rating tersimpan."
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-6 sm:p-10">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-slate-900 text-white items-center justify-center text-2xl mb-4">
              🧭
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              {mode === "login"
                ? "Login Guide"
                : "Daftar sebagai Guide"}
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              {mode === "login"
                ? "Masuk ke dashboard Guide FunTravel"
                : "Lengkapi data untuk menjadi partner Guide"}
            </p>
          </div>

          {/* MODE */}
          <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mb-7">
            <button
              type="button"
              onClick={() =>
                switchMode("login")
              }
              className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Masuk
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode("register")
              }
              className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Daftar Guide
            </button>
          </div>

          {/* MESSAGE */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {/* LOGIN */}
          {mode === "login" && (
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              <Input
                label="Nomor WhatsApp"
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={setPhone}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={setPassword}
              />

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition"
              >
                Masuk ke Dashboard
              </button>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                <strong>Mode Prototype</strong>

                <p className="mt-1">
                  Password saat ini hanya digunakan
                  sebagai validasi form dan belum
                  diverifikasi dengan database.
                </p>
              </div>
            </form>
          )}

          {/* REGISTER */}
          {mode === "register" && (
            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              <Input
                label="Nama Lengkap"
                placeholder="Contoh: Lalu Fajar"
                value={name}
                onChange={setName}
              />

              <Input
                label="Nomor WhatsApp"
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={setPhone}
              />

              <Input
                label="Bahasa yang Dikuasai"
                placeholder="Bahasa Indonesia, English"
                value={languages}
                onChange={setLanguages}
              />

              <p className="-mt-3 text-xs text-slate-400">
                Pisahkan dengan koma.
              </p>

              <Input
                label="Spesialisasi / Keahlian"
                placeholder="Pantai, Budaya, Snorkeling"
                value={specialties}
                onChange={setSpecialties}
              />

              <p className="-mt-3 text-xs text-slate-400">
                Contoh: Pantai, Budaya, Gili,
                Snorkeling, Gunung.
              </p>

              <Input
                label="Password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={setPassword}
              />

              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-60 transition"
              >
                {loading
                  ? "Memproses..."
                  : "Daftar sebagai Guide"}
              </button>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                <strong>Persetujuan Admin</strong>

                <p className="mt-1">
                  Setelah mendaftar, akun Guide
                  berstatus{" "}
                  <b>Menunggu Persetujuan</b>.
                  Guide baru dapat menerima pesanan
                  setelah disetujui Admin.
                </p>
              </div>
            </form>
          )}

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() =>
                router.push("/")
              }
              className="text-sm text-slate-500 hover:text-slate-900"
            >
              ← Kembali ke FunTravel
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
      />
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="text-sm text-slate-400 mt-1">
          {text}
        </p>
      </div>
    </div>
  );
}