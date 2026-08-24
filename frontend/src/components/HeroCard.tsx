import { GlassCard } from "./GlassCard";
import { PositionedImage } from "./PositionedImage";
import { getDaysUntil } from "../utils/dateDuration";
import { useI18n } from "../i18n/I18nContext";
import { formatShortDate, type Language } from "../i18n/translations";
import type { RelationshipConfig } from "../data/homeContent";
import type { CSSProperties } from "react";

type HeroCardProps = {
  config: RelationshipConfig;
  totalDays: number;
  language: Language;
};

export function HeroCard({ config, totalDays, language }: HeroCardProps) {
  const { t } = useI18n();
  const daysUntilAnniversary = getDaysUntil(config.nextAnniversaryDate);

  return (
    <GlassCard className='p-4 sm:p-5'>
      <div className='relative overflow-hidden rounded-[2rem]'>
        <PositionedImage
          className='h-[21rem] w-full object-cover sm:h-[26rem]'
          src={config.heroImage.src}
          alt={t(config.heroImage.altKey)}
          crop={config.heroImage.crop}
          loading='eager'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-ink-950/86 via-ink-950/18 to-transparent' />
        <div className='absolute right-3 top-3 flex items-center rounded-full border border-white/15 bg-black/30 p-2 shadow-card backdrop-blur-xl sm:right-4 sm:top-4'>
          {config.avatarImages.map((avatar, index) => (
            <PositionedImage
              key={avatar.src}
              className={`hero-avatar ${index > 0 ? "-ml-2.5" : ""} ${
                avatar.accentColor
                  ? ""
                  : avatar.ringColor === "blue"
                  ? "border-blue-500/90"
                  : "border-rose-halo"
              }`}
              src={avatar.src}
              alt={t(avatar.altKey)}
              crop={avatar.crop}
              loading='eager'
              style={
                avatar.accentColor
                  ? ({ "--hero-avatar-ring": avatar.accentColor } as CSSProperties)
                  : undefined
              }
            />
          ))}
        </div>
        <div className='absolute inset-x-0 bottom-0 p-5 sm:p-7'>
          <div className='flex items-end gap-3'>
            <div>
              <h1 className='flex max-w-full flex-wrap items-center gap-2 text-[clamp(2rem,7vw,4.2rem)] font-black leading-none text-white'>
                {config.coupleNames} ❤️
              </h1>
              <p className='mt-3 flex flex-wrap items-center gap-2 text-[clamp(1.3rem,4vw,2rem)] font-extrabold leading-tight text-pink-100'>
                {t("hero.togetherLine", totalDays)}✨
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-5 flex items-center gap-2 px-1 pb-1'>
        <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold-soft/45 bg-gold-deep/20 text-gold-soft'>
          <CalendarIcon />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-black text-white sm:text-2xl'>
            {t("hero.anniversaryIn", daysUntilAnniversary)} 🎉
          </p>
        </div>
        <time
          className='shrink-0 text-sm font-semibold text-cream-muted sm:text-2xl'
          dateTime={config.nextAnniversaryDate}
        >
          {formatShortDate(config.nextAnniversaryDate, language)}
        </time>
      </div>
    </GlassCard>
  );
}

function CalendarIcon() {
  return (
    <svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
      <path
        d='M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
