import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-4 text-2xl font-black">FunTravel</div>

          <p className="max-w-sm text-sm leading-7 text-slate-400">
            Platform perjalanan untuk membantu wisatawan menikmati Lombok
            dengan lebih mudah, nyaman, dan terorganisir.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Layanan</h3>

          <div className="space-y-3 text-sm text-slate-400">
            <Link
              href="/booking?service=driver"
              className="block hover:text-white"
            >
              Driver saja
            </Link>

            <Link
              href="/booking?service=guide"
              className="block hover:text-white"
            >
              Guide saja
            </Link>

            <Link
              href="/booking?service=package"
              className="block hover:text-white"
            >
              Paket lengkap
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold">FunTravel</h3>

          <div className="space-y-3 text-sm text-slate-400">
            <Link href="/destinasi" className="block hover:text-white">
              Destinasi
            </Link>

            <Link href="/riwayat" className="block hover:text-white">
              Riwayat Pesanan
            </Link>

            <Link href="/profile" className="block hover:text-white">
              Profile
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold">Partner & Legalitas</h3>

          <div className="space-y-2 text-sm text-slate-400">
            <p>Partner Driver Lombok</p>
            <p>Local Guide Lombok</p>
            <p>Travel Partner</p>
            <p>Informasi legalitas perusahaan</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} FunTravel. All rights reserved.
          </p>

          <div className="flex gap-5">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>TikTok</span>
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
}