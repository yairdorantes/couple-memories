import type { HighlightCard } from "../data/homeContent";
import { useI18n } from "../i18n/I18nContext";

type MemoryHighlightsProps = {
  highlights: HighlightCard[];
};

export function MemoryHighlights({ highlights }: MemoryHighlightsProps) {
  const { t } = useI18n();

  return (
    <section
      className='grid gap-3 sm:grid-cols-2'
      aria-label={t("highlights.ariaLabel")}
    >
      {highlights.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.id} className='highlight-card'>
            <div className='flex items-center justify-between gap-3'>
              <div className='grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-rose-petal'>
                <Icon className='h-6 w-6' aria-hidden='true' />
              </div>
              <p className='text-3xl font-black text-white'>{item.value}</p>
            </div>
            <h2 className='mt-5 text-xl font-black text-white'>
              {t(item.titleKey)}
            </h2>
            <p className='mt-1 text-sm font-medium text-cream-muted'>
              {t(item.captionKey)}
            </p>
          </article>
        );
      })}
    </section>
  );
}
