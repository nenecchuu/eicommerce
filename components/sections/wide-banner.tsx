import Image from "next/image";
import Link from "next/link";
import type { WideBannerProps } from "@/lib/types/homepage";

export default function WideBannerSection({ props }: { props: WideBannerProps }) {
  if (!props.image_url) return null;

  const hasContent = Boolean(props.title || props.subtitle || props.cta_label);
  const ctaUrl = props.cta_url ?? props.link_url;
  const banner = (
    <div className="relative w-full aspect-[16/5] bg-gray-100">
      <Image
        src={props.image_url}
        alt={props.alt ?? props.title ?? "Wide banner"}
        fill
        className="object-cover"
        sizes="100vw"
      />
      {hasContent && <div className="absolute inset-0 bg-black/25" />}

      {hasContent && (
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="max-w-lg text-white space-y-2 sm:space-y-3">
              {props.title && (
                <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-lg">
                  {props.title}
                </h2>
              )}
              {props.subtitle && (
                <p className="text-white/90 text-sm md:text-base drop-shadow">
                  {props.subtitle}
                </p>
              )}
              {props.cta_label && ctaUrl && (
                <Link
                  href={ctaUrl}
                  className="inline-block mt-2 bg-white text-gray-900 font-bold px-6 py-2.5 rounded-full text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {props.cta_label}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!hasContent && props.link_url) {
    return (
      <section className="relative overflow-hidden">
        <Link href={props.link_url} aria-label={props.alt ?? "Wide banner"}>
          {banner}
        </Link>
      </section>
    );
  }

  return <section className="relative overflow-hidden">{banner}</section>;
}
