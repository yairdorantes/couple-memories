import { Heart } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useI18n } from "../i18n/I18nContext";
import type { RelationshipDuration } from "../utils/dateDuration";
import type { TranslationKey } from "../i18n/translations";

type TogetherCounterProps = {
  duration: RelationshipDuration;
};

const units = [
  { key: "years", labelKey: "counter.years" },
  { key: "months", labelKey: "counter.months" },
  { key: "days", labelKey: "counter.days" },
] as const;

export function TogetherCounter({ duration }: TogetherCounterProps) {
  const { t } = useI18n();

  return (
    <GlassCard className='px-5 py-8 sm:px-8'>
      <div className='mb-6 flex items-center justify-center gap-3 text-center'>
        <Heart
          className='h-7 w-7 fill-rose-pulse text-rose-pulse'
          aria-hidden='true'
        />
        <p className='text-sm font-black uppercase tracking-[0.35em] text-cream-muted'>
          {t("counter.heading")}
        </p>
      </div>
      <div
        className='grid grid-cols-3 gap-3 sm:gap-5'
        aria-label={t(
          "counter.ariaSummary",
          duration.years,
          duration.months,
          duration.days,
        )}
      >
        {units.map((unit) => (
          <div key={unit.key} className='counter-tile'>
            <strong>{duration[unit.key]}</strong>
            <span>{t(unit.labelKey as TranslationKey)}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
