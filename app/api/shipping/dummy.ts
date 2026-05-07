import type { ShippingService } from "./types";

function randomPrice(base: number): number {
  return base + Math.floor(Math.random() * 3000) - 1000;
}

function randomEtd(minDay: number, maxDay: number): string {
  const lo = minDay + Math.floor(Math.random() * 2);
  const hi = maxDay + Math.floor(Math.random() * 2);
  return lo === hi ? `${lo} days` : `${lo} - ${hi} days`;
}

export function mockRates(): ShippingService[] {
  return [
    { courier_code: "jne", courier_service_code: "jtr", courier_name: "JNE", service: "JNE Trucking", description: "Trucking with minimum weight of 10 kg", price: randomPrice(50000), etd: randomEtd(4, 5) },
    { courier_code: "jne", courier_service_code: "reg", courier_name: "JNE", service: "Reguler", description: "Layanan reguler", price: randomPrice(7000), etd: randomEtd(1, 2) },
    { courier_code: "jne", courier_service_code: "yes", courier_name: "JNE", service: "Yakin Esok Sampai (YES)", description: "Yakin esok sampai", price: randomPrice(9000), etd: randomEtd(1, 1) },
    { courier_code: "anteraja", courier_service_code: "reg", courier_name: "AnterAja", service: "Reguler", description: "Regular shipment", price: randomPrice(9500), etd: randomEtd(1, 2) },
    { courier_code: "anteraja", courier_service_code: "next_day", courier_name: "AnterAja", service: "Next Day", description: "Next day service delivery", price: randomPrice(11200), etd: randomEtd(1, 1) },
    { courier_code: "sicepat", courier_service_code: "best", courier_name: "SiCepat", service: "Besok Sampai Tujuan", description: "Besok sampai tujuan", price: randomPrice(13000), etd: randomEtd(1, 1) },
    { courier_code: "sicepat", courier_service_code: "reg", courier_name: "SiCepat", service: "Reguler", description: "Layanan reguler", price: randomPrice(7000), etd: randomEtd(1, 2) },
    { courier_code: "jnt", courier_service_code: "ez", courier_name: "J&T", service: "EZ", description: "Layanan reguler", price: randomPrice(8000), etd: randomEtd(2, 3) },
  ];
}
