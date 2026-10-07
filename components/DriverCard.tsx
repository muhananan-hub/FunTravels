type DriverCardProps = {
  name?: string;
  phone?: string;
  vehicle?: string;
  status?: "pending" | "assigned";
};

export default function DriverCard({
  name = "Menunggu penugasan",
  phone = "",
  vehicle = "Akan ditentukan",
  status = "pending",
}: DriverCardProps) {
  const assigned = status === "assigned";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 text-2xl">
          🚗
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Driver
          </p>

          <h3 className="mt-1 font-bold text-slate-900">
            {name}
          </h3>

          <p className="text-sm text-slate-500">
            {vehicle}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            assigned
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {assigned ? "Ditugaskan" : "Menunggu"}
        </span>
      </div>

      {assigned && phone && (
        <a
          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Hubungi Driver via WhatsApp
        </a>
      )}

      {!assigned && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          Driver akan ditugaskan oleh admin FunTravel setelah
          pesanan dikonfirmasi.
        </div>
      )}
    </div>
  );
}