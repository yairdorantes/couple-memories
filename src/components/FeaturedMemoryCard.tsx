import { ArrowRight, Heart } from "lucide-react";
import { featuredMemories } from "../data/homeContent";
import { useI18n } from "../i18n/I18nContext";
import { formatShortDate } from "../i18n/translations";

export function FeaturedMemoryCard() {
  const { language, t } = useI18n();
  const activeMemory = featuredMemories[0];

  return (
    <section aria-label={t("featured.ariaLabel")}>
      <article className='featured-memory-card'>
        <img
          className='featured-memory-image'
          src={activeMemory.image.src}
          alt={t(activeMemory.image.altKey)}
        />
        <div className='featured-memory-overlay' aria-hidden='true' />

        <div className='featured-memory-badge'>
          <Heart className='h-3.5 w-3.5 fill-current' aria-hidden='true' />
          <span>{t("featured.badge")}</span>
        </div>

        <div className='featured-memory-content'>
          <div className='min-w-0'>
            <h2>{t(activeMemory.titleKey)}</h2>
            <p>{t(activeMemory.captionKey)}</p>
            <time dateTime={activeMemory.date}>
              {formatShortDate(activeMemory.date, language)}
            </time>
          </div>

          <a className='featured-memory-link' href={activeMemory.detailHref}>
            <span>{t("featured.viewMore")}</span>
            <ArrowRight className='h-4 w-4' aria-hidden='true' />
          </a>
        </div>
      </article>

      <div className='featured-memory-dots' aria-hidden='true'>
        {Array.from({ length: 3 }, (_, index) => (
          <span key={index} className={index === 0 ? "is-active" : undefined} />
        ))}
      </div>
    </section>
  );
}
