"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

interface Props {
  number: string;
}

function isFocusedCommercePath(pathname: string) {
  return (
    pathname === "/keranjang" ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/order/")
  );
}

export default function WhatsAppFloat({ number }: Props) {
  const pathname = usePathname();

  if (isFocusedCommercePath(pathname)) return null;

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
    >
      <Image src="/whatsapp.svg" alt="WhatsApp" width={28} height={28} />
    </a>
  );
}
