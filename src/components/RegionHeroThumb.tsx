import Image from "next/image";
import type { AppLocale } from "@/i18n/config";
import { getRegionHeroImage } from "@/data/region-hero-images";

type Props = {
  regionId: string;
  locale: AppLocale;
  className?: string;
  sizes?: string;
};

export function RegionHeroThumb({ regionId, locale, className, sizes }: Props) {
  const img = getRegionHeroImage(regionId);
  if (!img) return null;
  const alt = locale === "zh" ? img.altZh : img.altEn;
  return (
    <div className={`relative shrink-0 overflow-hidden bg-slate-200 ${className ?? ""}`}>
      <Image
        src={img.src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes ?? "(max-width: 640px) 112px, 144px"}
      />
    </div>
  );
}
