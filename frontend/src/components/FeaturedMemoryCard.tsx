import { ArrowRight, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { formatShortDate, type Language } from "../i18n/translations";
import { PositionedImage } from "./PositionedImage";
import type { ImageCrop } from "../utils/imageCrop";

export type FeaturedMemoryCardItem = {
  id: string;
  title: string;
  caption: string;
  date: string;
  image: {
    src: string;
    alt: string;
    crop?: ImageCrop;
  };
};

type FeaturedMemoryCardProps = {
  memories: FeaturedMemoryCardItem[];
  isLoading?: boolean;
  onViewMemory?: (memoryId: string) => void;
};

const fallbackImageSrc = "/images/featured-memory-placeholder.svg";
const minSwipeDistance = 72;
const swipeIntentDistance = 12;
const swipeDirectionRatio = 1.35;

type SwipeIntent = "undecided" | "horizontal" | "vertical";

export function FeaturedMemoryCard({
  memories,
  isLoading = false,
  onViewMemory,
}: FeaturedMemoryCardProps) {
  const { language, t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const swipeIntent = useRef<SwipeIntent>("undecided");
  const hasMemories = memories.length > 0;
  const carouselItems = hasMemories ? memories : [];
  const cardTranslate = `calc(${-activeIndex * 100}% + ${dragOffset}px)`;

  useEffect(() => {
    setActiveIndex(0);
    setDragOffset(0);
  }, [memories]);

  function showPreviousMemory() {
    if (memories.length <= 1) {
      return;
    }

    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? memories.length - 1 : currentIndex - 1,
    );
  }

  function showNextMemory() {
    if (memories.length <= 1) {
      return;
    }

    setActiveIndex((currentIndex) =>
      currentIndex === memories.length - 1 ? 0 : currentIndex + 1,
    );
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (memories.length <= 1) {
      return;
    }

    swipeStartX.current = event.clientX;
    swipeStartY.current = event.clientY;
    swipeIntent.current = "undecided";
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (swipeStartX.current === null || swipeStartY.current === null) {
      return;
    }

    const distanceX = event.clientX - swipeStartX.current;
    const distanceY = event.clientY - swipeStartY.current;
    const absoluteX = Math.abs(distanceX);
    const absoluteY = Math.abs(distanceY);

    if (swipeIntent.current === "undecided") {
      if (absoluteX < swipeIntentDistance && absoluteY < swipeIntentDistance) {
        return;
      }

      swipeIntent.current =
        absoluteX > absoluteY * swipeDirectionRatio ? "horizontal" : "vertical";
    }

    if (swipeIntent.current !== "horizontal") {
      setDragOffset(0);
      return;
    }

    setDragOffset(distanceX);
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLElement>) {
    if (swipeStartX.current === null || swipeStartY.current === null) {
      return;
    }

    const distance = event.clientX - swipeStartX.current;
    const isHorizontalSwipe = swipeIntent.current === "horizontal";
    swipeStartX.current = null;
    swipeStartY.current = null;
    swipeIntent.current = "undecided";
    setDragOffset(0);

    if (!isHorizontalSwipe || Math.abs(distance) < minSwipeDistance) {
      return;
    }

    if (distance > 0) {
      showPreviousMemory();
    } else {
      showNextMemory();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      showPreviousMemory();
    }
    if (event.key === "ArrowRight") {
      showNextMemory();
    }
  }

  return (
    <section aria-label={t("featured.ariaLabel")}>
      <article
        className={`featured-memory-card${hasMemories ? "" : " is-empty"}`}
        tabIndex={memories.length > 1 ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
      >
        <div
          className='featured-memory-track'
          style={{ transform: `translate3d(${cardTranslate}, 0, 0)` }}
        >
          {hasMemories ? (
            carouselItems.map((memory) => (
              <FeaturedMemorySlide
                key={memory.id}
                memory={memory}
                language={language}
                viewMoreLabel={t("featured.viewMore")}
                badgeLabel={t("featured.badge")}
                onViewMemory={onViewMemory}
              />
            ))
          ) : (
            <div className='featured-memory-slide'>
              <PositionedImage
                className='featured-memory-image'
                src={fallbackImageSrc}
                alt={t("featured.emptyTitle")}
              />
              <div className='featured-memory-overlay' aria-hidden='true' />

              <div className='featured-memory-badge'>
                <Heart className='h-3.5 w-3.5 fill-current' aria-hidden='true' />
                <span>{t("featured.badge")}</span>
              </div>

              <div className='featured-memory-content'>
                <div className='min-w-0'>
                  <h2>{isLoading ? t("featured.loading") : t("featured.emptyTitle")}</h2>
                  <p>{t("featured.emptyCaption")}</p>
                </div>

                <button
                  className='featured-memory-link'
                  type='button'
                  disabled
                >
                  <span>{t("featured.viewMore")}</span>
                  <ArrowRight className='h-4 w-4' aria-hidden='true' />
                </button>
              </div>
            </div>
          )}
        </div>
      </article>

      {memories.length > 1 ? (
        <div className='featured-memory-dots'>
          {memories.map((memory, index) => (
            <button
              key={memory.id}
              className={index === activeIndex ? "is-active" : undefined}
              type='button'
              aria-label={`${t("featured.ariaLabel")} ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => {
                setDragOffset(0);
                setActiveIndex(index);
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

type FeaturedMemorySlideProps = {
  memory: FeaturedMemoryCardItem;
  language: Language;
  badgeLabel: string;
  viewMoreLabel: string;
  onViewMemory?: (memoryId: string) => void;
};

function FeaturedMemorySlide({
  memory,
  language,
  badgeLabel,
  viewMoreLabel,
  onViewMemory,
}: FeaturedMemorySlideProps) {
  return (
    <div className='featured-memory-slide'>
      <PositionedImage
        className='featured-memory-image'
        src={memory.image.src || fallbackImageSrc}
        alt={memory.image.alt}
        crop={memory.image.crop}
      />
      <div className='featured-memory-overlay' aria-hidden='true' />

      <div className='featured-memory-badge'>
        <Heart className='h-3.5 w-3.5 fill-current' aria-hidden='true' />
        <span>{badgeLabel}</span>
      </div>

      <div className='featured-memory-content'>
        <div className='min-w-0'>
          <h2>{memory.title}</h2>
          <p>{memory.caption}</p>
          <time dateTime={memory.date}>
            {formatShortDate(memory.date, language)}
          </time>
        </div>

        <button
          className='featured-memory-link'
          type='button'
          onClick={() => onViewMemory?.(memory.id)}
        >
          <span>{viewMoreLabel}</span>
          <ArrowRight className='h-4 w-4' aria-hidden='true' />
        </button>
      </div>
    </div>
  );
}
