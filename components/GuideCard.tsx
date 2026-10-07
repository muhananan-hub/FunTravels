type GuideCardProps = {
  name?: string;
  phone?: string;
  status?: "pending" | "assigned";
};

export default function GuideCard({
  name = "Menunggu penugasan",
  phone = "",
  status = "pending",
}: GuideCardProps) {
  const assigned = status === "assigned";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl">
          🧭
        </div>

        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Guide
          </p>

          <h3 className="mt-1 font-bold text-slate-900">
            {name}
          </h3>

          <p className="text-sm text-slate-500">
            Pemandu wisata FunTravel
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
          Hubungi Guide via WhatsApp
        </a>
      )}

      {!assigned && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          Guide akan ditugaskan oleh admin FunTravel setelah
          pesanan dikonfirmasi.
        </div>
      )}
    </div>
  );
}