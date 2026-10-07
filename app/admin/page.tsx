"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CustomerUser,
  getUsers,
  deleteUser,
} from "@/lib/users";

import {
  Driver,
  getDrivers,
  approveDriver,
  rejectDriver,
  resetDriverApproval,
} from "@/lib/drivers";

import {
  Guide,
  getGuides,
  approveGuide,
  rejectGuide,
  resetGuideApproval,
} from "@/lib/guides";

import {
  BookingOrder,
  getBookings,
  formatRupiah,
} from "@/lib/bookings";

/* ============================================================
   TYPES
============================================================ */

type AdminTab =
  | "dashboard"
  | "customers"
  | "drivers"
  | "guides"
  | "orders";

/* ============================================================
   ADMIN LOGIN
============================================================ */

const ADMIN_STORAGE_KEY =
  "funtravel_admin_logged_in";

/*
 * Kredensial Admin sementara untuk prototype.
 *
 * Nanti bisa kita pindahkan ke sistem database/auth
 * tanpa mengubah halaman dashboard ini.
 */
const ADMIN_EMAIL =
  "admin@funtravel.com";

const ADMIN_PASSWORD =
  "admin123";

/* ============================================================
   HELPERS
============================================================ */

function formatDate(date?: string) {
  if (!date) {
    return "-";
  }

  try {
    return new Date(date).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return date;
  }
}

function statusLabel(
  status: string
) {
  const value =
    String(status).toLowerCase();

  const labels: Record<
    string,
    string
  > = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",

    available: "Available",
    busy: "Busy",
    offline: "Offline",

    confirmed: "Confirmed",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",

    driver_accepted:
      "Driver Accepted",

    guide_accepted:
      "Guide Accepted",
  };

  return (
    labels[value] ||
    status
  );
}

