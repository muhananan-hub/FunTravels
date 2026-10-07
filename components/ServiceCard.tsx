import Link from "next/link";

type ServiceCardProps = {
  icon: string;
  title: string;
  description: string;
  price: string;
  service: "driver" | "guide" | "package";
};

export default function ServiceCard({
  icon,
  title,
  description,
  price,
  service,
}: ServiceCardProps) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl">
        {icon}
      </div>

      <h3 className="text-xl font-black text-slate-900">{title}</h3>

      <p className="mt-2 min-h-14 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Mulai dari
        </p>

        <p className="mt-1 text-xl font-black text-teal-700">{price}</p>
      </div>

      <Link
        href={`/booking?service=${service}`}
        className="mt-5 block rounded-2xl bg-teal-700 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-teal-800"
      >
        Mulai Memesan
      </Link>
    </div>
  );
}