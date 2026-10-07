"use client";

import dynamic from "next/dynamic";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  destinations,
  getDestinationById,
} from "@/lib/destinations";

import {
  BookingOrder,
  BookingService,
  formatRupiah,
  saveBooking,
} from "@/lib/bookings";

import OrderCard from "./OrderCard";

import type { SelectedMapLocation } from "./MapPicker";

// =========================================================
// MAP PICKER
// =========================================================

const MapPicker = dynamic(
  () => import("./MapPicker"),
  {
    ssr: false,
  }
);

// =========================================================
// PROPS
// =========================================================

type BookingFormProps = {
  initialService?: BookingService;
  initialDestination?: string;
};

// =========================================================
// USER
// =========================================================

type CurrentUser = {
  id?: string;
  name?: string;
  email?: string;
};

// =========================================================
// ROUTE INFO
// =========================================================

type RouteInfo = {
  distance: string;
  duration: string;
  distanceKm: number;
  durationMinutes: number;
};

// =========================================================
// VEHICLES
// =========================================================

const vehicles = [
  {
    name: "Toyota Avanza",
    price: 550000,
  },
  {
    name: "Toyota Innova",
    price: 700000,
  },
  {
    name: "Toyota Hiace",
    price: 1200000,
  },
];

// =========================================================
// PACKAGES
// =========================================================

const packages = [
  {
    name: "Paket Mandalika",
    destination: "kuta-mandalika",
    price: 850000,
  },
  {
    name: "Paket Gili",
    destination: "gili-trawangan",
    price: 950000,
  },
  {
    name: "Paket Nature Lombok",
    destination: "sembalun",
    price: 1100000,
  },
];

// =========================================================
// COMPONENT
// =========================================================