function statusClass(
  status: string
) {
  const value =
    String(status).toLowerCase();

  if (
    value === "approved" ||
    value === "available" ||
    value === "confirmed" ||
    value === "completed"
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    value === "pending" ||
    value === "busy" ||
    value === "ongoing" ||
    value === "driver_accepted" ||
    value === "guide_accepted"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (
    value === "rejected" ||
    value === "cancelled" ||
    value === "offline"
  ) {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-600";
}

function isActiveOrder(
  order: BookingOrder
) {
  const status =
    String(
      order.status || ""
    ).toLowerCase();

  return (
    status === "confirmed" ||
    status === "ongoing" ||
    status ===
      "driver_accepted" ||
    status ===
      "guide_accepted"
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function AdminPage() {
  /* ==========================================================
     LOGIN
  ========================================================== */

  const [
    isLoggedIn,
    setIsLoggedIn,
  ] = useState(false);

  const [
    loginEmail,
    setLoginEmail,
  ] = useState("");

  const [
    loginPassword,
    setLoginPassword,
  ] = useState("");

  const [
    loginError,
    setLoginError,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  /* ==========================================================
     ADMIN DATA
  ========================================================== */

  const [
    activeTab,
    setActiveTab,
  ] = useState<AdminTab>(
    "dashboard"
  );

  const [
    customers,
    setCustomers,
  ] = useState<
    CustomerUser[]
  >([]);

  const [
    drivers,
    setDrivers,
  ] = useState<Driver[]>([]);

  const [
    guides,
    setGuides,
  ] = useState<Guide[]>([]);

  const [
    orders,
    setOrders,
  ] = useState<
    BookingOrder[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    lastRefresh,
    setLastRefresh,
  ] = useState<Date | null>(
    null
  );

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  /* ==========================================================
     CUSTOMER DETAIL
  ========================================================== */

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<
    CustomerUser | null
  >(null);

  const [
    customerToDelete,
    setCustomerToDelete,
  ] = useState<
    CustomerUser | null
  >(null);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  /* ==========================================================
     DRIVER DETAIL
  ========================================================== */

  const [
    selectedDriver,
    setSelectedDriver,
  ] = useState<
    Driver | null
  >(null);

  /* ==========================================================
     GUIDE DETAIL
  ========================================================== */

  const [
    selectedGuide,
    setSelectedGuide,
  ] = useState<
    Guide | null
  >(null);

  /* ==========================================================
     ORDER DETAIL
  ========================================================== */

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<
    BookingOrder | null
  >(null);

  /* ==========================================================
     CHECK LOGIN
  ========================================================== */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const loggedIn =
      localStorage.getItem(
        ADMIN_STORAGE_KEY
      ) === "true";

    setIsLoggedIn(
      loggedIn
    );
  }, []);

  /* ==========================================================
     LOAD ALL DATA
  ========================================================== */

  function loadAllData() {
    setCustomers(
      getUsers()
    );

    setDrivers(
      getDrivers()
    );

    setGuides(
      getGuides()
    );

    setOrders(
      getBookings()
    );

    setLastRefresh(
      new Date()
    );
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    loadAllData();

    const interval =
      window.setInterval(
        () => {
          loadAllData();
        },
        3000
      );

    const handleStorage =
      () => {
        loadAllData();
      };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.clearInterval(
        interval
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [isLoggedIn]);

  /* ==========================================================
     LOGIN
  ========================================================== */

  function handleLogin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoginError("");

    if (
      loginEmail.trim().toLowerCase() !==
        ADMIN_EMAIL ||
      loginPassword !==
        ADMIN_PASSWORD
    ) {
      setLoginError(
        "Email atau password Admin salah."
      );

      return;
    }

    localStorage.setItem(
      ADMIN_STORAGE_KEY,
      "true"
    );

    setIsLoggedIn(true);

    setLoginEmail("");
    setLoginPassword("");
  }

  /* ==========================================================
     LOGOUT
  ========================================================== */

  function handleLogout() {
    localStorage.removeItem(
      ADMIN_STORAGE_KEY
    );

    setIsLoggedIn(false);

    setActiveTab(
      "dashboard"
    );
  }

  /* ==========================================================
     FILTER CUSTOMER
  ========================================================== */

  const filteredCustomers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return customers;
      }

      return customers.filter(
        (customer) =>
          customer.name
            .toLowerCase()
            .includes(keyword) ||
          customer.email
            .toLowerCase()
            .includes(keyword) ||
          customer.id
            .toLowerCase()
            .includes(keyword)
      );
    }, [
      customers,
      search,
    ]);

  /* ==========================================================
     DRIVER STATISTICS
  ========================================================== */

  const pendingDrivers =
    useMemo(
      () =>
        drivers.filter(
          (driver) =>
            driver.accountStatus ===
            "pending"
        ).length,
      [drivers]
    );

  const approvedDrivers =
    useMemo(
      () =>
        drivers.filter(
          (driver) =>
            driver.accountStatus ===
            "approved"
        ).length,
      [drivers]
    );

  const rejectedDrivers =
    useMemo(
      () =>
        drivers.filter(
          (driver) =>
            driver.accountStatus ===
            "rejected"
        ).length,
      [drivers]
    );

  const availableDrivers =
    useMemo(
      () =>
        drivers.filter(
          (driver) =>
            driver.accountStatus ===
              "approved" &&
            driver.status ===
              "available"
        ).length,
      [drivers]
    );

  const busyDrivers =
    useMemo(
      () =>
        drivers.filter(
          (driver) =>
            driver.accountStatus ===
              "approved" &&
            driver.status ===
              "busy"
        ).length,
      [drivers]
    );

  const offlineDrivers =
    useMemo(
      () =>
        drivers.filter(
          (driver) =>
            driver.status ===
            "offline"
        ).length,
      [drivers]
    );

  /* ==========================================================
     GUIDE STATISTICS
  ========================================================== */

  const pendingGuides =
    useMemo(
      () =>
        guides.filter(
          (guide) =>
            guide.accountStatus ===
            "pending"
        ).length,
      [guides]
    );

  const approvedGuides =
    useMemo(
      () =>
        guides.filter(
          (guide) =>
            guide.accountStatus ===
            "approved"
        ).length,
      [guides]
    );

  const rejectedGuides =
    useMemo(
      () =>
        guides.filter(
          (guide) =>
            guide.accountStatus ===
            "rejected"
        ).length,
      [guides]
    );

  const availableGuides =
    useMemo(
      () =>
        guides.filter(
          (guide) =>
            guide.accountStatus ===
              "approved" &&
            guide.status ===
              "available"
        ).length,
      [guides]
    );

  const busyGuides =
    useMemo(
      () =>
        guides.filter(
          (guide) =>
            guide.accountStatus ===
              "approved" &&
            guide.status ===
              "busy"
        ).length,
      [guides]
    );

  const offlineGuides =
    useMemo(
      () =>
        guides.filter(
          (guide) =>
            guide.status ===
            "offline"
        ).length,
      [guides]
    );

  /* ==========================================================
     ORDER STATISTICS
  ========================================================== */

  const pendingOrders =
    useMemo(
      () =>
        orders.filter(
          (order) =>
            order.status ===
            "pending"
        ).length,
      [orders]
    );

  const activeOrders =
    useMemo(
      () =>
        orders.filter(
          isActiveOrder
        ).length,
      [orders]
    );

  const completedOrders =
    useMemo(
      () =>
        orders.filter(
          (order) =>
            order.status ===
            "completed"
        ).length,
      [orders]
    );

  const cancelledOrders =
    useMemo(
      () =>
        orders.filter(
          (order) =>
            order.status ===
            "cancelled"
        ).length,
      [orders]
    );

  /* ==========================================================
     CUSTOMER ACTIVITY
  ========================================================== */

  function getCustomerActivity(
    customer: CustomerUser
  ) {
    const customerOrders =
      orders.filter(
        (order) =>
          order.userId ===
            customer.id ||
          order.userEmail
            ?.trim()
            .toLowerCase() ===
            customer.email
              .trim()
              .toLowerCase()
      );

    const hasActiveOrder =
      customerOrders.some(
        isActiveOrder
      );

    if (hasActiveOrder) {
      return "Ada pesanan aktif";
    }

    if (
      customerOrders.length >
      0
    ) {
      return "Pernah memesan";
    }

    return "Belum ada pesanan";
  }

  /* ==========================================================
     CUSTOMER DELETE
  ========================================================== */

  function handleDeleteClick(
    customer: CustomerUser
  ) {
    setCustomerToDelete(
      customer
    );

    setShowDeleteModal(
      true
    );
  }

  function confirmDelete() {
    if (
      !customerToDelete
    ) {
      return;
    }

    const deleted =
      deleteUser(
        customerToDelete.id
      );

    if (!deleted) {
      alert(
        "Customer tidak ditemukan atau gagal dihapus."
      );

      return;
    }

    setShowDeleteModal(
      false
    );

    setCustomerToDelete(
      null
    );

    setSelectedCustomer(
      null
    );

    loadAllData();
  }

  /* ==========================================================
     DRIVER APPROVAL
  ========================================================== */

  function handleApproveDriver(
    driver: Driver
  ) {
    const confirmed =
      window.confirm(
        `Approve driver ${driver.name}?`
      );

    if (!confirmed) {
      return;
    }

    approveDriver(
      driver.id,
      "ADMIN"
    );

    loadAllData();
  }

  function handleRejectDriver(
    driver: Driver
  ) {
    const reason =
      window.prompt(
        `Alasan menolak driver ${driver.name}:`,
        ""
      );

    if (
      reason === null
    ) {
      return;
    }

    rejectDriver(
      driver.id,
      reason.trim()
    );

    loadAllData();
  }

  function handleResetDriver(
    driver: Driver
  ) {
    const confirmed =
      window.confirm(
        `Kembalikan ${driver.name} menjadi Pending?`
      );

    if (!confirmed) {
      return;
    }

    resetDriverApproval(
      driver.id
    );

    loadAllData();
  }

  /* ==========================================================
     GUIDE APPROVAL
  ========================================================== */

  function handleApproveGuide(
    guide: Guide
  ) {
    const confirmed =
      window.confirm(
        `Approve guide ${guide.name}?`
      );

    if (!confirmed) {
      return;
    }

    approveGuide(
      guide.id,
      "ADMIN"
    );

    loadAllData();
  }

  function handleRejectGuide(
    guide: Guide
  ) {
    const reason =
      window.prompt(
        `Alasan menolak guide ${guide.name}:`,
        ""
      );

    if (
      reason === null
    ) {
      return;
    }

    rejectGuide(
      guide.id,
      reason.trim()
    );

    loadAllData();
  }

  function handleResetGuide(
    guide: Guide
  ) {
    const confirmed =
      window.confirm(
        `Kembalikan ${guide.name} menjadi Pending?`
      );

    if (!confirmed) {
      return;
    }

    resetGuideApproval(
      guide.id
    );

    loadAllData();
  }

  /* ==========================================================
     SIDEBAR
  ========================================================== */

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function changeTab(
    tab: AdminTab
  ) {
    setActiveTab(tab);
    setSearch("");
    closeSidebar();
  }

  const menuItems: {
    id: AdminTab;
    label: string;
    icon: string;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      id: "customers",
      label: "Customer",
      icon: "👤",
    },
    {
      id: "drivers",
      label: "Driver",
      icon: "🚗",
    },
    {
      id: "guides",
      label: "Guide",
      icon: "🧑‍🏫",
    },
    {
      id: "orders",
      label: "Pesanan",
      icon: "📦",
    },
  ];

  /* ==========================================================
     LOGIN SCREEN
  ========================================================== */

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="text-3xl font-black text-slate-900">
              FunTravel
            </div>

            <div className="mt-1 text-sm font-bold uppercase tracking-widest text-blue-600">
              Admin Panel
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                🔐
              </div>

              <h1 className="mt-5 text-2xl font-black text-slate-900">
                Login Admin
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Masuk untuk mengelola dan
                memantau sistem FunTravel.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                {loginError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Admin
                </label>

                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) =>
                    setLoginEmail(
                      event.target.value
                    )
                  }
                  placeholder="admin@funtravel.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      loginPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setLoginPassword(
                        event.target
                          .value
                      )
                    }
                    placeholder="Masukkan password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-200"
                  >
                    {showPassword
                      ? "Sembunyikan"
                      : "Lihat"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                Masuk ke Admin
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold text-slate-700">
                Login prototype
              </div>

              <div className="mt-2 text-xs leading-5 text-slate-500">
                Email: admin@funtravel.com
                <br />
                Password: admin123
              </div>
            </div>

            <a
              href="/"
              className="mt-5 block text-center text-sm font-bold text-slate-500 hover:text-blue-600"
            >
              ← Kembali ke Website
            </a>
          </form>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ADMIN PANEL
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={
            closeSidebar
          }
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">
              FunTravel
            </div>

            <div className="mt-0.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              Admin Panel
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Management
          </div>

          <nav className="space-y-1">
            {menuItems.map(
              (item) => {
                const active =
                  activeTab ===
                  item.id;

                return (
                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      changeTab(
                        item.id
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="text-lg">
                      {
                        item.icon
                      }
                    </span>

                    <span>
                      {
                        item.label
                      }
                    </span>

                    {item.id ===
                      "customers" && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {
                          customers.length
                        }
                      </span>
                    )}

                    {item.id ===
                      "drivers" &&
                      pendingDrivers >
                        0 && (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {
                            pendingDrivers
                          }
                        </span>
                      )}

                    {item.id ===
                      "guides" &&
                      pendingGuides >
                        0 && (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {
                            pendingGuides
                          }
                        </span>
                      )}

                    {item.id ===
                      "orders" &&
                      pendingOrders >
                        0 && (
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {
                            pendingOrders
                          }
                        </span>
                      )}
                  </button>
                );
              }
            )}
          </nav>

          <div className="mt-8 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold text-slate-700">
                Sistem Aktif
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Data diperbarui
              otomatis setiap
              3 detik.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <span>↪</span>
            Keluar Admin
          </button>

          <a
            href="/"
            className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <span>←</span>
            Kembali ke Website
          </a>
        </div>
      </aside>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="lg:pl-72">
        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(
                    true
                  )
                }
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Buka menu"
              >
                ☰
              </button>

              <div>
                <h1 className="text-lg font-black sm:text-xl">
                  {activeTab ===
                    "dashboard" &&
                    "Dashboard Admin"}

                  {activeTab ===
                    "customers" &&
                    "Data Customer"}

                  {activeTab ===
                    "drivers" &&
                    "Daftar Driver"}

                  {activeTab ===
                    "guides" &&
                    "Daftar Guide"}

                  {activeTab ===
                    "orders" &&
                    "Semua Pesanan"}
                </h1>

                <p className="hidden text-xs text-slate-500 sm:block">
                  Kelola dan pantau
                  sistem FunTravel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastRefresh && (
                <div className="hidden text-right sm:block">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Update terakhir
                  </div>

                  <div className="mt-0.5 text-xs font-semibold text-slate-600">
                    {lastRefresh.toLocaleTimeString(
                      "id-ID"
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={
                  loadAllData
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                ↻
                <span className="hidden sm:inline">
                  {" "}
                  Refresh
                </span>
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* ==================================================
              DASHBOARD
          ================================================== */}

          {activeTab ===
            "dashboard" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-black">
                  Ringkasan Sistem
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Pantau customer,
                  driver, guide,
                  dan pesanan dari
                  satu halaman.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  icon="👥"
                  label="Total Customer"
                  value={
                    customers.length
                  }
                  description="Customer terdaftar"
                />

                <StatCard
                  icon="🚗"
                  label="Total Driver"
                  value={
                    drivers.length
                  }
                  description={`${approvedDrivers} approved`}
                />

                <StatCard
                  icon="🧑‍🏫"
                  label="Total Guide"
                  value={
                    guides.length
                  }
                  description={`${approvedGuides} approved`}
                />

                <StatCard
                  icon="📦"
                  label="Total Pesanan"
                  value={
                    orders.length
                  }
                  description={`${pendingOrders} pending`}
                />

                <StatCard
                  icon="🔄"
                  label="Pesanan Aktif"
                  value={
                    activeOrders
                  }
                  description="Sedang berjalan"
                />
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* DRIVER */}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black">
                        🚗 Driver
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Status verifikasi
                        dan aktivitas.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        changeTab(
                          "drivers"
                        )
                      }
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Lihat →
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniStatus
                      label="Pending"
                      value={
                        pendingDrivers
                      }
                      className="amber"
                    />

                    <MiniStatus
                      label="Approved"
                      value={
                        approvedDrivers
                      }
                      className="green"
                    />

                    <MiniStatus
                      label="Busy"
                      value={
                        busyDrivers
                      }
                      className="blue"
                    />

                    <MiniStatus
                      label="Offline"
                      value={
                        offlineDrivers
                      }
                      className="slate"
                    />
                  </div>

                  {pendingDrivers >
                    0 && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="text-sm font-black text-amber-800">
                        ⏳ Perlu
                        perhatian
                      </div>

                      <div className="mt-1 text-xs leading-5 text-amber-700">
                        Ada{" "}
                        {
                          pendingDrivers
                        }{" "}
                        driver yang
                        menunggu
                        verifikasi
                        Admin.
                      </div>
                    </div>
                  )}
                </div>

                {/* GUIDE */}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black">
                        🧑‍🏫 Guide
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Status verifikasi
                        dan aktivitas.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        changeTab(
                          "guides"
                        )
                      }
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Lihat →
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniStatus
                      label="Pending"
                      value={
                        pendingGuides
                      }
                      className="amber"
                    />

                    <MiniStatus
                      label="Approved"
                      value={
                        approvedGuides
                      }
                      className="green"
                    />

                    <MiniStatus
                      label="Busy"
                      value={
                        busyGuides
                      }
                      className="blue"
                    />

                    <MiniStatus
                      label="Offline"
                      value={
                        offlineGuides
                      }
                      className="slate"
                    />
                  </div>

                  {pendingGuides >
                    0 && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="text-sm font-black text-amber-800">
                        ⏳ Perlu
                        perhatian
                      </div>

                      <div className="mt-1 text-xs leading-5 text-amber-700">
                        Ada{" "}
                        {
                          pendingGuides
                        }{" "}
                        guide yang
                        menunggu
                        verifikasi
                        Admin.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ORDER STATUS */}

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black">
                      📦 Status Pesanan
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Ringkasan seluruh
                      perjalanan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      changeTab(
                        "orders"
                      )
                    }
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Lihat Semua →
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <MiniStatus
                    label="Pending"
                    value={
                      pendingOrders
                    }
                    className="amber"
                  />

                  <MiniStatus
                    label="Aktif"
                    value={
                      activeOrders
                    }
                    className="blue"
                  />

                  <MiniStatus
                    label="Selesai"
                    value={
                      completedOrders
                    }
                    className="green"
                  />

                  <MiniStatus
                    label="Dibatalkan"
                    value={
                      cancelledOrders
                    }
                    className="red"
                  />
                </div>
              </div>

              {/* ADMIN ROLE */}

              <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    🔐
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      Hak Akses Admin
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Admin bertugas
                      melakukan
                      verifikasi
                      Driver/Guide dan
                      memantau sistem.
                    </p>

                    <div className="mt-4 rounded-2xl bg-white/70 p-4">
                      <div className="text-xs font-black text-slate-700">
                        🚫 Admin tidak
                        melakukan
                        assignment.
                      </div>

                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        Driver dan Guide
                        yang sudah
                        Approved akan
                        menerima order
                        sendiri.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ==================================================
              CUSTOMER
          ================================================== */}

          {activeTab ===
            "customers" && (
            <section>
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    Data Customer
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Semua customer yang
                    terdaftar di
                    FunTravel.
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 px-5 py-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-500">
                    Total Customer
                  </div>

                  <div className="mt-1 text-2xl font-black text-blue-700">
                    {
                      customers.length
                    }
                  </div>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    🔍
                  </span>

                  <input
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    type="text"
                    placeholder="Cari nama, email, atau ID customer..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {filteredCustomers.length ===
                0 ? (
                  <EmptyState
                    icon="👤"
                    title="Belum ada customer"
                    description="Customer akan muncul setelah melakukan registrasi."
                  />
                ) : (
                  <>
                    {/* DESKTOP */}

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Customer
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Email
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              ID Customer
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Aktivitas
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-500">
                              Terdaftar
                            </th>

                            <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {filteredCustomers.map(
                            (
                              customer
                            ) => (
                              <tr
                                key={
                                  customer.id
                                }
                                className="transition hover:bg-slate-50"
                              >
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
                                      {customer.name
                                        .charAt(
                                          0
                                        )
                                        .toUpperCase()}
                                    </div>

                                    <div className="font-bold">
                                      {
                                        customer.name
                                      }
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-5 text-sm text-slate-600">
                                  {
                                    customer.email
                                  }
                                </td>

                                <td className="px-6 py-5 text-xs text-slate-400">
                                  {
                                    customer.id
                                  }
                                </td>

                                <td className="px-6 py-5">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                      getCustomerActivity(
                                        customer
                                      ) ===
                                      "Ada pesanan aktif"
                                        ? "bg-blue-100 text-blue-700"
                                        : getCustomerActivity(
                                              customer
                                            ) ===
                                            "Pernah memesan"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {getCustomerActivity(
                                      customer
                                    )}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-sm text-slate-500">
                                  {formatDate(
                                    customer.createdAt
                                  )}
                                </td>

                                <td className="px-6 py-5">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedCustomer(
                                          customer
                                        )
                                      }
                                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                                    >
                                      Detail
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteClick(
                                          customer
                                        )
                                      }
                                      className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE */}

                    <div className="divide-y divide-slate-100 md:hidden">
                      {filteredCustomers.map(
                        (
                          customer
                        ) => (
                          <div
                            key={
                              customer.id
                            }
                            className="p-5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">
                                {customer.name
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="font-bold">
                                  {
                                    customer.name
                                  }
                                </div>

                                <div className="mt-1 break-all text-xs text-slate-500">
                                  {
                                    customer.email
                                  }
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 text-xs text-slate-400">
                              ID:{" "}
                              {
                                customer.id
                              }
                            </div>

                            <div className="mt-2">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                {
                                  getCustomerActivity(
                                    customer
                                  )
                                }
                              </span>
                            </div>

                            <div className="mt-3 text-xs text-slate-400">
                              Terdaftar:{" "}
                              {formatDate(
                                customer.createdAt
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedCustomer(
                                    customer
                                  )
                                }
                                className="rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700"
                              >
                                Detail
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteClick(
                                    customer
                                  )
                                }
                                className="rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-bold text-white"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              DRIVER
          ================================================== */}

          {activeTab ===
            "drivers" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-black">
                  Daftar Driver
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Verifikasi driver dan
                  pantau status
                  operasional.
                </p>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon="🚗"
                  label="Total"
                  value={
                    drivers.length
                  }
                  description="Driver terdaftar"
                />

                <StatCard
                  icon="⏳"
                  label="Pending"
                  value={
                    pendingDrivers
                  }
                  description="Menunggu verifikasi"
                />

                <StatCard
                  icon="🟢"
                  label="Available"
                  value={
                    availableDrivers
                  }
                  description="Siap menerima order"
                />

                <StatCard
                  icon="🔴"
                  label="Rejected"
                  value={
                    rejectedDrivers
                  }
                  description="Ditolak Admin"
                />
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {drivers.length ===
                0 ? (
                  <EmptyState
                    icon="🚗"
                    title="Belum ada driver"
                    description="Data driver akan muncul setelah driver mendaftar."
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {drivers.map(
                      (driver) => (
                        <div
                          key={
                            driver.id
                          }
                          className="p-5 sm:p-6"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-2xl">
                                {driver.photo ? (
                                  <img
                                    src={
                                      driver.photo
                                    }
                                    alt={
                                      driver.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  "🚗"
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-black">
                                    {
                                      driver.name
                                    }
                                  </h3>

                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                    {
                                      driver.id
                                    }
                                  </span>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    driver.phone
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    driver.vehicle
                                  }{" "}
                                  •{" "}
                                  {
                                    driver.plateNumber
                                  }
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                  <span>
                                    ⭐{" "}
                                    {
                                      driver.rating
                                    }
                                  </span>

                                  <span>
                                    •
                                  </span>

                                  <span>
                                    {
                                      driver.totalTrips
                                    }{" "}
                                    perjalanan
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 xl:items-end">
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                    driver.accountStatus
                                  )}`}
                                >
                                  Approval:{" "}
                                  {
                                    statusLabel(
                                      driver.accountStatus
                                    )
                                  }
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                    driver.status
                                  )}`}
                                >
                                  Status:{" "}
                                  {
                                    statusLabel(
                                      driver.status
                                    )
                                  }
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {driver.accountStatus ===
                                  "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleApproveDriver(
                                          driver
                                        )
                                      }
                                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700"
                                    >
                                      ✓ Approve
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRejectDriver(
                                          driver
                                        )
                                      }
                                      className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-700"
                                    >
                                      ✕ Reject
                                    </button>
                                  </>
                                )}

                                {driver.accountStatus ===
                                  "rejected" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleResetDriver(
                                        driver
                                      )
                                    }
                                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-white hover:bg-amber-600"
                                  >
                                    ↻ Kembali Pending
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedDriver(
                                      driver
                                    )
                                  }
                                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200"
                                >
                                  Detail
                                </button>
                              </div>
                            </div>
                          </div>

                          {driver.accountStatus ===
                            "rejected" &&
                            driver.rejectionReason && (
                              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                                <div className="text-xs font-black text-rose-700">
                                  Alasan
                                  penolakan
                                </div>

                                <div className="mt-1 text-xs leading-5 text-rose-600">
                                  {
                                    driver.rejectionReason
                                  }
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              GUIDE
          ================================================== */}

          {activeTab ===
            "guides" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-black">
                  Daftar Guide
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Verifikasi guide dan
                  pantau status
                  operasional.
                </p>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon="🧑‍🏫"
                  label="Total"
                  value={
                    guides.length
                  }
                  description="Guide terdaftar"
                />

                <StatCard
                  icon="⏳"
                  label="Pending"
                  value={
                    pendingGuides
                  }
                  description="Menunggu verifikasi"
                />

                <StatCard
                  icon="🟢"
                  label="Available"
                  value={
                    availableGuides
                  }
                  description="Siap menerima order"
                />

                <StatCard
                  icon="🔴"
                  label="Rejected"
                  value={
                    rejectedGuides
                  }
                  description="Ditolak Admin"
                />
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {guides.length ===
                0 ? (
                  <EmptyState
                    icon="🧑‍🏫"
                    title="Belum ada guide"
                    description="Data guide akan muncul setelah guide mendaftar."
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {guides.map(
                      (guide) => (
                        <div
                          key={
                            guide.id
                          }
                          className="p-5 sm:p-6"
                        >
                          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-100 text-2xl">
                                {guide.photo ? (
                                  <img
                                    src={
                                      guide.photo
                                    }
                                    alt={
                                      guide.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  "🧑‍🏫"
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-black">
                                    {
                                      guide.name
                                    }
                                  </h3>

                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                    {
                                      guide.id
                                    }
                                  </span>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    guide.phone
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {guide.languages.join(
                                    ", "
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    guide.specialties.join(
                                      ", "
                                    )
                                  }
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                  <span>
                                    ⭐{" "}
                                    {
                                      guide.rating
                                    }
                                  </span>

                                  <span>
                                    •
                                  </span>

                                  <span>
                                    {
                                      guide.totalTrips
                                    }{" "}
                                    perjalanan
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 xl:items-end">
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                    guide.accountStatus
                                  )}`}
                                >
                                  Approval:{" "}
                                  {
                                    statusLabel(
                                      guide.accountStatus
                                    )
                                  }
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                    guide.status
                                  )}`}
                                >
                                  Status:{" "}
                                  {
                                    statusLabel(
                                      guide.status
                                    )
                                  }
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {guide.accountStatus ===
                                  "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleApproveGuide(
                                          guide
                                        )
                                      }
                                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700"
                                    >
                                      ✓ Approve
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRejectGuide(
                                          guide
                                        )
                                      }
                                      className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-700"
                                    >
                                      ✕ Reject
                                    </button>
                                  </>
                                )}

                                {guide.accountStatus ===
                                  "rejected" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleResetGuide(
                                        guide
                                      )
                                    }
                                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-white hover:bg-amber-600"
                                  >
                                    ↻ Kembali Pending
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedGuide(
                                      guide
                                    )
                                  }
                                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200"
                                >
                                  Detail
                                </button>
                              </div>
                            </div>
                          </div>

                          {guide.accountStatus ===
                            "rejected" &&
                            guide.rejectionReason && (
                              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                                <div className="text-xs font-black text-rose-700">
                                  Alasan
                                  penolakan
                                </div>

                                <div className="mt-1 text-xs leading-5 text-rose-600">
                                  {
                                    guide.rejectionReason
                                  }
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================================================
              ORDERS
          ================================================== */}

          {activeTab ===
            "orders" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-black">
                  Semua Pesanan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Admin hanya memantau
                  pesanan. Assignment
                  Driver/Guide tidak
                  dilakukan dari sini.
                </p>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon="📦"
                  label="Total"
                  value={
                    orders.length
                  }
                  description="Semua pesanan"
                />

                <StatCard
                  icon="⏳"
                  label="Pending"
                  value={
                    pendingOrders
                  }
                  description="Menunggu penerimaan"
                />

                <StatCard
                  icon="🔄"
                  label="Aktif"
                  value={
                    activeOrders
                  }
                  description="Perjalanan berjalan"
                />

                <StatCard
                  icon="✅"
                  label="Selesai"
                  value={
                    completedOrders
                  }
                  description="Perjalanan selesai"
                />
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {orders.length ===
                0 ? (
                  <EmptyState
                    icon="📦"
                    title="Belum ada pesanan"
                    description="Pesanan customer akan muncul di sini."
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orders.map(
                      (order) => {
                        const customerName =
                          order.name ||
                          order.userEmail ||
                          "Customer";

                        const driverName =
                          order.driver
                            ?.name ||
                          "Belum ada";

                        const guideName =
                          order.guide
                            ?.name ||
                          "Belum ada";

                        return (
                          <div
                            key={
                              order.id
                            }
                            className="p-5 sm:p-6"
                          >
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-black">
                                    Order #
                                    {
                                      order.id
                                    }
                                  </span>

                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                      order.status
                                    )}`}
                                  >
                                    {
                                      statusLabel(
                                        order.status
                                      )
                                    }
                                  </span>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                  <OrderInfo
                                    label="Customer"
                                    value={
                                      customerName
                                    }
                                  />

                                  <OrderInfo
                                    label="Layanan"
                                    value={
                                      order.service
                                    }
                                  />

                                  <OrderInfo
                                    label="Tujuan"
                                    value={
                                      order.destinationName
                                    }
                                  />

                                  <OrderInfo
                                    label="Dibuat"
                                    value={formatDate(
                                      order.createdAt
                                    )}
                                  />
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                  <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                      Driver
                                    </div>

                                    <div className="mt-1 text-sm font-bold text-slate-800">
                                      {
                                        driverName
                                      }
                                    </div>

                                    {order.driverAcceptedAt && (
                                      <div className="mt-1 text-xs text-emerald-600">
                                        ✓ Sudah
                                        menerima
                                      </div>
                                    )}
                                  </div>

                                  <div className="rounded-2xl bg-slate-50 p-4">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                      Guide
                                    </div>

                                    <div className="mt-1 text-sm font-bold text-slate-800">
                                      {
                                        guideName
                                      }
                                    </div>

                                    {order.guideAcceptedAt && (
                                      <div className="mt-1 text-xs text-emerald-600">
                                        ✓ Sudah
                                        menerima
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-col gap-3 xl:items-end">
                                <div className="rounded-2xl bg-slate-50 px-5 py-4">
                                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Total
                                  </div>

                                  <div className="mt-1 font-black text-slate-900">
                                    {formatRupiah(
                                      order.totalPrice
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedOrder(
                                      order
                                    )
                                  }
                                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200"
                                >
                                  Detail Pesanan
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ======================================================
          CUSTOMER DETAIL MODAL
      ====================================================== */}

      {selectedCustomer && (
        <ModalOverlay
          onClose={() =>
            setSelectedCustomer(
              null
            )
          }
        >
          <ModalHeader
            title="Detail Customer"
            subtitle="Informasi akun customer"
            onClose={() =>
              setSelectedCustomer(
                null
              )
            }
          />

          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-black text-blue-700">
                {selectedCustomer.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h4 className="text-xl font-black">
                  {
                    selectedCustomer.name
                  }
                </h4>

                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Terdaftar
                </span>
              </div>
            </div>

            <InfoRow
              label="Customer ID"
              value={
                selectedCustomer.id
              }
            />

            <InfoRow
              label="Email"
              value={
                selectedCustomer.email
              }
            />

            <InfoRow
              label="Aktivitas"
              value={getCustomerActivity(
                selectedCustomer
              )}
            />

            <InfoRow
              label="Tanggal Daftar"
              value={formatDate(
                selectedCustomer.createdAt
              )}
            />
          </div>
        </ModalOverlay>
      )}

      {/* ======================================================
          DELETE CUSTOMER MODAL
      ====================================================== */}

      {showDeleteModal &&
        customerToDelete && (
          <ModalOverlay
            onClose={() => {
              setShowDeleteModal(
                false
              );

              setCustomerToDelete(
                null
              );
            }}
          >
            <div className="p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                🗑️
              </div>

              <h3 className="mt-5 text-xl font-black">
                Hapus Customer?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kamu akan menghapus
                akun{" "}
                <strong className="text-slate-700">
                  {
                    customerToDelete.name
                  }
                </strong>
                .
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(
                      false
                    );

                    setCustomerToDelete(
                      null
                    );
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={
                    confirmDelete
                  }
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}

      {/* ======================================================
          DRIVER DETAIL
      ====================================================== */}

      {selectedDriver && (
        <ModalOverlay
          onClose={() =>
            setSelectedDriver(
              null
            )
          }
        >
          <ModalHeader
            title="Detail Driver"
            subtitle="Informasi driver FunTravel"
            onClose={() =>
              setSelectedDriver(
                null
              )
            }
          />

          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-2xl">
                {selectedDriver.photo ? (
                  <img
                    src={
                      selectedDriver.photo
                    }
                    alt={
                      selectedDriver.name
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🚗"
                )}
              </div>

              <div>
                <h4 className="text-xl font-black">
                  {
                    selectedDriver.name
                  }
                </h4>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    selectedDriver.id
                  }
                </p>
              </div>
            </div>

            <InfoRow
              label="Nomor Telepon"
              value={
                selectedDriver.phone
              }
            />

            <InfoRow
              label="Kendaraan"
              value={
                selectedDriver.vehicle
              }
            />

            <InfoRow
              label="Nomor Polisi"
              value={
                selectedDriver.plateNumber
              }
            />

            <InfoRow
              label="Approval"
              value={statusLabel(
                selectedDriver.accountStatus
              )}
            />

            <InfoRow
              label="Status Operasional"
              value={statusLabel(
                selectedDriver.status
              )}
            />

            <InfoRow
              label="Rating"
              value={`⭐ ${selectedDriver.rating}`}
            />

            <InfoRow
              label="Total Perjalanan"
              value={`${selectedDriver.totalTrips} perjalanan`}
            />

            {selectedDriver.approvedAt && (
              <InfoRow
                label="Approved Pada"
                value={formatDate(
                  selectedDriver.approvedAt
                )}
              />
            )}

            {selectedDriver.rejectionReason && (
              <InfoRow
                label="Alasan Penolakan"
                value={
                  selectedDriver.rejectionReason
                }
              />
            )}
          </div>
        </ModalOverlay>
      )}

      {/* ======================================================
          GUIDE DETAIL
      ====================================================== */}

      {selectedGuide && (
        <ModalOverlay
          onClose={() =>
            setSelectedGuide(
              null
            )
          }
        >
          <ModalHeader
            title="Detail Guide"
            subtitle="Informasi guide FunTravel"
            onClose={() =>
              setSelectedGuide(
                null
              )
            }
          />

          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-amber-100 text-2xl">
                {selectedGuide.photo ? (
                  <img
                    src={
                      selectedGuide.photo
                    }
                    alt={
                      selectedGuide.name
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "🧑‍🏫"
                )}
              </div>

              <div>
                <h4 className="text-xl font-black">
                  {
                    selectedGuide.name
                  }
                </h4>

                <p className="mt-1 text-xs text-slate-400">
                  {
                    selectedGuide.id
                  }
                </p>
              </div>
            </div>

            <InfoRow
              label="Nomor Telepon"
              value={
                selectedGuide.phone
              }
            />

            <InfoRow
              label="Bahasa"
              value={selectedGuide.languages.join(
                ", "
              )}
            />

            <InfoRow
              label="Spesialisasi"
              value={selectedGuide.specialties.join(
                ", "
              )}
            />

            <InfoRow
              label="Approval"
              value={statusLabel(
                selectedGuide.accountStatus
              )}
            />

            <InfoRow
              label="Status Operasional"
              value={statusLabel(
                selectedGuide.status
              )}
            />

            <InfoRow
              label="Rating"
              value={`⭐ ${selectedGuide.rating}`}
            />

            <InfoRow
              label="Total Perjalanan"
              value={`${selectedGuide.totalTrips} perjalanan`}
            />

            {selectedGuide.approvedAt && (
              <InfoRow
                label="Approved Pada"
                value={formatDate(
                  selectedGuide.approvedAt
                )}
              />
            )}

            {selectedGuide.rejectionReason && (
              <InfoRow
                label="Alasan Penolakan"
                value={
                  selectedGuide.rejectionReason
                }
              />
            )}
          </div>
        </ModalOverlay>
      )}

      {/* ======================================================
          ORDER DETAIL
      ====================================================== */}

      {selectedOrder && (
        <ModalOverlay
          onClose={() =>
            setSelectedOrder(
              null
            )
          }
        >
          <ModalHeader
            title="Detail Pesanan"
            subtitle={`Order #${selectedOrder.id}`}
            onClose={() =>
              setSelectedOrder(
                null
              )
            }
          />

          <div className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                  selectedOrder.status
                )}`}
              >
                {
                  statusLabel(
                    selectedOrder.status
                  )
                }
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {
                  selectedOrder.service
                }
              </span>
            </div>

            <InfoRow
              label="Customer"
              value={
                selectedOrder.name ||
                selectedOrder.userEmail ||
                "-"
              }
            />

            <InfoRow
              label="Nomor Telepon"
              value={
                selectedOrder.phone
              }
            />

            <InfoRow
              label="Pickup"
              value={
                selectedOrder.pickup
              }
            />

            <InfoRow
              label="Tujuan"
              value={
                selectedOrder.destinationName
              }
            />

            <InfoRow
              label="Driver"
              value={
                selectedOrder.driver
                  ?.name ||
                "Belum menerima"
              }
            />

            <InfoRow
              label="Guide"
              value={
                selectedOrder.guide
                  ?.name ||
                "Belum menerima"
              }
            />

            {selectedOrder.date && (
              <InfoRow
                label="Tanggal"
                value={
                  selectedOrder.date
                }
              />
            )}

            {selectedOrder.time && (
              <InfoRow
                label="Waktu"
                value={
                  selectedOrder.time
                }
              />
            )}

            {selectedOrder.distance && (
              <InfoRow
                label="Jarak"
                value={
                  selectedOrder.distance
                }
              />
            )}

            {selectedOrder.duration && (
              <InfoRow
                label="Durasi"
                value={
                  selectedOrder.duration
                }
              />
            )}

            <InfoRow
              label="Total"
              value={formatRupiah(
                selectedOrder.totalPrice
              )}
            />

            <InfoRow
              label="Dibuat"
              value={formatDate(
                selectedOrder.createdAt
              )}
            />

            {selectedOrder.notes && (
              <InfoRow
                label="Catatan"
                value={
                  selectedOrder.notes
                }
              />
            )}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-xs font-black text-blue-800">
                ℹ️ Assignment
              </div>

              <div className="mt-1 text-xs leading-5 text-blue-700">
                Driver dan Guide
                menerima order
                secara mandiri.
                Admin hanya
                memantau hasil
                penerimaan.
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">
        {icon}
      </div>

      <div className="mt-5 text-sm font-semibold text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-3xl font-black text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-400">
        {description}
      </div>
    </div>
  );
}

function MiniStatus({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className:
    | "amber"
    | "green"
    | "blue"
    | "slate"
    | "red";
}) {
  const classes = {
    amber:
      "border-amber-100 bg-amber-50 text-amber-700",
    green:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    blue:
      "border-blue-100 bg-blue-50 text-blue-700",
    slate:
      "border-slate-200 bg-slate-50 text-slate-600",
    red:
      "border-rose-100 bg-rose-50 text-rose-700",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${classes[className]}`}
    >
      <div className="text-xs font-bold">
        {label}
      </div>

      <div className="mt-1 text-2xl font-black">
        {value}
      </div>
    </div>
  );
}

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
    <div className="px-6 py-16 text-center">
      <div className="text-5xl">
        {icon}
      </div>

      <h3 className="mt-4 font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div className="mt-1 break-all text-sm font-semibold text-slate-800">
        {value || "-"}
      </div>
    </div>
  );
}

function OrderInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "-"}
      </div>
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
      <div>
        <h3 className="text-lg font-black">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-xl bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200"
      >
        ✕
      </button>
    </div>
  );
}