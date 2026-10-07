"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookingOrder,
  BookingStatus,
  formatRupiah,
  getBookings,
  updateBooking,
} from "@/lib/bookings";

import {
  Driver,
  DRIVER_SESSION_KEY,
  canDriverReceiveOrders,
  getDriverById,
  setDriverAvailable,
  setDriverBusy,
  setDriverOffline,
  updateDriver,
} from "@/lib/drivers";

type Section =
  | "dashboard"
  | "orders"
  | "active"
  | "history"
  | "completed"
  | "profile";

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/*
|--------------------------------------------------------------------------
| STATUS LABEL
|--------------------------------------------------------------------------
*/

function statusLabel(status: BookingStatus) {
  const labels: Record<BookingStatus, string> = {
    pending: "Menunggu Driver",
    driver_accepted: "Driver Menerima",
    guide_accepted: "Menunggu Driver",
    confirmed: "Dikonfirmasi",
    ongoing: "Sedang Berjalan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return labels[status];
}

/*
|--------------------------------------------------------------------------
| SERVICE LABEL
|--------------------------------------------------------------------------
*/

function serviceLabel(service: BookingOrder["service"]) {
  if (service === "driver") {
    return "Driver Saja";
  }

  if (service === "guide") {
    return "Guide Saja";
  }

  return "Paket Lengkap";
}

/*
|--------------------------------------------------------------------------
| DRIVER PAGE
|--------------------------------------------------------------------------
*/

export default function DriverPage() {
  const [section, setSection] =
    useState<Section>("dashboard");

  const [driver, setDriver] =
    useState<Driver | null>(null);

  const [bookings, setBookings] =
    useState<BookingOrder[]>([]);

  const [error, setError] = useState("");

  /*
   * Driver ID dipisahkan dari object driver.
   *
   * Ini penting supaya useMemo di bawah
   * tetap bisa dijalankan meskipun driver
   * belum berhasil dimuat.
   */
  const driverId = driver?.id ?? "";

  /*
  |--------------------------------------------------------------------------
  | LOAD DRIVER SESSION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const sessionData =
      localStorage.getItem(DRIVER_SESSION_KEY);

    if (!sessionData) {
      window.location.href = "/driver/login";
      return;
    }

    try {
      const session = JSON.parse(sessionData);

      if (!session?.driverId) {
        localStorage.removeItem(DRIVER_SESSION_KEY);
        window.location.href = "/driver/login";
        return;
      }

      const currentDriver =
        getDriverById(session.driverId);

      if (!currentDriver) {
        localStorage.removeItem(DRIVER_SESSION_KEY);
        window.location.href = "/driver/login";
        return;
      }

      setDriver(currentDriver);
      setBookings(getBookings());
    } catch {
      localStorage.removeItem(DRIVER_SESSION_KEY);
      window.location.href = "/driver/login";
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | REFRESH DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!driverId) {
      return;
    }

    const refresh = () => {
      const latestDriver =
        getDriverById(driverId);

      if (latestDriver) {
        setDriver(latestDriver);
      }

      setBookings(getBookings());
    };

    const interval = setInterval(
      refresh,
      3000
    );

    window.addEventListener(
      "storage",
      refresh
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "storage",
        refresh
      );
    };
  }, [driverId]);

  /*
  |--------------------------------------------------------------------------
  | DRIVER STATUS
  |--------------------------------------------------------------------------
  */

  const isApproved =
    driver?.accountStatus === "approved";

  const isPending =
    driver?.accountStatus === "pending";

  const isRejected =
    driver?.accountStatus === "rejected";

  const canReceive =
    driver
      ? canDriverReceiveOrders(driver)
      : false;

  /*
  |--------------------------------------------------------------------------
  | BOOKINGS
  |--------------------------------------------------------------------------
  |
  | SEMUA useMemo diletakkan SEBELUM
  | conditional return.
  |
  | Ini memperbaiki:
  |
  | React has detected a change in the
  | order of Hooks called by DriverPage
  |
  |--------------------------------------------------------------------------
  */

  /*
   * Pesanan yang tersedia.
   */
  const availableBookings =
    useMemo(() => {
      if (!canReceive) {
        return [];
      }

      return bookings.filter((booking) => {
        if (booking.status === "cancelled") {
          return false;
        }

        /*
         * Driver saja.
         */
        if (booking.service === "driver") {
          return (
            !booking.driverId &&
            (
              booking.status === "pending" ||
              booking.status === "guide_accepted"
            )
          );
        }

        /*
         * Paket lengkap.
         */
        if (booking.service === "package") {
          return (
            !booking.driverId &&
            (
              booking.status === "pending" ||
              booking.status === "guide_accepted"
            )
          );
        }

        /*
         * Guide saja tidak membutuhkan driver.
         */
        return false;
      });
    }, [bookings, canReceive]);

  /*
   * Pesanan aktif milik driver.
   */
  const activeBookings =
    useMemo(() => {
      if (!driverId) {
        return [];
      }

      return bookings.filter(
        (booking) =>
          booking.driverId === driverId &&
          (
            booking.status ===
              "driver_accepted" ||
            booking.status === "confirmed" ||
            booking.status === "ongoing"
          )
      );
    }, [bookings, driverId]);

  /*
   * Semua riwayat penerimaan.
   */
  const historyBookings =
    useMemo(() => {
      if (!driverId) {
        return [];
      }

      return bookings.filter(
        (booking) =>
          booking.driverId === driverId
      );
    }, [bookings, driverId]);

  /*
   * Pesanan selesai.
   */
  const completedBookings =
    useMemo(() => {
      if (!driverId) {
        return [];
      }

      return bookings.filter(
        (booking) =>
          booking.driverId === driverId &&
          booking.status === "completed"
      );
    }, [bookings, driverId]);

  /*
  |--------------------------------------------------------------------------
  | KALAU DRIVER BELUM DIMUAT
  |--------------------------------------------------------------------------
  |
  | Conditional return sekarang berada
  | SETELAH semua Hook.
  |--------------------------------------------------------------------------
  */

  if (!driver) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Memuat dashboard driver...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ACCEPT BOOKING
  |--------------------------------------------------------------------------
  */

  function acceptBooking(bookingId: string) {
    setError("");

    /*
     * SECURITY CHECK #1
     */
    const latestDriver =
      getDriverById(driver.id);

    if (!latestDriver) {
      setError(
        "Data driver tidak ditemukan."
      );

      return;
    }

    /*
     * SECURITY CHECK #2
     */
    if (
      latestDriver.accountStatus !==
      "approved"
    ) {
      setError(
        "Akun kamu belum disetujui admin. Kamu belum dapat menerima pesanan."
      );

      return;
    }

    /*
     * SECURITY CHECK #3
     */
    if (
      latestDriver.status !==
      "available"
    ) {
      setError(
        "Status driver harus tersedia untuk menerima pesanan."
      );

      return;
    }

    /*
     * Ambil booking TERBARU.
     */
    const latestBookings =
      getBookings();

    const booking =
      latestBookings.find(
        (item) =>
          item.id === bookingId
      );

    if (!booking) {
      setError(
        "Pesanan tidak ditemukan."
      );

      setBookings(latestBookings);

      return;
    }

    /*
     * Sudah diterima driver lain.
     */
    if (booking.driverId) {
      setError(
        "Pesanan ini sudah diterima driver lain."
      );

      setBookings(latestBookings);

      return;
    }

    /*
     * Hanya pending / guide_accepted
     * yang bisa diterima.
     */
    const validStatus =
      booking.status === "pending" ||
      booking.status ===
        "guide_accepted";

    if (!validStatus) {
      setError(
        "Pesanan ini sudah tidak tersedia."
      );

      setBookings(latestBookings);

      return;
    }

    /*
     * Status setelah driver menerima.
     */
    let nextStatus:
      | "driver_accepted"
      | "confirmed" =
      "driver_accepted";

    /*
     * Paket lengkap:
     *
     * Driver + Guide
     * = confirmed
     */
    if (
      booking.service ===
      "package"
    ) {
      if (booking.guideId) {
        nextStatus = "confirmed";
      }
    }

    /*
     * Waktu penerimaan dibuat satu kali
     * agar konsisten.
     */
    const acceptedAt =
      new Date().toISOString();

    /*
     * Update booking.
     */
    updateBooking(
      booking.id,
      {
        driverId:
          latestDriver.id,

        driverAcceptedAt:
          acceptedAt,

        driver: {
          id: latestDriver.id,

          name:
            latestDriver.name,

          phone:
            latestDriver.phone,

          vehicle:
            latestDriver.vehicle,

          plateNumber:
            latestDriver.plateNumber,

          photo:
            latestDriver.photo,

          status:
            "accepted",

          acceptedAt,
        },

        status:
          nextStatus,
      }
    );

    /*
     * Driver menjadi busy.
     */
    setDriverBusy(
      latestDriver.id
    );

    /*
     * Refresh data.
     */
    setBookings(
      getBookings()
    );

    const refreshedDriver =
      getDriverById(
        latestDriver.id
      );

    if (refreshedDriver) {
      setDriver(
        refreshedDriver
      );
    }

    setSection("active");
  }

  /*
  |--------------------------------------------------------------------------
  | START TRIP
  |--------------------------------------------------------------------------
  */

  function startTrip(bookingId: string) {
    const current =
      getBookings().find(
        (booking) =>
          booking.id === bookingId
      );

    if (!current) {
      return;
    }

    if (
      current.driverId !==
      driver.id
    ) {
      return;
    }

    updateBooking(
      bookingId,
      {
        status: "ongoing",
      }
    );

    setBookings(
      getBookings()
    );
  }

  /*
  |--------------------------------------------------------------------------
  | COMPLETE BOOKING
  |--------------------------------------------------------------------------
  */

  function completeBooking(
    bookingId: string
  ) {
    const current =
      getBookings().find(
        (booking) =>
          booking.id === bookingId
      );

    if (!current) {
      return;
    }

    if (
      current.driverId !==
      driver.id
    ) {
      return;
    }

    updateBooking(
      bookingId,
      {
        status:
          "completed",
      }
    );

    /*
     * Tambah total perjalanan.
     */
    const latestDriver =
      getDriverById(
        driver.id
      );

    if (latestDriver) {
      updateDriver(
        driver.id,
        {
          status:
            latestDriver.accountStatus ===
            "approved"
              ? "available"
              : "offline",

          totalTrips:
            latestDriver.totalTrips +
            1,
        }
      );
    }

    setBookings(
      getBookings()
    );

    const refreshed =
      getDriverById(
        driver.id
      );

    if (refreshed) {
      setDriver(
        refreshed
      );
    }

    setSection(
      "completed"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RELEASE BOOKING
  |--------------------------------------------------------------------------
  */

  function releaseBooking(
    bookingId: string
  ) {
    const current =
      getBookings().find(
        (booking) =>
          booking.id === bookingId
      );

    if (!current) {
      return;
    }

    if (
      current.driverId !==
      driver.id
    ) {
      return;
    }

    /*
     * Jika guide sudah menerima,
     * status kembali guide_accepted.
     *
     * Jika belum,
     * kembali pending.
     */
    const nextStatus =
      current.guideId
        ? "guide_accepted"
        : "pending";

    updateBooking(
      bookingId,
      {
        driverId:
          undefined,

        driverAcceptedAt:
          undefined,

        driver:
          undefined,

        status:
          nextStatus,
      }
    );

    /*
     * Driver kembali available.
     */
    const latestDriver =
      getDriverById(
        driver.id
      );

    if (latestDriver) {
      updateDriver(
        driver.id,
        {
          status:
            latestDriver.accountStatus ===
            "approved"
              ? "available"
              : "offline",
        }
      );
    }

    setBookings(
      getBookings()
    );

    const refreshed =
      getDriverById(
        driver.id
      );

    if (refreshed) {
      setDriver(
        refreshed
      );
    }

    setSection("orders");
  }

  /*
  |--------------------------------------------------------------------------
  | AVAILABILITY
  |--------------------------------------------------------------------------
  */

  function changeAvailability(
    newStatus:
      | "available"
      | "offline"
  ) {
    setError("");

    const latest =
      getDriverById(
        driver.id
      );

    if (!latest) {
      return;
    }

    /*
     * Pending / rejected tidak boleh online.
     */
    if (
      latest.accountStatus !==
      "approved"
    ) {
      setError(
        "Akun belum disetujui admin. Status driver tetap offline."
      );

      setDriverOffline(
        driver.id
      );

      const refreshed =
        getDriverById(
          driver.id
        );

      if (refreshed) {
        setDriver(
          refreshed
        );
      }

      return;
    }

    /*
     * Busy tidak boleh diubah manual.
     */
    if (
      latest.status ===
      "busy"
    ) {
      setError(
        "Driver sedang menjalankan pesanan."
      );

      return;
    }

    if (
      newStatus ===
      "available"
    ) {
      setDriverAvailable(
        driver.id
      );
    } else {
      setDriverOffline(
        driver.id
      );
    }

    const refreshed =
      getDriverById(
        driver.id
      );

    if (refreshed) {
      setDriver(
        refreshed
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  function logout() {
    localStorage.removeItem(
      DRIVER_SESSION_KEY
    );

    window.location.href =
      "/driver/login";
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-100">
      {/* HEADER */}
      <header className="bg-slate-950 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setSection(
                  "dashboard"
                )
              }
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black">
                F
              </div>

              <div className="hidden sm:block text-left">
                <div className="font-black">
                  FunTravel
                </div>

                <div className="text-xs text-slate-400">
                  Driver Partner
                </div>
              </div>
            </button>

            <div className="flex items-center gap-3">
              {isApproved && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-bold">
                  ● Partner Aktif
                </span>
              )}

              {isPending && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 px-3 py-1 text-xs font-bold">
                  ● Menunggu Persetujuan
                </span>
              )}

              {isRejected && (
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-500/20 text-red-300 px-3 py-1 text-xs font-bold">
                  ● Ditolak
                </span>
              )}

              <button
                type="button"
                onClick={
                  logout
                }
                className="text-sm font-bold text-slate-300 hover:text-white"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ACCOUNT STATUS */}
        <AccountStatusCard
          driver={driver}
        />

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* NAV */}
        <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <NavButton
              active={
                section ===
                "dashboard"
              }
              onClick={() =>
                setSection(
                  "dashboard"
                )
              }
            >
              Dashboard
            </NavButton>

            <NavButton
              active={
                section ===
                "orders"
              }
              onClick={() =>
                setSection(
                  "orders"
                )
              }
            >
              Pesanan Tersedia
              {isApproved &&
                availableBookings.length >
                  0 && (
                  <span className="ml-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px]">
                    {
                      availableBookings.length
                    }
                  </span>
                )}
            </NavButton>

            <NavButton
              active={
                section ===
                "active"
              }
              onClick={() =>
                setSection(
                  "active"
                )
              }
            >
              Pesanan Saya
            </NavButton>

            <NavButton
              active={
                section ===
                "history"
              }
              onClick={() =>
                setSection(
                  "history"
                )
              }
            >
              Riwayat Penerimaan
            </NavButton>

            <NavButton
              active={
                section ===
                "completed"
              }
              onClick={() =>
                setSection(
                  "completed"
                )
              }
            >
              Pesanan Selesai
            </NavButton>

            <NavButton
              active={
                section ===
                "profile"
              }
              onClick={() =>
                setSection(
                  "profile"
                )
              }
            >
              Profile
            </NavButton>
          </div>
        </nav>

        {/* CONTENT */}

        {section === "dashboard" && (
          <DashboardSection
            driver={driver}
            availableCount={
              availableBookings.length
            }
            activeCount={
              activeBookings.length
            }
            completedCount={
              completedBookings.length
            }
            onAvailability={
              changeAvailability
            }
          />
        )}

        {section === "orders" && (
          <OrdersSection
            driver={driver}
            bookings={
              availableBookings
            }
            onAccept={
              acceptBooking
            }
          />
        )}

        {section === "active" && (
          <ActiveSection
            bookings={
              activeBookings
            }
            onStart={
              startTrip
            }
            onComplete={
              completeBooking
            }
            onRelease={
              releaseBooking
            }
          />
        )}

        {section === "history" && (
          <HistorySection
            bookings={
              historyBookings
            }
          />
        )}

        {section === "completed" && (
          <CompletedSection
            bookings={
              completedBookings
            }
          />
        )}

        {section === "profile" && (
          <ProfileSection
            driver={driver}
            onAvailability={
              changeAvailability
            }
          />
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ACCOUNT STATUS CARD
|--------------------------------------------------------------------------
*/

function AccountStatusCard({
  driver,
}: {
  driver: Driver;
}) {
  if (
    driver.accountStatus ===
    "approved"
  ) {
    return (
      <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
            ✓
          </div>

          <div>
            <h2 className="font-black text-emerald-900">
              Akun Disetujui
            </h2>

            <p className="text-sm text-emerald-700 mt-1">
              Selamat! Akun kamu
              telah disetujui admin
              dan resmi menjadi
              Partner Driver
              FunTravel.
            </p>

            <p className="text-xs text-emerald-600 mt-2">
              Aktifkan status
              <strong>
                {" "}
                Tersedia
              </strong>{" "}
              untuk menerima
              pesanan wisatawan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    driver.accountStatus ===
    "rejected"
  ) {
    return (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
            !
          </div>

          <div>
            <h2 className="font-black text-red-900">
              Pendaftaran Ditolak
            </h2>

            <p className="text-sm text-red-700 mt-1">
              Pendaftaran partner
              kamu belum dapat
              disetujui oleh admin.
            </p>

            {driver.rejectionReason && (
              <div className="mt-3 rounded-xl bg-white border border-red-200 p-3">
                <p className="text-xs font-bold text-red-800">
                  Alasan penolakan:
                </p>

                <p className="text-sm text-red-700 mt-1">
                  {
                    driver.rejectionReason
                  }
                </p>
              </div>
            )}

            <p className="text-xs text-red-600 mt-3">
              Kamu belum dapat
              menerima pesanan
              wisatawan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
          ⏳
        </div>

        <div>
          <h2 className="font-black text-amber-900">
            Menunggu Persetujuan Admin
          </h2>

          <p className="text-sm text-amber-700 mt-1">
            Pendaftaran kamu
            sudah berhasil.
            Admin FunTravel perlu
            memeriksa dan
            menyetujui akun kamu
            terlebih dahulu.
          </p>

          <p className="text-xs text-amber-600 mt-2">
            Selama status masih
            belum disetujui, kamu
            <strong>
              {" "}
              tidak dapat menerima
              pesanan wisatawan.
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| NAV BUTTON
|--------------------------------------------------------------------------
*/

function NavButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
        active
          ? "bg-slate-950 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

function DashboardSection({
  driver,
  availableCount,
  activeCount,
  completedCount,
  onAvailability,
}: {
  driver: Driver;
  availableCount: number;
  activeCount: number;
  completedCount: number;
  onAvailability: (
    status:
      | "available"
      | "offline"
  ) => void;
}) {
  const approved =
    driver.accountStatus ===
    "approved";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Halo, {driver.name} 👋
        </h1>

        <p className="text-slate-500 mt-1">
          Kelola aktivitas
          perjalanan kamu di
          FunTravel.
        </p>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Status Operasional
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-3 h-3 rounded-full ${
                  driver.status ===
                  "available"
                    ? "bg-emerald-500"
                    : driver.status ===
                        "busy"
                      ? "bg-blue-500"
                      : "bg-slate-400"
                }`}
              />

              <strong className="text-lg text-slate-900">
                {driver.status ===
                "available"
                  ? "Tersedia"
                  : driver.status ===
                      "busy"
                    ? "Sedang Bertugas"
                    : "Offline"}
              </strong>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                !approved ||
                driver.status ===
                  "busy"
              }
              onClick={() =>
                onAvailability(
                  "available"
                )
              }
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-40"
            >
              Tersedia
            </button>

            <button
              type="button"
              disabled={
                !approved ||
                driver.status ===
                  "busy"
              }
              onClick={() =>
                onAvailability(
                  "offline"
                )
              }
              className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-800 text-sm font-bold disabled:opacity-40"
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pesanan Tersedia"
          value={
            approved
              ? availableCount
              : 0
          }
          icon="📦"
        />

        <StatCard
          label="Pesanan Aktif"
          value={activeCount}
          icon="🚗"
        />

        <StatCard
          label="Pesanan Selesai"
          value={
            completedCount
          }
          icon="✓"
        />

        <StatCard
          label="Rating"
          value={
            driver.rating > 0
              ? driver.rating.toFixed(
                  1
                )
              : "-"
          }
          icon="⭐"
        />
      </div>

      {!approved && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-black text-slate-900">
            Belum Bisa Menerima
            Pesanan
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Pesanan masuk hanya akan
            tersedia setelah akun
            kamu disetujui admin dan
            status operasional diubah
            menjadi Tersedia.
          </p>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

function OrdersSection({
  driver,
  bookings,
  onAccept,
}: {
  driver: Driver;
  bookings: BookingOrder[];
  onAccept: (
    id: string
  ) => void;
}) {
  const approved =
    driver.accountStatus ===
    "approved";

  if (!approved) {
    return <LockedOrders />;
  }

  if (
    driver.status !==
    "available"
  ) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <div className="text-5xl mb-4">
          📴
        </div>

        <h2 className="text-xl font-black text-slate-900">
          Driver sedang offline
        </h2>

        <p className="text-slate-500 mt-2">
          Ubah status menjadi
          Tersedia untuk melihat
          pesanan masuk.
        </p>
      </div>
    );
  }

  if (
    bookings.length ===
    0
  ) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <div className="text-5xl mb-4">
          📭
        </div>

        <h2 className="text-xl font-black text-slate-900">
          Belum ada pesanan
        </h2>

        <p className="text-slate-500 mt-2">
          Pesanan wisatawan yang
          membutuhkan driver akan
          muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Pesanan Tersedia
        </h1>

        <p className="text-slate-500 mt-1">
          Terima pesanan yang
          sesuai dengan
          kemampuan kamu.
        </p>
      </div>

      {bookings.map(
        (booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onAccept={onAccept}
          />
        )
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOCKED ORDERS
|--------------------------------------------------------------------------
*/

function LockedOrders() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl">
        🔒
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-900">
        Pesanan Belum Tersedia
      </h2>

      <p className="max-w-xl mx-auto text-slate-500 mt-3 leading-relaxed">
        Kamu belum dapat melihat
        atau menerima pesanan
        wisatawan karena akun
        driver belum disetujui
        sebagai Partner FunTravel.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-bold text-amber-700">
        🟡 Menunggu Persetujuan
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| BOOKING CARD
|--------------------------------------------------------------------------
*/

function BookingCard({
  booking,
  onAccept,
}: {
  booking: BookingOrder;
  onAccept: (
    id: string
  ) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-black">
              {serviceLabel(
                booking.service
              )}
            </span>

            <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-bold">
              #{booking.id}
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-900">
            {booking.destinationName}
          </h2>

          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <InfoItem
              label="Pickup"
              value={booking.pickup}
            />

            <InfoItem
              label="Penumpang"
              value={`${booking.passengers} orang`}
            />

            <InfoItem
              label="Tanggal"
              value={
                booking.date ||
                "-"
              }
            />

            <InfoItem
              label="Waktu"
              value={
                booking.time ||
                "-"
              }
            />
          </div>

          {booking.distance && (
            <div className="mt-4 text-sm text-slate-500">
              🛣️ {booking.distance}
              {booking.duration &&
                ` • ${booking.duration}`}
            </div>
          )}

          {booking.notes && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <strong>
                Catatan:
              </strong>{" "}
              {booking.notes}
            </div>
          )}
        </div>

        <div className="lg:w-52">
          <p className="text-xs text-slate-500">
            Nilai perjalanan
          </p>

          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatRupiah(
              booking.totalPrice
            )}
          </p>

          <button
            type="button"
            onClick={() =>
              onAccept(
                booking.id
              )
            }
            className="w-full mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-black"
          >
            Terima Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ACTIVE
|--------------------------------------------------------------------------
*/

function ActiveSection({
  bookings,
  onStart,
  onComplete,
  onRelease,
}: {
  bookings: BookingOrder[];
  onStart: (
    id: string
  ) => void;
  onComplete: (
    id: string
  ) => void;
  onRelease: (
    id: string
  ) => void;
}) {
  if (
    bookings.length ===
    0
  ) {
    return (
      <EmptyState
        icon="🚗"
        title="Belum ada pesanan aktif"
        description="Pesanan yang kamu terima akan muncul di sini."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Pesanan Saya
        </h1>

        <p className="text-slate-500 mt-1">
          Kelola perjalanan yang
          sedang kamu tangani.
        </p>
      </div>

      {bookings.map(
        (booking) => (
          <ActiveBookingCard
            key={
              booking.id
            }
            booking={
              booking
            }
            onStart={
              onStart
            }
            onComplete={
              onComplete
            }
            onRelease={
              onRelease
            }
          />
        )
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ACTIVE CARD
|--------------------------------------------------------------------------
*/

function ActiveBookingCard({
  booking,
  onStart,
  onComplete,
  onRelease,
}: {
  booking: BookingOrder;
  onStart: (
    id: string
  ) => void;
  onComplete: (
    id: string
  ) => void;
  onRelease: (
    id: string
  ) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col lg:flex-row justify-between gap-5">
        <div>
          <div className="flex gap-2 flex-wrap">
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold">
              {statusLabel(
                booking.status
              )}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {serviceLabel(
                booking.service
              )}
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-900 mt-3">
            {booking.destinationName}
          </h2>

          <div className="mt-3 space-y-2 text-sm">
            <p>
              <strong>
                Penumpang:
              </strong>{" "}
              {booking.name} •{" "}
              {booking.passengers}{" "}
              orang
            </p>

            <p>
              <strong>
                Pickup:
              </strong>{" "}
              {booking.pickup}
            </p>

            <p>
              <strong>
                WhatsApp:
              </strong>{" "}
              {booking.phone}
            </p>

            {booking.guide && (
              <p>
                <strong>
                  Guide:
                </strong>{" "}
                {booking.guide.name}
              </p>
            )}
          </div>
        </div>

        <div className="lg:w-56">
          <p className="text-2xl font-black">
            {formatRupiah(
              booking.totalPrice
            )}
          </p>

          {(booking.status ===
            "driver_accepted" ||
            booking.status ===
              "confirmed") && (
            <button
              type="button"
              onClick={() =>
                onStart(
                  booking.id
                )
              }
              className="w-full mt-4 rounded-xl bg-blue-600 text-white py-3 font-black"
            >
              Mulai Perjalanan
            </button>
          )}

          {booking.status ===
            "ongoing" && (
            <button
              type="button"
              onClick={() =>
                onComplete(
                  booking.id
                )
              }
              className="w-full mt-4 rounded-xl bg-emerald-600 text-white py-3 font-black"
            >
              Selesaikan Perjalanan
            </button>
          )}

          {booking.status !==
            "ongoing" && (
            <button
              type="button"
              onClick={() =>
                onRelease(
                  booking.id
                )
              }
              className="w-full mt-2 rounded-xl bg-slate-100 text-slate-700 py-3 font-bold"
            >
              Lepaskan Pesanan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| HISTORY
|--------------------------------------------------------------------------
*/

function HistorySection({
  bookings,
}: {
  bookings: BookingOrder[];
}) {
  if (
    bookings.length ===
    0
  ) {
    return (
      <EmptyState
        icon="📋"
        title="Belum ada riwayat"
        description="Pesanan yang kamu terima akan tercatat di sini."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Riwayat Penerimaan
        </h1>

        <p className="text-slate-500 mt-1">
          Semua pesanan yang
          pernah kamu terima.
        </p>
      </div>

      {bookings.map(
        (booking) => (
          <HistoryCard
            key={
              booking.id
            }
            booking={
              booking
            }
          />
        )
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| HISTORY CARD
|--------------------------------------------------------------------------
*/

function HistoryCard({
  booking,
}: {
  booking: BookingOrder;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex justify-between gap-4">
        <div>
          <div className="flex gap-2 flex-wrap">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
              {statusLabel(
                booking.status
              )}
            </span>

            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold">
              {serviceLabel(
                booking.service
              )}
            </span>
          </div>

          <h3 className="font-black text-lg mt-3">
            {booking.destinationName}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {formatDate(
              booking.createdAt
            )}
          </p>
        </div>

        <div className="text-right">
          <p className="font-black">
            {formatRupiah(
              booking.totalPrice
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMPLETED
|--------------------------------------------------------------------------
*/

function CompletedSection({
  bookings,
}: {
  bookings: BookingOrder[];
}) {
  if (
    bookings.length ===
    0
  ) {
    return (
      <EmptyState
        icon="✓"
        title="Belum ada perjalanan selesai"
        description="Perjalanan yang sudah selesai akan muncul di sini."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Pesanan Selesai
        </h1>

        <p className="text-slate-500 mt-1">
          Daftar perjalanan yang
          sudah kamu selesaikan.
        </p>
      </div>

      {bookings.map(
        (booking) => (
          <CompletedCard
            key={
              booking.id
            }
            booking={
              booking
            }
          />
        )
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMPLETED CARD
|--------------------------------------------------------------------------
*/

function CompletedCard({
  booking,
}: {
  booking: BookingOrder;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-black">
            ✓ Selesai
          </span>

          <h3 className="text-lg font-black mt-3">
            {booking.destinationName}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Penumpang:{" "}
            {booking.name}
          </p>

          <p className="text-sm text-slate-500">
            {formatDate(
              booking.createdAt
            )}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xl font-black">
            {formatRupiah(
              booking.totalPrice
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

function ProfileSection({
  driver,
  onAvailability,
}: {
  driver: Driver;
  onAvailability: (
    status:
      | "available"
      | "offline"
  ) => void;
}) {
  const approved =
    driver.accountStatus ===
    "approved";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Profile Driver
        </h1>

        <p className="text-slate-500 mt-1">
          Informasi akun dan
          kendaraan kamu.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center text-4xl">
            {driver.photo ? (
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-full h-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900">
              {driver.name}
            </h2>

            <p className="text-slate-500 mt-1">
              {driver.phone}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                {driver.vehicle}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                {driver.plateNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Rating"
          value={
            driver.rating
              ? driver.rating.toFixed(
                  1
                )
              : "-"
          }
          icon="⭐"
        />

        <StatCard
          label="Total Perjalanan"
          value={
            driver.totalTrips
          }
          icon="🚗"
        />

        <StatCard
          label="Status Akun"
          value={
            driver.accountStatus ===
            "approved"
              ? "Disetujui"
              : driver.accountStatus ===
                  "pending"
                ? "Belum"
                : "Ditolak"
          }
          icon={
            driver.accountStatus ===
            "approved"
              ? "✓"
              : driver.accountStatus ===
                  "pending"
                ? "⏳"
                : "!"
          }
        />
      </div>

      {approved && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-black text-lg">
            Status Operasional
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Tentukan apakah kamu
            sedang siap menerima
            pesanan.
          </p>

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              disabled={
                driver.status ===
                "busy"
              }
              onClick={() =>
                onAvailability(
                  "available"
                )
              }
              className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-bold disabled:opacity-40"
            >
              Tersedia
            </button>

            <button
              type="button"
              disabled={
                driver.status ===
                "busy"
              }
              onClick={() =>
                onAvailability(
                  "offline"
                )
              }
              className="rounded-xl bg-slate-200 text-slate-800 px-5 py-3 font-bold disabled:opacity-40"
            >
              Offline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value:
    | string
    | number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {label}
        </span>

        <span className="text-xl">
          {icon}
        </span>
      </div>

      <div className="text-2xl font-black text-slate-900 mt-2">
        {value}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-800 mt-1">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
      <div className="text-5xl mb-4">
        {icon}
      </div>

      <h2 className="text-xl font-black text-slate-900">
        {title}
      </h2>

      <p className="text-slate-500 mt-2">
        {description}
      </p>
    </div>
  );
}