export default function BookingForm({
  initialService = "driver",
  initialDestination = "",
}: BookingFormProps) {
  // =======================================================
  // SERVICE
  // =======================================================

  const [service, setService] =
    useState<BookingService>(
      initialService
    );

  // =======================================================
  // PICKUP
  // =======================================================

  const [pickup, setPickup] =
    useState("");

  // =======================================================
  // DESTINATION
  // =======================================================

  const [destinationId, setDestinationId] =
    useState(initialDestination);

  // =======================================================
  // PASSENGERS
  // =======================================================

  const [passengers, setPassengers] =
    useState(1);

  // =======================================================
  // CUSTOMER
  // =======================================================

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  // =======================================================
  // DATE & TIME
  // =======================================================

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  // =======================================================
  // NOTES
  // =======================================================

  const [notes, setNotes] =
    useState("");

  // =======================================================
  // VEHICLE
  // =======================================================

  const [vehicle, setVehicle] =
    useState(
      vehicles[0].name
    );

  // =======================================================
  // PACKAGE
  // =======================================================

  const [packageIndex, setPackageIndex] =
    useState(0);

  // =======================================================
  // SUCCESS ORDER
  // =======================================================

  const [successOrder, setSuccessOrder] =
    useState<BookingOrder | null>(
      null
    );

  // =======================================================
  // ROUTE
  // =======================================================

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState("");

  const [routeInfo, setRouteInfo] =
    useState<RouteInfo | null>(null);

  // =======================================================
  // MAP PICKER
  // =======================================================

  const [mapPickerOpen, setMapPickerOpen] =
    useState(false);

  const [mapPickerType, setMapPickerType] =
    useState<
      "pickup" | "destination"
    >("pickup");

  // =======================================================
  // PICKUP MAP LOCATION
  // =======================================================

  const [pickupLocation, setPickupLocation] =
    useState<SelectedMapLocation | null>(
      null
    );

  // =======================================================
  // DESTINATION MAP LOCATION
  // =======================================================

  const [
    destinationLocation,
    setDestinationLocation,
  ] = useState<SelectedMapLocation | null>(
    null
  );

  // =======================================================
  // UPDATE SERVICE DARI QUERY PARAM
  // =======================================================

  useEffect(() => {
    setService(initialService);
  }, [initialService]);

  // =======================================================
  // UPDATE DESTINATION DARI QUERY PARAM
  // =======================================================

  useEffect(() => {
    if (initialDestination) {
      setDestinationId(
        initialDestination
      );
    }
  }, [initialDestination]);

  // =======================================================
  // KENDARAAN YANG DIPILIH
  // =======================================================

  const selectedVehicle =
    vehicles.find(
      (item) =>
        item.name === vehicle
    ) || vehicles[0];

  // =======================================================
  // PAKET YANG DIPILIH
  // =======================================================

  const selectedPackage =
    packages[packageIndex] ||
    packages[0];

  // =======================================================
  // DESTINASI YANG DIPILIH
  // =======================================================

  const selectedDestination =
    destinations.find(
      (item) =>
        item.id === destinationId
    );

  // =======================================================
  // TOTAL HARGA
  // =======================================================

  const totalPrice =
    service === "driver"
      ? selectedVehicle.price
      : service === "guide"
      ? 250000
      : selectedPackage.price;

  // =======================================================
  // BUKA MAP PICKER
  // =======================================================

  function openMapPicker(
    type:
      | "pickup"
      | "destination"
  ) {
    setMapPickerType(type);
    setMapPickerOpen(true);
  }

  // =======================================================
  // LOKASI DIPILIH DARI PETA
  // =======================================================

  function handleMapLocationSelected(
    location: SelectedMapLocation
  ) {
    if (
      mapPickerType === "pickup"
    ) {
      setPickupLocation(
        location
      );

      setPickup(
        location.address
      );
    } else {
      setDestinationLocation(
        location
      );

      // Kalau tujuan dipilih dari peta,
      // alamat hasil reverse geocoding
      // akan menjadi nama tujuan.
      setDestinationId("");
    }

    // Route lama tidak boleh digunakan
    setRouteInfo(null);
    setRouteError("");

    setMapPickerOpen(false);
  }

  // =======================================================
  // GANTI SERVICE
  // =======================================================

  function changeService(
    value: BookingService
  ) {
    setService(value);

    setSuccessOrder(null);

    setRouteInfo(null);
    setRouteError("");

    // Reset jam agar tidak membawa
    // data service sebelumnya.
    setTime("");

    if (value === "package") {
      const packageDestination =
        packages[
          packageIndex
        ]?.destination ||
        packages[0].destination;

      setDestinationId(
        packageDestination
      );
    }
  }

  // =======================================================
  // GANTI PICKUP
  // =======================================================

  function handlePickupChange(
    value: string
  ) {
    setPickup(value);

    // Jika user mengetik manual,
    // koordinat peta sebelumnya
    // tidak lagi dianggap valid.
    setPickupLocation(null);

    setRouteInfo(null);
    setRouteError("");
  }

  // =======================================================
  // GANTI DESTINASI
  // =======================================================

  function handleDestinationChange(
    value: string
  ) {
    setDestinationId(value);

    // Karena tujuan berubah dari dropdown,
    // koordinat tujuan peta sebelumnya
    // harus dihapus.
    setDestinationLocation(null);

    setRouteInfo(null);
    setRouteError("");
  }

  // =======================================================
  // GANTI PAKET
  // =======================================================

  function handlePackageChange(
    value: number
  ) {
    setPackageIndex(value);

    const selected =
      packages[value] ||
      packages[0];

    setDestinationId(
      selected.destination
    );

    // Paket menggunakan tujuan
    // dari data destinasi.
    setDestinationLocation(null);

    setRouteInfo(null);
    setRouteError("");
  }

  // =======================================================
  // DAPATKAN NAMA TUJUAN
  // =======================================================

  function getFinalDestinationName() {
    // Jika tujuan dipilih melalui peta,
    // alamat hasil reverse geocoding
    // digunakan sebagai tujuan.
    if (
      destinationLocation?.address
    ) {
      return destinationLocation.address;
    }

    // Jika menggunakan paket
    if (service === "package") {
      const packageDestination =
        getDestinationById(
          selectedPackage.destination
        );

      return (
        packageDestination?.name ||
        selectedPackage.name
      );
    }

    // Jika menggunakan dropdown
    return (
      selectedDestination?.name ||
      ""
    );
  }

  // =======================================================
  // HITUNG RUTE
  // =======================================================

  async function calculateRoute() {
    setRouteError("");

    // -----------------------------------------------------
    // VALIDASI PICKUP
    // -----------------------------------------------------

    if (!pickup.trim()) {
      setRouteError(
        "Silakan masukkan lokasi penjemputan terlebih dahulu."
      );

      return;
    }

    // -----------------------------------------------------
    // NAMA TUJUAN
    // -----------------------------------------------------

    const destinationName =
      getFinalDestinationName();

    // -----------------------------------------------------
    // VALIDASI TUJUAN
    // -----------------------------------------------------

    if (!destinationName) {
      setRouteError(
        "Silakan pilih tujuan terlebih dahulu."
      );

      return;
    }

    setRouteLoading(true);
    setRouteInfo(null);

    try {
      const response =
        await fetch("/api/maps", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            pickup,
            destination:
              destinationName,

            // =================================================
            // KOORDINAT PICKUP
            // =================================================

            pickupLatitude:
              pickupLocation?.latitude,

            pickupLongitude:
              pickupLocation?.longitude,

            // =================================================
            // KOORDINAT TUJUAN
            // =================================================

            destinationLatitude:
              destinationLocation?.latitude,

            destinationLongitude:
              destinationLocation?.longitude,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Gagal menghitung rute."
        );
      }

      setRouteInfo({
        distance:
          data.distance ||
          "Tidak tersedia",

        duration:
          data.duration ||
          "Tidak tersedia",

        distanceKm:
          Number(
            data.distanceKm
          ) || 0,

        durationMinutes:
          Number(
            data.durationMinutes
          ) || 0,
      });
    } catch (error) {
      console.error(
        "Gagal menghitung rute:",
        error
      );

      setRouteError(
        error instanceof Error
          ? error.message
          : "Gagal menghitung jarak dan waktu perjalanan."
      );
    } finally {
      setRouteLoading(false);
    }
  }

  // =======================================================
  // SUBMIT BOOKING
  // =======================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // =====================================================
    // CEK LOGIN CUSTOMER
    // =====================================================

    const loggedIn =
      localStorage.getItem(
        "funtravel_logged_in"
      );

    if (loggedIn !== "true") {
      alert(
        "Silakan login terlebih dahulu sebelum membuat pesanan."
      );

      window.location.href =
        "/profile";

      return;
    }

    // =====================================================
    // AMBIL USER LOGIN
    // =====================================================

    const currentUserRaw =
      localStorage.getItem(
        "funtravel_current_user"
      );

    let currentUser:
      | CurrentUser
      | null = null;

    try {
      currentUser =
        currentUserRaw
          ? JSON.parse(
              currentUserRaw
            )
          : null;
    } catch (error) {
      console.error(
        "Gagal membaca data customer:",
        error
      );

      currentUser = null;
    }

    // =====================================================
    // VALIDASI DATA USER
    // =====================================================

    if (
      !currentUser ||
      (!currentUser.id &&
        !currentUser.email)
    ) {
      alert(
        "Data akun tidak ditemukan. Silakan login kembali."
      );

      localStorage.removeItem(
        "funtravel_logged_in"
      );

      localStorage.removeItem(
        "funtravel_current_user"
      );

      window.location.href =
        "/profile";

      return;
    }

    // -----------------------------------------------------
    // PICKUP
    // -----------------------------------------------------

    if (!pickup.trim()) {
      alert(
        "Silakan masukkan lokasi penjemputan."
      );

      return;
    }

    // -----------------------------------------------------
    // DESTINATION
    // -----------------------------------------------------

    if (
      !destinationId &&
      !destinationLocation &&
      service !== "package"
    ) {
      alert(
        "Silakan pilih tujuan."
      );

      return;
    }

    // -----------------------------------------------------
    // PACKAGE DESTINATION
    // -----------------------------------------------------

    if (
      service === "package" &&
      !selectedPackage
    ) {
      alert(
        "Silakan pilih paket wisata."
      );

      return;
    }

    // -----------------------------------------------------
    // PASSENGERS
    // -----------------------------------------------------

    if (
      !passengers ||
      passengers < 1
    ) {
      alert(
        "Jumlah penumpang minimal 1 orang."
      );

      return;
    }

    // -----------------------------------------------------
    // NAME
    // -----------------------------------------------------

    if (!name.trim()) {
      alert(
        "Silakan masukkan nama lengkap."
      );

      return;
    }

    // -----------------------------------------------------
    // PHONE
    // -----------------------------------------------------

    if (!phone.trim()) {
      alert(
        "Silakan masukkan nomor WhatsApp."
      );

      return;
    }

    // -----------------------------------------------------
    // DATE
    // -----------------------------------------------------

    if (!date) {
      alert(
        "Silakan pilih tanggal perjalanan."
      );

      return;
    }

    // -----------------------------------------------------
    // TIME
    // -----------------------------------------------------

    if (
      (service === "driver" ||
        service === "guide") &&
      !time
    ) {
      alert(
        "Silakan pilih jam perjalanan."
      );

      return;
    }

    // -----------------------------------------------------
    // ROUTE
    // -----------------------------------------------------

    if (!routeInfo) {
      alert(
        "Silakan hitung jarak dan estimasi waktu perjalanan terlebih dahulu."
      );

      return;
    }

    // =====================================================
    // DESTINATION FINAL
    // =====================================================

    let finalDestinationId =
      destinationId;

    let finalDestinationName =
      getFinalDestinationName();

    let packageName:
      | string
      | undefined;

    let packagePrice:
      | number
      | undefined;

    // =====================================================
    // PACKAGE
    // =====================================================

    if (service === "package") {
      finalDestinationId =
        selectedPackage.destination;

      const packageDestination =
        destinations.find(
          (item) =>
            item.id ===
            selectedPackage.destination
        );

      // Jika customer memilih titik
      // tujuan manual dari peta,
      // alamat peta tetap digunakan.
      if (!destinationLocation) {
        finalDestinationName =
          packageDestination?.name ||
          selectedPackage.name;
      }

      packageName =
        selectedPackage.name;

      packagePrice =
        selectedPackage.price;
    }

    // =====================================================
    // BUAT ORDER
    // =====================================================

    const order: BookingOrder = {
      id: `FT-${Date.now()}`,

      // ===================================================
      // PEMILIK BOOKING
      // ===================================================
      //
      // Data ini digunakan agar halaman
      // Riwayat Pesanan hanya menampilkan
      // booking milik customer yang login.
      //
      // userId menjadi identitas utama.
      // userEmail menjadi fallback jika
      // akun lama belum mempunyai ID.
      //
      // ===================================================

      userId:
        currentUser.id ||
        undefined,

      userEmail:
        currentUser.email
          ?.trim()
          .toLowerCase() ||
        undefined,

      // ===================================================
      // SERVICE
      // ===================================================

      service,

      // ===================================================
      // DESTINATION
      // ===================================================

      destinationId:
        finalDestinationId ||
        undefined,

      destinationName:
        finalDestinationName ||
        "Tujuan Lombok",

      // ===================================================
      // PICKUP
      // ===================================================

      pickup,

      pickupLatitude:
        pickupLocation?.latitude,

      pickupLongitude:
        pickupLocation?.longitude,

      // ===================================================
      // DESTINATION COORDINATE
      // ===================================================

      destinationLatitude:
        destinationLocation?.latitude,

      destinationLongitude:
        destinationLocation?.longitude,

      // ===================================================
      // CUSTOMER
      // ===================================================

      passengers,

      name:
        name.trim(),

      phone:
        phone.trim(),

      // ===================================================
      // DATE & TIME
      // ===================================================

      date,

      time:
        service === "driver" ||
        service === "guide"
          ? time
          : undefined,

      // ===================================================
      // NOTES
      // ===================================================

      notes:
        notes.trim() ||
        undefined,

      // ===================================================
      // VEHICLE
      // ===================================================

      vehicle:
        service === "driver"
          ? selectedVehicle.name
          : undefined,

      vehiclePrice:
        service === "driver"
          ? selectedVehicle.price
          : undefined,

      // ===================================================
      // PACKAGE
      // ===================================================

      packageName,

      packagePrice,

      // ===================================================
      // ROUTE
      // ===================================================

      distance:
        routeInfo.distance,

      duration:
        routeInfo.duration,

      // ===================================================
      // TOTAL
      // ===================================================

      totalPrice,

      // ===================================================
      // STATUS
      // ===================================================
      //
      // Semua booking baru selalu pending.
      //
      // Driver/Guide yang tersedia akan
      // menerima pesanan sendiri.
      //
      // ===================================================

      status: "pending",

      // ===================================================
      // DRIVER
      // ===================================================
      //
      // Tidak ditentukan oleh Admin.
      //
      // Driver akan mengisi data ini ketika
      // menerima booking.
      //
      // ===================================================

      driver: undefined,

      driverId: undefined,

      driverAcceptedAt:
        undefined,

      // ===================================================
      // GUIDE
      // ===================================================
      //
      // Tidak ditentukan oleh Admin.
      //
      // Guide akan mengisi data ini ketika
      // menerima booking.
      //
      // ===================================================

      guide: undefined,

      guideId: undefined,

      guideAcceptedAt:
        undefined,

      // ===================================================
      // CREATED AT
      // ===================================================

      createdAt:
        new Date().toISOString(),
    };

    // =====================================================
    // SIMPAN BOOKING
    // =====================================================

    saveBooking(order);

    // =====================================================
    // TAMPILKAN HASIL
    // =====================================================

    setSuccessOrder(order);

    // =====================================================
    // SCROLL TOP
    // =====================================================

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // BOOKING BERHASIL
  // =========================================================

  if (successOrder) {
    return (
      <div className="space-y-6">

        {/* =================================================
            SUCCESS
        ================================================== */}

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">
              ✓
            </div>

            <div>

              <h2 className="text-xl font-black text-emerald-900">
                Pesanan berhasil dibuat
              </h2>

              <p className="mt-1 text-sm text-emerald-700">
                ID Pesanan:{" "}
                <strong>
                  {successOrder.id}
                </strong>
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-700">
                Pesanan kamu berhasil dibuat
                dan sedang menunggu
                Driver/Guide yang tersedia
                untuk menerima pesanan ini.
                Setelah ada yang menerima,
                informasi Driver/Guide akan
                muncul di detail pesananmu.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            ORDER CARD
        ================================================== */}

        <OrderCard
          order={successOrder}
        />

        {/* =================================================
            DETAIL PERJALANAN
        ================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

          <h3 className="font-black text-slate-900">
            Detail Perjalanan
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                Jarak
              </p>

              <p className="mt-1 text-2xl font-black text-slate-900">
                {successOrder.distance ||
                  "Tidak tersedia"}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                Estimasi waktu
              </p>

              <p className="mt-1 text-2xl font-black text-slate-900">
                {successOrder.duration ||
                  "Tidak tersedia"}
              </p>

            </div>

          </div>

          {/* =================================================
              KOORDINAT
          ================================================== */}

          {(successOrder.pickupLatitude !==
            undefined ||
            successOrder.destinationLatitude !==
              undefined) && (
            <div className="mt-4 rounded-2xl bg-teal-50 p-4">

              <p className="text-xs font-black uppercase tracking-wider text-teal-700">
                Lokasi dari Peta
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">

                {successOrder.pickupLatitude !==
                  undefined &&
                  successOrder.pickupLongitude !==
                    undefined && (
                    <div>

                      <p className="text-xs text-teal-600">
                        Pickup
                      </p>

                      <p className="mt-1 text-xs font-bold text-teal-900">
                        {successOrder.pickupLatitude.toFixed(
                          6
                        )}
                        {" , "}
                        {successOrder.pickupLongitude.toFixed(
                          6
                        )}
                      </p>

                    </div>
                  )}

                {successOrder.destinationLatitude !==
                  undefined &&
                  successOrder.destinationLongitude !==
                    undefined && (
                    <div>

                      <p className="text-xs text-teal-600">
                        Tujuan
                      </p>

                      <p className="mt-1 text-xs font-bold text-teal-900">
                        {successOrder.destinationLatitude.toFixed(
                          6
                        )}
                        {" , "}
                        {successOrder.destinationLongitude.toFixed(
                          6
                        )}
                      </p>

                    </div>
                  )}

              </div>

            </div>
          )}

        </div>

        {/* =================================================
            STATUS DRIVER / GUIDE
        ================================================== */}

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">

          <h3 className="font-black text-amber-900">
            Menunggu Driver / Guide
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            Pesanan sudah masuk ke sistem.
            Driver atau Guide yang sudah
            disetujui dan sedang tersedia
            dapat menerima pesanan ini
            langsung dari dashboard mereka.
          </p>

          {successOrder.driver && (
            <div className="mt-4 rounded-2xl bg-white p-4">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Driver
              </p>

              <p className="mt-1 font-black text-slate-900">
                {successOrder.driver.name}
              </p>

              {successOrder.driver.phone && (
                <p className="mt-1 text-sm text-slate-600">
                  {successOrder.driver.phone}
                </p>
              )}

              {successOrder.driver.vehicle && (
                <p className="mt-1 text-sm text-slate-600">
                  {successOrder.driver.vehicle}
                </p>
              )}

            </div>
          )}

          {successOrder.guide && (
            <div className="mt-4 rounded-2xl bg-white p-4">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Guide
              </p>

              <p className="mt-1 font-black text-slate-900">
                {successOrder.guide.name}
              </p>

              {successOrder.guide.phone && (
                <p className="mt-1 text-sm text-slate-600">
                  {successOrder.guide.phone}
                </p>
              )}

            </div>
          )}

        </div>

        {/* =================================================
            BUTTON
        ================================================== */}

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() => {
              setSuccessOrder(null);

              setPickup("");

              setPickupLocation(null);

              setDestinationLocation(
                null
              );

              setRouteInfo(null);

              setRouteError("");

              setName("");

              setPhone("");

              setDate("");

              setTime("");

              setNotes("");

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
          >
            Buat Pesanan Baru
          </button>

          <a
            href="/riwayat"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Lihat Riwayat Pesanan
          </a>

        </div>

      </div>
    );
  }

  // =========================================================
  // FORM
  // =========================================================

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ===================================================
            SERVICE
        ==================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* DRIVER */}

          <button
            type="button"
            onClick={() =>
              changeService(
                "driver"
              )
            }
            className={`rounded-2xl border p-5 text-left transition ${
              service === "driver"
                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100"
                : "border-slate-200 bg-white hover:border-teal-300"
            }`}
          >

            <div className="text-2xl">
              🚗
            </div>

            <h3 className="mt-3 font-bold">
              Driver Saja
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Antar jemput sesuai
              kebutuhan.
            </p>

          </button>

          {/* GUIDE */}

          <button
            type="button"
            onClick={() =>
              changeService(
                "guide"
              )
            }
            className={`rounded-2xl border p-5 text-left transition ${
              service === "guide"
                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100"
                : "border-slate-200 bg-white hover:border-teal-300"
            }`}
          >

            <div className="text-2xl">
              🧭
            </div>

            <h3 className="mt-3 font-bold">
              Guide Saja
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Temani perjalananmu
              menjelajahi Lombok.
            </p>

          </button>

          {/* PACKAGE */}

          <button
            type="button"
            onClick={() =>
              changeService(
                "package"
              )
            }
            className={`rounded-2xl border p-5 text-left transition ${
              service === "package"
                ? "border-teal-600 bg-teal-50 ring-2 ring-teal-100"
                : "border-slate-200 bg-white hover:border-teal-300"
            }`}
          >

            <div className="text-2xl">
              🏝️
            </div>

            <h3 className="mt-3 font-bold">
              Paket Lengkap
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Driver + guide dalam
              satu paket.
            </p>

          </button>

        </div>

        {/* ===================================================
            DETAIL PERJALANAN
        ==================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-6">

            <h2 className="text-xl font-black text-slate-900">
              Detail Perjalanan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Isi informasi perjalananmu.
            </p>

          </div>

          <div className="grid gap-5">

            {/* ===============================================
                PICKUP
            ================================================ */}

            <div>

              <div className="mb-2 flex items-center justify-between gap-3">

                <label className="block text-sm font-bold text-slate-700">
                  Lokasi Penjemputan
                </label>

                <button
                  type="button"
                  onClick={() =>
                    openMapPicker(
                      "pickup"
                    )
                  }
                  className="shrink-0 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-black text-teal-700 transition hover:bg-teal-100 sm:px-4 sm:text-sm"
                >
                  📍{" "}
                  <span className="hidden sm:inline">
                    Pilih di Peta
                  </span>
                </button>

              </div>

              <input
                value={pickup}
                onChange={(e) =>
                  handlePickupChange(
                    e.target.value
                  )
                }
                placeholder="Contoh: Bandara Lombok"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              {pickupLocation && (
                <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2">

                  <p className="text-xs font-bold text-emerald-700">
                    ✓ Lokasi pickup dipilih
                    dari peta
                  </p>

                  <p className="mt-1 text-[10px] text-emerald-600">
                    {pickupLocation.latitude.toFixed(
                      6
                    )}
                    {" , "}
                    {pickupLocation.longitude.toFixed(
                      6
                    )}
                  </p>

                </div>
              )}

              <p className="mt-2 text-xs text-slate-500">
                Kamu bisa mengetik alamat
                manual atau memilih titik
                langsung dari peta.
              </p>

            </div>

            {/* ===============================================
                TUJUAN
            ================================================ */}

            {service !== "package" && (
              <div>

                <div className="mb-2 flex items-center justify-between gap-3">

                  <label className="block text-sm font-bold text-slate-700">
                    Tujuan
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      openMapPicker(
                        "destination"
                      )
                    }
                    className="shrink-0 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-black text-teal-700 transition hover:bg-teal-100 sm:px-4 sm:text-sm"
                  >
                    📍{" "}
                    <span className="hidden sm:inline">
                      Pilih di Peta
                    </span>
                  </button>

                </div>

                <select
                  value={destinationId}
                  onChange={(e) =>
                    handleDestinationChange(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-teal-500"
                >

                  <option value="">
                    Pilih tujuan
                  </option>

                  {destinations.map(
                    (destination) => (
                      <option
                        key={
                          destination.id
                        }
                        value={
                          destination.id
                        }
                      >
                        {destination.name}
                      </option>
                    )
                  )}

                </select>

                {destinationLocation && (
                  <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2">

                    <p className="text-xs font-bold text-emerald-700">
                      ✓ Tujuan dipilih dari
                      peta
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      {
                        destinationLocation.address
                      }
                    </p>

                    <p className="mt-1 text-[10px] text-emerald-600">
                      {destinationLocation.latitude.toFixed(
                        6
                      )}
                      {" , "}
                      {destinationLocation.longitude.toFixed(
                        6
                      )}
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* ===============================================
                PACKAGE
            ================================================ */}

            {service === "package" && (
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Pilih Paket Wisata
                </label>

                <select
                  value={
                    packageIndex
                  }
                  onChange={(e) =>
                    handlePackageChange(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-teal-500"
                >

                  {packages.map(
                    (
                      item,
                      index
                    ) => (
                      <option
                        key={
                          item.name
                        }
                        value={
                          index
                        }
                      >
                        {item.name} —{" "}
                        {formatRupiah(
                          item.price
                        )}
                      </option>
                    )
                  )}

                </select>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4">

                  <p className="text-sm font-bold text-slate-800">
                    Isi Paket
                  </p>

                  <ul className="mt-2 space-y-1 text-sm text-slate-600">

                    <li>
                      ✓ Driver
                    </li>

                    <li>
                      ✓ Guide
                    </li>

                    <li>
                      ✓ Transportasi
                      wisata
                    </li>

                    <li>
                      ✓ Pendampingan
                      perjalanan
                    </li>

                  </ul>

                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl border border-teal-100 bg-teal-50 p-4">

                  <div>

                    <p className="text-xs text-teal-600">
                      Tujuan paket
                    </p>

                    <p className="mt-1 font-bold text-teal-900">
                      {getDestinationById(
                        selectedPackage.destination
                      )?.name ||
                        selectedPackage.name}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openMapPicker(
                        "destination"
                      )
                    }
                    className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-teal-700 shadow-sm hover:bg-teal-100"
                  >
                    📍 Pilih titik
                  </button>

                </div>

                {destinationLocation && (
                  <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2">

                    <p className="text-xs font-bold text-emerald-700">
                      ✓ Titik tujuan paket
                      dipilih dari peta
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      {
                        destinationLocation.address
                      }
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* ===============================================
                VEHICLE
            ================================================ */}

            {service === "driver" && (
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Pilih Kendaraan
                </label>

                <div className="grid gap-3 sm:grid-cols-3">

                  {vehicles.map(
                    (item) => (
                      <button
                        key={
                          item.name
                        }
                        type="button"
                        onClick={() =>
                          setVehicle(
                            item.name
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          vehicle ===
                          item.name
                            ? "border-teal-600 bg-teal-50"
                            : "border-slate-200 bg-white hover:border-teal-300"
                        }`}
                      >

                        <p className="font-bold text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm font-bold text-teal-700">
                          {formatRupiah(
                            item.price
                          )}
                        </p>

                      </button>
                    )
                  )}

                </div>

              </div>
            )}

            {/* ===============================================
                PASSENGERS + DATE
            ================================================ */}

            <div className="grid gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Jumlah Penumpang
                </label>

                <input
                  type="number"
                  min={1}
                  max={50}
                  value={
                    passengers
                  }
                  onChange={(e) =>
                    setPassengers(
                      Math.max(
                        1,
                        Number(
                          e.target
                            .value
                        ) || 1
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Tanggal Perjalanan
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

              </div>

            </div>

            {/* ===============================================
                TIME
            ================================================ */}

            {(service === "driver" ||
              service === "guide") && (
              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Jam Perjalanan
                </label>

                <input
                  type="time"
                  value={time}
                  onChange={(e) =>
                    setTime(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Pilih jam penjemputan atau
                  mulai perjalanan.
                </p>

              </div>
            )}

            {/* ===============================================
                NAME + PHONE
            ================================================ */}

            <div className="grid gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  No. WhatsApp
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

              </div>

            </div>

            {/* ===============================================
                NOTES
            ================================================ */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Catatan
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Tambahkan permintaan khusus jika ada..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

            </div>

          </div>

        </div>

        {/* ===================================================
            ROUTE
        ==================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div>

            <h2 className="text-xl font-black text-slate-900">
              Rute Perjalanan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Hitung jarak dan estimasi
              waktu perjalanan sebelum
              membuat pesanan.
            </p>

          </div>

          {/* ERROR */}

          {routeError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">

              <p className="text-sm font-semibold text-red-700">
                {routeError}
              </p>

            </div>
          )}

          {/* RESULT */}

          {routeInfo && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  Jarak Perjalanan
                </p>

                <p className="mt-1 text-2xl font-black text-teal-900">
                  {routeInfo.distance}
                </p>

                {routeInfo.distanceKm >
                  0 && (
                  <p className="mt-1 text-xs text-teal-700">
                    Sekitar{" "}
                    {routeInfo.distanceKm.toFixed(
                      1
                    )}{" "}
                    km
                  </p>
                )}

              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Estimasi Waktu
                </p>

                <p className="mt-1 text-2xl font-black text-blue-900">
                  {routeInfo.duration}
                </p>

                {routeInfo.durationMinutes >
                  0 && (
                  <p className="mt-1 text-xs text-blue-700">
                    Perkiraan perjalanan
                  </p>
                )}

              </div>

            </div>
          )}

          {/* BUTTON */}

          <button
            type="button"
            onClick={
              calculateRoute
            }
            disabled={
              routeLoading
            }
            className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {routeLoading
              ? "Sedang menghitung rute..."
              : routeInfo
              ? "Hitung Ulang Rute"
              : "Hitung Jarak & Waktu"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            Rute menggunakan
            OpenStreetMap + OSRM
            tanpa Google Maps API.
          </p>

        </div>

        {/* ===================================================
            TOTAL
        ==================================================== */}

        <div className="rounded-3xl bg-slate-900 p-6 text-white">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm text-slate-400">
                Estimasi total
              </p>

              <p className="mt-1 text-2xl font-black">
                {formatRupiah(
                  totalPrice
                )}
              </p>

              {routeInfo && (
                <p className="mt-2 text-xs text-slate-400">
                  {routeInfo.distance}
                  {" • "}
                  {routeInfo.duration}
                </p>
              )}

            </div>

            <button
              type="submit"
              disabled={
                routeLoading ||
                !routeInfo
              }
              className="rounded-xl bg-teal-500 px-6 py-3 font-bold text-white transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!routeInfo
                ? "Hitung Rute Dahulu"
                : "Buat Pesanan"}
            </button>

          </div>

        </div>

      </form>

      {/* =====================================================
          MAP PICKER
      ====================================================== */}

      {mapPickerOpen && (
        <MapPicker
          title={
            mapPickerType ===
            "pickup"
              ? "Pilih Lokasi Penjemputan"
              : "Pilih Lokasi Tujuan"
          }

          initialLocation={
            mapPickerType ===
            "pickup"
              ? pickupLocation
              : destinationLocation
          }

          onSelect={
            handleMapLocationSelected
          }

          onClose={() =>
            setMapPickerOpen(
              false
            )
          }
        />
      )}
    </>
  );
}