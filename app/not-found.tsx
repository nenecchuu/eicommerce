import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="text-gray-500 text-sm">Halaman tidak ditemukan.</p>
        <Link href="/" className="text-sm text-blue-500 hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
