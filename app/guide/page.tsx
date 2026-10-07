"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookingOrder,
  BookingStatus,
  formatRupiah,
  getBookings,
  updateBooking,
} from "@/lib/bookings";

import {
  Guide,
  GuideAccountStatus,
  GUIDE_SESSION_KEY,
  canGuideReceiveOrders,
  getGuideById,
  setGuideAvailable,
  setGuideBusy,
  setGuideOffline,
  updateGuide,
} from "@/lib/guides";

type Tab =
  | "dashboard"
  | "available"
  | "orders"
  | "history"
  | "profile";

export default function GuidePage() {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [activeTab, setActiveTab] =
    useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");

  // =========================================================
  // LOAD SESSION
  // =========================================================

  function loadData() {
    if (typeof window === "undefined") return;

    try {
      const session =
        localStorage.getItem(GUIDE_SESSION_KEY);

      if (!session) {
        window.location.href = "/guide/login";
        return;
      }

      let sessionData: {
        guideId?: string;
      } = {};

      try {
        sessionData = JSON.parse(session);
      } catch {
        sessionData = {
          guideId: session,
        };
      }

      const guideId = sessionData.guideId;

      if (!guideId) {
        localStorage.removeItem(
          GUIDE_SESSION_KEY
        );
        window.location.href = "/guide/login";
        return;
      }

      const currentGuide =
        getGuideById(guideId);

      if (!currentGuide) {
        localStorage.removeItem(
          GUIDE_SESSION_KEY
        );
        window.location.href = "/guide/login";
        return;
      }

      setGuide(currentGuide);
      setBookings(getBookings());
      setLoading(false);
    } catch (error) {
      console.error(
        "Gagal memuat dashboard guide:",
        error
      );
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 3000);

    const handleStorage = () => {
      loadData();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  // =========================================================
  // MESSAGE
  // =========================================================

  function showMessage(
    text: string,
    type: "success" | "error" | "info" = "info"
  ) {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 3500);
  }

  // =========================================================
  // CURRENT GUIDE
  // =========================================================

  const currentGuide = useMemo(() => {
    if (!guide) return null;

    const latest = getGuideById(guide.id);

    return latest || guide;
  }, [guide, bookings]);

  // =========================================================
  // BOOKING FILTERS
  // =========================================================

  const availableOrders = useMemo(() => {
    if (!currentGuide) return [];

    const canReceive =
      canGuideReceiveOrders(currentGuide);

    if (!canReceive) return [];

    return bookings.filter((booking) => {
      // Driver-only tidak boleh muncul di Guide
      if (booking.service === "driver") {
        return false;
      }

      // Hanya booking yang belum punya guide
      if (booking.guideId) {
        return false;
      }

      // Hanya Guide dan Paket Lengkap
      if (
        booking.service !== "guide" &&
        booking.service !== "package"
      ) {
        return false;
      }

      // Jangan tampilkan pesanan yang sudah selesai,
      // dibatalkan, atau sedang berjalan
      if (
        booking.status === "completed" ||
        booking.status === "cancelled" ||
        booking.status === "ongoing"
      ) {
        return false;
      }

      return true;
    });
  }, [bookings, currentGuide]);

  const myOrders = useMemo(() => {
    if (!currentGuide) return [];

    return bookings
      .filter(
        (booking) =>
          booking.guideId === currentGuide.id
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [bookings, currentGuide]);

  const activeOrders = useMemo(() => {
    return myOrders.filter(
      (booking) =>
        booking.status ===
          "guide_accepted" ||
        booking.status ===
          "driver_accepted" ||
        booking.status ===
          "confirmed" ||
        booking.status === "ongoing"
    );
  }, [myOrders]);

  const historyOrders = useMemo(() => {
    return myOrders.filter(
      (booking) =>
        booking.status === "completed" ||
        booking.status === "cancelled"
    );
  }, [myOrders]);

  const completedOrders = useMemo(() => {
    return myOrders.filter(
      (booking) =>
        booking.status === "completed"
    );
  }, [myOrders]);

  // =========================================================
  // ACCOUNT STATUS
  // =========================================================

  function getAccountStatusText(
    status: GuideAccountStatus
  ) {
    switch (status) {
      case "approved":
        return "Akun Disetujui";

      case "rejected":
        return "Pendaftaran Ditolak";

      case "pending":
      default:
        return "Menunggu Persetujuan";
    }
  }

  function getAccountStatusClass(
    status: GuideAccountStatus
  ) {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";

      case "pending":
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  }

  // =========================================================
  // BOOKING STATUS
  // =========================================================

  function getBookingStatusText(
    status: BookingStatus
  ) {
    switch (status) {
      case "pending":
        return "Menunggu Guide";

      case "driver_accepted":
        return "Driver Sudah Menerima";

      case "guide_accepted":
        return "Guide Sudah Menerima";

      case "confirmed":
        return "Dikonfirmasi";

      case "ongoing":
        return "Sedang Berjalan";

      case "completed":
        return "Selesai";

      case "cancelled":
        return "Dibatalkan";

      default:
        return status;
    }
  }

  function getBookingStatusClass(
    status: BookingStatus
  ) {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";

      case "driver_accepted":
        return "bg-blue-100 text-blue-700";

      case "guide_accepted":
        return "bg-indigo-100 text-indigo-700";

      case "confirmed":
        return "bg-emerald-100 text-emerald-700";

      case "ongoing":
        return "bg-purple-100 text-purple-700";

      case "completed":
        return "bg-slate-100 text-slate-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  // =========================================================
  // SERVICE
  // =========================================================

  function getServiceName(
    service: BookingOrder["service"]
  ) {
    switch (service) {
      case "guide":
        return "Guide";

      case "package":
        return "Paket Lengkap";

      case "driver":
        return "Driver";

      default:
        return service;
    }
  }

  // =========================================================
  // ACCEPT BOOKING
  // =========================================================

  function acceptBooking(
    bookingId: string
  ) {
    if (!currentGuide) return;

    // Ambil data guide terbaru
    const latestGuide =
      getGuideById(currentGuide.id);

    if (!latestGuide) {
      showMessage(
        "Data guide tidak ditemukan.",
        "error"
      );
      return;
    }

    // Harus sudah disetujui admin
    if (
      latestGuide.accountStatus !==
      "approved"
    ) {
      showMessage(
        "Akun guide belum disetujui admin.",
        "error"
      );
      return;
    }

    // Harus available
    if (
      latestGuide.status !== "available"
    ) {
      showMessage(
        "Guide harus dalam status Available.",
        "error"
      );
      return;
    }

    // Ambil booking TERBARU dari localStorage
    const latestBookings = getBookings();

    const latestBooking =
      latestBookings.find(
        (item) => item.id === bookingId
      );

    if (!latestBooking) {
      showMessage(
        "Pesanan tidak ditemukan.",
        "error"
      );
      return;
    }

    // Driver-only tidak boleh diterima guide
    if (
      latestBooking.service === "driver"
    ) {
      showMessage(
        "Pesanan Driver saja tidak dapat diterima Guide.",
        "error"
      );
      return;
    }

    // Sudah diterima guide lain
    if (latestBooking.guideId) {
      showMessage(
        "Pesanan ini sudah diterima guide lain.",
        "error"
      );
      loadData();
      return;
    }

    // Jangan terima pesanan selesai/batal
    if (
      latestBooking.status === "completed" ||
      latestBooking.status === "cancelled"
    ) {
      showMessage(
        "Pesanan ini sudah tidak dapat diterima.",
        "error"
      );
      return;
    }

    const acceptedAt =
      new Date().toISOString();

    const guideInfo = {
      id: latestGuide.id,
      name: latestGuide.name,
      phone: latestGuide.phone,
      photo: latestGuide.photo,
      languages: latestGuide.languages,
      status: "accepted" as const,
      acceptedAt,
    };

    // =====================================================
    // STATUS SETELAH GUIDE MENERIMA
    // =====================================================
    //
    // GUIDE SAJA
    // Guide menerima -> CONFIRMED
    //
    // PACKAGE
    // Guide menerima dulu -> GUIDE_ACCEPTED
    // Driver sudah menerima -> CONFIRMED
    //
    // DRIVER SAJA
    // Tidak pernah masuk ke sini karena sudah diblokir
    // =====================================================

    let nextStatus: BookingStatus;

    if (
      latestBooking.service === "guide"
    ) {
      nextStatus = "confirmed";
    } else {
      nextStatus =
        latestBooking.driverId
          ? "confirmed"
          : "guide_accepted";
    }

    updateBooking(bookingId, {
      guideId: latestGuide.id,
      guideAcceptedAt: acceptedAt,
      guide: guideInfo,
      status: nextStatus,
    });

    // Guide menjadi busy
    setGuideBusy(latestGuide.id);

    showMessage(
      "Pesanan berhasil diterima.",
      "success"
    );

    loadData();
    setActiveTab("orders");
  }

  // =========================================================
  // START TRIP
  // =========================================================

  function startTrip(
    bookingId: string
  ) {
    if (!currentGuide) return;

    const latestBooking =
      getBookings().find(
        (item) => item.id === bookingId
      );

    if (!latestBooking) {
      showMessage(
        "Pesanan tidak ditemukan.",
        "error"
      );
      return;
    }

    if (
      latestBooking.guideId !==
      currentGuide.id
    ) {
      showMessage(
        "Pesanan ini bukan milik Anda.",
        "error"
      );
      return;
    }

    if (
      latestBooking.status !==
        "guide_accepted" &&
      latestBooking.status !==
        "driver_accepted" &&
      latestBooking.status !== "confirmed"
    ) {
      showMessage(
        "Pesanan belum dapat dimulai.",
        "error"
      );
      return;
    }

    updateBooking(bookingId, {
      status: "ongoing",
    });

    showMessage(
      "Perjalanan dimulai.",
      "success"
    );

    loadData();
  }

  // =========================================================
  // COMPLETE BOOKING
  // =========================================================

  function completeBooking(
    bookingId: string
  ) {
    if (!currentGuide) return;

    const latestBooking =
      getBookings().find(
        (item) => item.id === bookingId
      );

    if (!latestBooking) {
      showMessage(
        "Pesanan tidak ditemukan.",
        "error"
      );
      return;
    }

    if (
      latestBooking.guideId !==
      currentGuide.id
    ) {
      showMessage(
        "Pesanan ini bukan milik Anda.",
        "error"
      );
      return;
    }

    if (
      latestBooking.status !== "ongoing"
    ) {
      showMessage(
        "Perjalanan belum sedang berjalan.",
        "error"
      );
      return;
    }

    updateBooking(bookingId, {
      status: "completed",
    });

    const latestGuide =
      getGuideById(currentGuide.id);

    if (latestGuide) {
      updateGuide(latestGuide.id, {
        status:
          latestGuide.accountStatus ===
          "approved"
            ? "available"
            : "offline",
        totalTrips:
          latestGuide.totalTrips + 1,
      });
    }

    showMessage(
      "Pesanan berhasil diselesaikan.",
      "success"
    );

    loadData();
  }

  // =========================================================
  // RELEASE BOOKING
  // =========================================================

  function releaseBooking(
    bookingId: string
  ) {
    if (!currentGuide) return;

    const latestBooking =
      getBookings().find(
        (item) => item.id === bookingId
      );

    if (!latestBooking) {
      showMessage(
        "Pesanan tidak ditemukan.",
        "error"
      );
      return;
    }

    if (
      latestBooking.guideId !==
      currentGuide.id
    ) {
      showMessage(
        "Pesanan ini bukan milik Anda.",
        "error"
      );
      return;
    }

    if (
      latestBooking.status === "ongoing"
    ) {
      showMessage(
        "Perjalanan yang sedang berjalan tidak dapat dilepas.",
        "error"
      );
      return;
    }

    let restoredStatus: BookingStatus =
      "pending";

    // Kalau driver sudah menerima,
    // status kembali menjadi driver_accepted
    if (latestBooking.driverId) {
      restoredStatus =
        "driver_accepted";
    }

    updateBooking(bookingId, {
      guideId: undefined,
      guideAcceptedAt: undefined,
      guide: undefined,
      status: restoredStatus,
    });

    const latestGuide =
      getGuideById(currentGuide.id);

    if (latestGuide) {
      setGuideAvailable(
        latestGuide.id
      );
    }

    showMessage(
      "Pesanan berhasil dilepas.",
      "success"
    );

    loadData();
  }

  // =========================================================
  // AVAILABILITY
  // =========================================================

  function toggleAvailability() {
    if (!currentGuide) return;

    const latestGuide =
      getGuideById(currentGuide.id);

    if (!latestGuide) return;

    if (
      latestGuide.accountStatus !==
      "approved"
    ) {
      showMessage(
        "Akun harus disetujui admin terlebih dahulu.",
        "error"
      );
      return;
    }

    if (latestGuide.status === "busy") {
      showMessage(
        "Guide sedang menangani pesanan.",
        "info"
      );
      return;
    }

    if (
      latestGuide.status === "available"
    ) {
      setGuideOffline(
        latestGuide.id
      );

      showMessage(
        "Status Anda sekarang Offline.",
        "info"
      );
    } else {
      setGuideAvailable(
        latestGuide.id
      );

      showMessage(
        "Anda sekarang Online dan dapat menerima pesanan.",
        "success"
      );
    }

    loadData();
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  function logout() {
    localStorage.removeItem(
      GUIDE_SESSION_KEY
    );

    window.location.href =
      "/guide/login";
  }

  // =========================================================
  // HELPERS
  // =========================================================

  function formatDate(value?: string) {
    if (!value) return "-";

    try {
      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ).format(new Date(value));
    } catch {
      return value;
    }
  }

  function formatDateTime(
    value?: string
  ) {
    if (!value) return "-";

    try {
      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ).format(new Date(value));
    } catch {
      return value;
    }
  }

  function getInitial(name: string) {
    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading ||
    !currentGuide
  ) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mx-auto mb-4" />

          <p className="text-slate-600">
            Memuat dashboard guide...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* BRAND */}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg">
                🧭
              </div>

              <div>
                <h1 className="font-bold text-lg">
                  FunTravel Guide
                </h1>

                <p className="text-xs text-slate-500 hidden sm:block">
                  Dashboard Guide
                </p>
              </div>
            </div>

            {/* GUIDE */}

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">
                  {currentGuide.name}
                </p>

                <p className="text-xs text-slate-500">
                  {currentGuide.phone}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {getInitial(
                  currentGuide.name
                )}
              </div>

              <button
                onClick={logout}
                className="hidden sm:block px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MESSAGE
      ====================================================== */}

      {message && (
        <div className="fixed top-20 right-4 z-[60] max-w-sm">
          <div
            className={`rounded-xl border px-4 py-3 shadow-lg ${
              messageType === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : messageType === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="bg-white rounded-2xl border border-slate-200 p-3 h-fit lg:sticky lg:top-24">
            <div className="space-y-1">
              {[
                {
                  id: "dashboard" as Tab,
                  label: "Dashboard",
                  icon: "📊",
                },
                {
                  id: "available" as Tab,
                  label: "Pesanan Tersedia",
                  icon: "📋",
                  count:
                    availableOrders.length,
                },
                {
                  id: "orders" as Tab,
                  label: "Pesanan Saya",
                  icon: "🧭",
                  count:
                    activeOrders.length,
                },
                {
                  id: "history" as Tab,
                  label: "Riwayat",
                  icon: "🕘",
                  count:
                    historyOrders.length,
                },
                {
                  id: "profile" as Tab,
                  label: "Profile",
                  icon: "👤",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setActiveTab(item.id)
                  }
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition ${
                    activeTab === item.id
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span>
                      {item.icon}
                    </span>

                    {item.label}
                  </span>

                  {typeof item.count ===
                    "number" &&
                    item.count > 0 && (
                      <span
                        className={`min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center text-xs font-bold ${
                          activeTab ===
                          item.id
                            ? "bg-white text-indigo-600"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={logout}
                className="sm:hidden w-full px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 text-left"
              >
                🚪 Keluar
              </button>
            </div>
          </aside>

          {/* =================================================
              CONTENT
          ================================================== */}

          <section className="min-w-0">
            {/* =================================================
                ACCOUNT STATUS
            ================================================== */}

            <div
              className={`rounded-2xl border p-4 mb-6 ${getAccountStatusClass(
                currentGuide.accountStatus
              )}`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Status Akun
                  </p>

                  <h2 className="text-lg font-bold mt-1">
                    {getAccountStatusText(
                      currentGuide.accountStatus
                    )}
                  </h2>

                  {currentGuide.accountStatus ===
                    "pending" && (
                    <p className="text-sm mt-1">
                      Data Anda sedang
                      diperiksa oleh admin
                      FunTravel.
                    </p>
                  )}

                  {currentGuide.accountStatus ===
                    "rejected" && (
                    <p className="text-sm mt-1">
                      Alasan:{" "}
                      {currentGuide.rejectionReason ||
                        "Tidak ada alasan yang diberikan."}
                    </p>
                  )}

                  {currentGuide.accountStatus ===
                    "approved" && (
                    <p className="text-sm mt-1">
                      Anda dapat menerima
                      pesanan guide ketika
                      status Anda Online.
                    </p>
                  )}
                </div>

                <div>
                  {currentGuide.accountStatus ===
                    "approved" && (
                    <button
                      onClick={
                        toggleAvailability
                      }
                      disabled={
                        currentGuide.status ===
                        "busy"
                      }
                      className={`px-5 py-3 rounded-xl font-bold text-sm ${
                        currentGuide.status ===
                        "available"
                          ? "bg-white text-slate-700 border border-slate-200"
                          : "bg-emerald-600 text-white"
                      } ${
                        currentGuide.status ===
                        "busy"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {currentGuide.status ===
                      "available"
                        ? "🔴 Offline"
                        : currentGuide.status ===
                          "busy"
                        ? "🟡 Sedang Bertugas"
                        : "🟢 Online"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                DASHBOARD
            ================================================== */}

            {activeTab ===
              "dashboard" && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-500">
                    Selamat datang kembali,
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                    {currentGuide.name} 👋
                  </h2>

                  <p className="text-slate-500 mt-2">
                    Kelola pesanan perjalanan
                    dan aktivitas guide Anda
                    dari sini.
                  </p>
                </div>

                {/* STAT */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                      Rating
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      ⭐{" "}
                      {currentGuide.rating.toFixed(
                        1
                      )}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                      Total Perjalanan
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      {
                        currentGuide.totalTrips
                      }
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                      Pesanan Aktif
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      {activeOrders.length}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                      Pesanan Tersedia
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      {
                        availableOrders.length
                      }
                    </p>
                  </div>
                </div>

                {/* STATUS OPERASIONAL */}

                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        Status Operasional
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Status ini menentukan
                        apakah customer dapat
                        dilayani oleh Anda.
                      </p>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        currentGuide.status ===
                        "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : currentGuide.status ===
                            "busy"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {currentGuide.status ===
                        "available" &&
                        "🟢 Available"}

                      {currentGuide.status ===
                        "busy" &&
                        "🟡 Busy"}

                      {currentGuide.status ===
                        "offline" &&
                        "⚪ Offline"}
                    </div>
                  </div>

                  {currentGuide.accountStatus ===
                    "approved" && (
                    <button
                      onClick={
                        toggleAvailability
                      }
                      disabled={
                        currentGuide.status ===
                        "busy"
                      }
                      className="mt-5 w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {currentGuide.status ===
                      "available"
                        ? "Matikan Status Online"
                        : currentGuide.status ===
                          "offline"
                        ? "Aktifkan Status Online"
                        : "Sedang Menangani Pesanan"}
                    </button>
                  )}
                </div>

                {/* PESANAN TERBARU */}

                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-lg">
                        Pesanan Terbaru
                      </h3>

                      <p className="text-sm text-slate-500">
                        Pesanan yang sudah Anda
                        terima.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setActiveTab(
                          "orders"
                        )
                      }
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  {activeOrders.length ===
                  0 ? (
                    <EmptyState
                      icon="🧭"
                      title="Belum ada pesanan aktif"
                      description="Pesanan yang Anda terima akan muncul di sini."
                    />
                  ) : (
                    <div className="space-y-3">
                      {activeOrders
                        .slice(0, 3)
                        .map(
                          (booking) => (
                            <BookingCard
                              key={
                                booking.id
                              }
                              booking={
                                booking
                              }
                              mode="active"
                              onStart={
                                startTrip
                              }
                              onComplete={
                                completeBooking
                              }
                              onRelease={
                                releaseBooking
                              }
                              getServiceName={
                                getServiceName
                              }
                              getBookingStatusText={
                                getBookingStatusText
                              }
                              getBookingStatusClass={
                                getBookingStatusClass
                              }
                              formatDate={
                                formatDate
                              }
                              formatDateTime={
                                formatDateTime
                              }
                            />
                          )
                        )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                AVAILABLE ORDERS
            ================================================== */}

            {activeTab ===
              "available" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Pesanan Tersedia
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Pesanan Guide dan Paket
                    Lengkap yang belum
                    diterima guide lain.
                  </p>
                </div>

                {currentGuide.accountStatus !==
                "approved" ? (
                  <EmptyState
                    icon="🔒"
                    title="Akun belum disetujui"
                    description="Anda baru dapat menerima pesanan setelah admin menyetujui akun guide Anda."
                  />
                ) : currentGuide.status !==
                  "available" ? (
                  <EmptyState
                    icon="⚪"
                    title="Anda sedang Offline"
                    description="Aktifkan status Online untuk melihat dan menerima pesanan."
                    action={
                      currentGuide.status !==
                      "busy"
                        ? {
                            label:
                              "Aktifkan Online",
                            onClick:
                              toggleAvailability,
                          }
                        : undefined
                    }
                  />
                ) : availableOrders.length ===
                  0 ? (
                  <EmptyState
                    icon="📭"
                    title="Belum ada pesanan"
                    description="Saat ini belum ada pesanan Guide yang tersedia."
                  />
                ) : (
                  <div className="space-y-4">
                    {availableOrders.map(
                      (booking) => (
                        <AvailableBookingCard
                          key={
                            booking.id
                          }
                          booking={
                            booking
                          }
                          onAccept={
                            acceptBooking
                          }
                          getServiceName={
                            getServiceName
                          }
                          getBookingStatusText={
                            getBookingStatusText
                          }
                          getBookingStatusClass={
                            getBookingStatusClass
                          }
                          formatDate={
                            formatDate
                          }
                          formatDateTime={
                            formatDateTime
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                MY ORDERS
            ================================================== */}

            {activeTab ===
              "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Pesanan Saya
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Pesanan yang sedang Anda
                    tangani.
                  </p>
                </div>

                {activeOrders.length ===
                0 ? (
                  <EmptyState
                    icon="🧭"
                    title="Belum ada pesanan aktif"
                    description="Terima pesanan dari menu Pesanan Tersedia untuk mulai bekerja."
                  />
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map(
                      (booking) => (
                        <BookingCard
                          key={
                            booking.id
                          }
                          booking={
                            booking
                          }
                          mode="active"
                          onStart={
                            startTrip
                          }
                          onComplete={
                            completeBooking
                          }
                          onRelease={
                            releaseBooking
                          }
                          getServiceName={
                            getServiceName
                          }
                          getBookingStatusText={
                            getBookingStatusText
                          }
                          getBookingStatusClass={
                            getBookingStatusClass
                          }
                          formatDate={
                            formatDate
                          }
                          formatDateTime={
                            formatDateTime
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                HISTORY
            ================================================== */}

            {activeTab ===
              "history" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Riwayat Perjalanan
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Riwayat pesanan yang sudah
                    selesai atau dibatalkan.
                  </p>
                </div>

                {historyOrders.length ===
                0 ? (
                  <EmptyState
                    icon="🕘"
                    title="Belum ada riwayat"
                    description="Riwayat perjalanan Anda akan muncul di sini."
                  />
                ) : (
                  <div className="space-y-4">
                    {historyOrders.map(
                      (booking) => (
                        <BookingCard
                          key={
                            booking.id
                          }
                          booking={
                            booking
                          }
                          mode="history"
                          getServiceName={
                            getServiceName
                          }
                          getBookingStatusText={
                            getBookingStatusText
                          }
                          getBookingStatusClass={
                            getBookingStatusClass
                          }
                          formatDate={
                            formatDate
                          }
                          formatDateTime={
                            formatDateTime
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                PROFILE
            ================================================== */}

            {activeTab ===
              "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Profile Guide
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Informasi yang ditampilkan
                    kepada customer setelah
                    Anda menerima pesanan.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-4xl font-bold">
                        {getInitial(
                          currentGuide.name
                        )}
                      </div>

                      <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-bold">
                          {
                            currentGuide.name
                          }
                        </h3>

                        <p className="text-slate-500 mt-1">
                          Guide FunTravel
                        </p>

                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                            ⭐{" "}
                            {currentGuide.rating.toFixed(
                              1
                            )}
                          </span>

                          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                            {
                              currentGuide.totalTrips
                            }{" "}
                            perjalanan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 grid md:grid-cols-2 gap-6">
                    <InfoItem
                      label="ID Guide"
                      value={
                        currentGuide.id
                      }
                    />

                    <InfoItem
                      label="Nomor Telepon"
                      value={
                        currentGuide.phone
                      }
                    />

                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
                        Bahasa
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {currentGuide.languages.map(
                          (language) => (
                            <span
                              key={
                                language
                              }
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm"
                            >
                              {
                                language
                              }
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
                        Keahlian
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {currentGuide.specialties.map(
                          (
                            specialty
                          ) => (
                            <span
                              key={
                                specialty
                              }
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-sm"
                            >
                              {
                                specialty
                              }
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <InfoItem
                      label="Status Akun"
                      value={getAccountStatusText(
                        currentGuide.accountStatus
                      )}
                    />

                    <InfoItem
                      label="Status Operasional"
                      value={
                        currentGuide.status ===
                        "available"
                          ? "Available"
                          : currentGuide.status ===
                            "busy"
                          ? "Busy"
                          : "Offline"
                      }
                    />

                    <InfoItem
                      label="Terdaftar Sejak"
                      value={formatDate(
                        currentGuide.createdAt
                      )}
                    />

                    <InfoItem
                      label="Disetujui"
                      value={
                        currentGuide.approvedAt
                          ? formatDateTime(
                              currentGuide.approvedAt
                            )
                          : "-"
                      }
                    />
                  </div>
                </div>

                {/* STAT PROFILE */}

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-sm text-slate-500">
                      Total Perjalanan
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      {
                        currentGuide.totalTrips
                      }
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-sm text-slate-500">
                      Pesanan Selesai
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      {
                        completedOrders.length
                      }
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-sm text-slate-500">
                      Rating
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      ⭐{" "}
                      {currentGuide.rating.toFixed(
                        1
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

// ===========================================================
// AVAILABLE BOOKING CARD
// ===========================================================

function AvailableBookingCard({
  booking,
  onAccept,
  getServiceName,
  getBookingStatusText,
  getBookingStatusClass,
  formatDate,
  formatDateTime,
}: {
  booking: BookingOrder;
  onAccept: (id: string) => void;
  getServiceName: (
    service: BookingOrder["service"]
  ) => string;
  getBookingStatusText: (
    status: BookingStatus
  ) => string;
  getBookingStatusClass: (
    status: BookingStatus
  ) => string;
  formatDate: (
    value?: string
  ) => string;
  formatDateTime: (
    value?: string
  ) => string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {getServiceName(
                booking.service
              )}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getBookingStatusClass(
                booking.status
              )}`}
            >
              {getBookingStatusText(
                booking.status
              )}
            </span>
          </div>

          <h3 className="text-xl font-bold">
            {booking.destinationName}
          </h3>

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <InfoRow
              icon="📍"
              label="Penjemputan"
              value={booking.pickup}
            />

            <InfoRow
              icon="👥"
              label="Penumpang"
              value={`${booking.passengers} orang`}
            />

            <InfoRow
              icon="📅"
              label="Tanggal"
              value={formatDate(
                booking.date
              )}
            />

            <InfoRow
              icon="🕐"
              label="Waktu"
              value={
                booking.time || "-"
              }
            />

            {booking.distance && (
              <InfoRow
                icon="📏"
                label="Jarak"
                value={
                  booking.distance
                }
              />
            )}

            {booking.duration && (
              <InfoRow
                icon="⏱️"
                label="Durasi"
                value={
                  booking.duration
                }
              />
            )}
          </div>

          {booking.packageName && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                Paket
              </p>

              <p className="font-bold text-indigo-900 mt-1">
                {
                  booking.packageName
                }
              </p>

              {booking.packagePrice && (
                <p className="text-sm text-indigo-700 mt-1">
                  {formatRupiah(
                    booking.packagePrice
                  )}
                </p>
              )}
            </div>
          )}

          {booking.notes && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Catatan Customer
              </p>

              <p className="text-sm text-slate-700 mt-1">
                {booking.notes}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">
            Pesanan dibuat{" "}
            {formatDateTime(
              booking.createdAt
            )}
          </p>
        </div>

        <div className="lg:w-44 shrink-0">
          <div className="bg-slate-50 rounded-xl p-4 mb-3">
            <p className="text-xs text-slate-500">
              Total Pesanan
            </p>

            <p className="font-bold text-lg mt-1">
              {formatRupiah(
                booking.totalPrice
              )}
            </p>
          </div>

          <button
            onClick={() =>
              onAccept(booking.id)
            }
            className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
          >
            Terima Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================
// BOOKING CARD
// ===========================================================

function BookingCard({
  booking,
  mode,
  onStart,
  onComplete,
  onRelease,
  getServiceName,
  getBookingStatusText,
  getBookingStatusClass,
  formatDate,
  formatDateTime,
}: {
  booking: BookingOrder;
  mode: "active" | "history";
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRelease?: (id: string) => void;
  getServiceName: (
    service: BookingOrder["service"]
  ) => string;
  getBookingStatusText: (
    status: BookingStatus
  ) => string;
  getBookingStatusClass: (
    status: BookingStatus
  ) => string;
  formatDate: (
    value?: string
  ) => string;
  formatDateTime: (
    value?: string
  ) => string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              {getServiceName(
                booking.service
              )}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getBookingStatusClass(
                booking.status
              )}`}
            >
              {getBookingStatusText(
                booking.status
              )}
            </span>
          </div>

          <h3 className="text-xl font-bold">
            {booking.destinationName}
          </h3>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <InfoRow
              icon="📍"
              label="Pickup"
              value={booking.pickup}
            />

            <InfoRow
              icon="👥"
              label="Penumpang"
              value={`${booking.passengers} orang`}
            />

            <InfoRow
              icon="📅"
              label="Tanggal"
              value={formatDate(
                booking.date
              )}
            />

            <InfoRow
              icon="🕐"
              label="Waktu"
              value={
                booking.time || "-"
              }
            />
          </div>

          {booking.driver && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs uppercase tracking-wider font-bold text-blue-500">
                Driver
              </p>

              <p className="font-bold text-blue-900 mt-1">
                {
                  booking.driver.name
                }
              </p>

              <p className="text-sm text-blue-700">
                {
                  booking.driver.vehicle
                }{" "}
                •{" "}
                {booking.driver
                  .plateNumber ||
                  "-"}
              </p>

              <p className="text-sm text-blue-700 mt-1">
                📞{" "}
                {
                  booking.driver.phone
                }
              </p>
            </div>
          )}

          {booking.notes && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Catatan
              </p>

              <p className="text-sm text-slate-700 mt-1">
                {booking.notes}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">
            Pesanan dibuat{" "}
            {formatDateTime(
              booking.createdAt
            )}
          </p>
        </div>

        <div className="lg:w-44 shrink-0">
          <div className="bg-slate-50 rounded-xl p-4 mb-3">
            <p className="text-xs text-slate-500">
              Total
            </p>

            <p className="font-bold text-lg">
              {formatRupiah(
                booking.totalPrice
              )}
            </p>
          </div>

          {mode === "active" && (
            <div className="space-y-2">
              {(booking.status ===
                "guide_accepted" ||
                booking.status ===
                  "driver_accepted" ||
                booking.status ===
                  "confirmed") &&
                onStart && (
                  <button
                    onClick={() =>
                      onStart(
                        booking.id
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                  >
                    ▶ Mulai Perjalanan
                  </button>
                )}

              {booking.status ===
                "ongoing" &&
                onComplete && (
                  <button
                    onClick={() =>
                      onComplete(
                        booking.id
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                  >
                    ✓ Selesaikan
                  </button>
                )}

              {booking.status !==
                "ongoing" &&
                onRelease && (
                  <button
                    onClick={() =>
                      onRelease(
                        booking.id
                      )
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50"
                  >
                    Lepaskan Pesanan
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================================
// INFO ROW
// ===========================================================

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-slate-50">
      <span className="text-lg">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-700 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

// ===========================================================
// INFO ITEM
// ===========================================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider font-bold text-slate-500">
        {label}
      </p>

      <p className="font-semibold text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}

// ===========================================================
// EMPTY STATE
// ===========================================================

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
      <div className="text-5xl mb-4">
        {icon}
      </div>

      <h3 className="text-lg font-bold">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}