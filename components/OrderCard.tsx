"use client";

import { BookingOrder, formatRupiah } from "@/lib/bookings";
import DriverCard from "./DriverCard";
import GuideCard from "./GuideCard";

type OrderCardProps = {
  order: BookingOrder;
};

// ============================================================
// LABEL STATUS PESANAN
// ============================================================

function getStatusLabel(order: BookingOrder) {
  switch (order.status) {
    case "pending":
      if (order.service === "driver") {
        return "Menunggu Driver";
      }

      if (order.service === "guide") {
        return "Menunggu Guide";
      }

      return "Menunggu Driver & Guide";

    case "driver_accepted":
      return "Driver Sudah Menerima";

    case "guide_accepted":
      return "Guide Sudah Menerima";

    case "confirmed":
      return "Booking Dikonfirmasi";

    case "ongoing":
      return "Sedang Berjalan";

    case "completed":
      return "Selesai";

    case "cancelled":
      return "Dibatalkan";

    default:
      return order.status;
  }
}

// ============================================================
// WARNA STATUS
// ============================================================

function getStatusClass(order: BookingOrder) {
  switch (order.status) {
    case "pending":
      return "bg-amber-100 text-amber-700";

    case "driver_accepted":
    case "guide_accepted":
      return "bg-blue-100 text-blue-700";

    case "confirmed":
      return "bg-emerald-100 text-emerald-700";

    case "ongoing":
      return "bg-violet-100 text-violet-700";

    case "completed":
      return "bg-slate-100 text-slate-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

// ============================================================
// FORMAT TANGGAL
// ============================================================

function formatDate(value?: string) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

// ============================================================
// WHATSAPP
// ============================================================

function getWhatsAppUrl(phone?: string) {
  if (!phone) return "";

  const normalized = phone.replace(/\D/g, "");

  if (!normalized) return "";

  let number = normalized;

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  }

  if (!number.startsWith("62")) {
    number = `62${number}`;
  }

  return `https://wa.me/${number}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function OrderCard({
  order,
}: OrderCardProps) {
  const serviceName =
    order.service === "driver"
      ? "Driver Saja"
      : order.service === "guide"
      ? "Guide Saja"
      : "Paket Lengkap";

  const statusLabel = getStatusLabel(order);
  const statusClass = getStatusClass(order);

  const hasDriver = Boolean(
    order.driverId || order.driver
  );

  const hasGuide = Boolean(
    order.guideId || order.guide
  );

  const driverWhatsApp = getWhatsAppUrl(
    order.driver?.phone
  );

  const guideWhatsApp = getWhatsAppUrl(
    order.guide?.phone
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            ID Pesanan
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {order.id}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="space-y-5 p-5">

        {/* ================================================== */}
        {/* LAYANAN */}
        {/* ================================================== */}

        <div>
          <p className="text-sm text-slate-500">
            Layanan
          </p>

          <h2 className="text-xl font-bold text-slate-900">
            {serviceName}
          </h2>
        </div>

        {/* ================================================== */}
        {/* DETAIL PERJALANAN */}
        {/* ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Penjemputan
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {order.pickup}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Tujuan
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {order.destinationName}
            </p>
          </div>

          {order.date && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Tanggal
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.date}
              </p>
            </div>
          )}

          {order.time && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Waktu
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.time}
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Jumlah Penumpang
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {order.passengers} orang
            </p>
          </div>

          {order.distance && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Jarak
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.distance}
              </p>
            </div>
          )}

          {order.duration && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">
                Perkiraan Perjalanan
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.duration}
              </p>
            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* DATA PEMESAN */}
        {/* ================================================== */}

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Data Pemesan
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">

            <div>
              <p className="text-xs text-slate-400">
                Nama
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                No. Telepon / WhatsApp
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {order.phone}
              </p>
            </div>

          </div>

          {order.notes && (
            <div className="mt-3">
              <p className="text-xs text-slate-400">
                Catatan
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* KENDARAAN */}
        {/* ================================================== */}

        {order.vehicle && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              Kendaraan
            </p>

            <div className="mt-1 flex items-center justify-between gap-4">
              <span className="font-bold text-slate-900">
                {order.vehicle}
              </span>

              <span className="font-semibold text-teal-700">
                {formatRupiah(order.vehiclePrice || 0)}
              </span>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* PAKET */}
        {/* ================================================== */}

        {order.packageName && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">
              Paket
            </p>

            <div className="mt-1 flex items-center justify-between gap-4">
              <span className="font-bold text-slate-900">
                {order.packageName}
              </span>

              <span className="font-semibold text-teal-700">
                {formatRupiah(order.packagePrice || 0)}
              </span>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* TOTAL */}
        {/* ================================================== */}

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">
              Total
            </span>

            <span className="text-xl font-black text-teal-700">
              {formatRupiah(order.totalPrice)}
            </span>
          </div>
        </div>

        {/* ================================================== */}
        {/* DRIVER */}
        {/* ================================================== */}

        {order.service !== "guide" && (
          <>
            {hasDriver && order.driver ? (
              <div className="space-y-3">

                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Driver
                  </h3>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Sudah Menerima
                  </span>
                </div>

                <DriverCard
                  {...order.driver}
                />

                {order.driverAcceptedAt && (
                  <p className="text-xs text-slate-400">
                    Diterima pada{" "}
                    {formatDate(
                      order.driverAcceptedAt
                    )}
                  </p>
                )}

                {driverWhatsApp && (
                  <a
                    href={driverWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    💬 Hubungi Driver via WhatsApp
                  </a>
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4">
                <p className="font-bold text-amber-800">
                  🚗 Menunggu Driver
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  Pesanan kamu sedang menunggu
                  Driver yang tersedia untuk
                  menerima perjalanan ini.
                </p>
              </div>
            )}
          </>
        )}

        {/* ================================================== */}
        {/* GUIDE */}
        {/* ================================================== */}

        {order.service !== "driver" && (
          <>
            {hasGuide && order.guide ? (
              <div className="space-y-3">

                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Guide
                  </h3>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Sudah Menerima
                  </span>
                </div>

                <GuideCard
                  {...order.guide}
                />

                {order.guideAcceptedAt && (
                  <p className="text-xs text-slate-400">
                    Diterima pada{" "}
                    {formatDate(
                      order.guideAcceptedAt
                    )}
                  </p>
                )}

                {guideWhatsApp && (
                  <a
                    href={guideWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    💬 Hubungi Guide via WhatsApp
                  </a>
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4">
                <p className="font-bold text-amber-800">
                  🧭 Menunggu Guide
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  Pesanan kamu sedang menunggu
                  Guide yang tersedia untuk
                  menerima perjalanan ini.
                </p>
              </div>
            )}
          </>
        )}

        {/* ================================================== */}
        {/* STATUS PAKET LENGKAP */}
        {/* ================================================== */}

        {order.service === "package" && (
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">

            <p className="font-bold text-teal-900">
              📦 Status Paket Lengkap
            </p>

            <div className="mt-3 space-y-2 text-sm">

              <div className="flex items-center justify-between gap-3">
                <span className="text-teal-800">
                  Driver
                </span>

                <span
                  className={
                    hasDriver
                      ? "font-bold text-emerald-700"
                      : "font-semibold text-amber-700"
                  }
                >
                  {hasDriver
                    ? "✓ Sudah menerima"
                    : "Menunggu"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-teal-800">
                  Guide
                </span>

                <span
                  className={
                    hasGuide
                      ? "font-bold text-emerald-700"
                      : "font-semibold text-amber-700"
                  }
                >
                  {hasGuide
                    ? "✓ Sudah menerima"
                    : "Menunggu"}
                </span>
              </div>

            </div>

            {hasDriver && hasGuide && (
              <div className="mt-4 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
                ✓ Driver dan Guide sudah
                menerima pesanan. Booking
                siap dikonfirmasi.
              </div>
            )}

          </div>
        )}

        {/* ================================================== */}
        {/* WAKTU PEMBUATAN PESANAN */}
        {/* ================================================== */}

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Pesanan dibuat
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {formatDate(order.createdAt)}
          </p>
        </div>

      </div>
    </div>
  );
}