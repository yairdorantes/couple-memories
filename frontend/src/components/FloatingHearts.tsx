import type { CSSProperties } from 'react';

const hearts = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  left: `${4 + ((index * 19) % 92)}%`,
  size: `${18 + ((index * 7) % 24)}px`,
  delay: `${-(index * 0.85) % 14}s`,
  duration: `${13 + ((index * 5) % 10)}s`,
  drift: `${index % 2 === 0 ? '-' : ''}${18 + ((index * 11) % 32)}px`,
  start: `${(index * 13) % 95}vh`,
  opacity: 0.22 + ((index * 3) % 14) / 100,
}));

export function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="floating-heart"
          style={{
            '--heart-left': heart.left,
            '--heart-size': heart.size,
            '--heart-delay': heart.delay,
            '--heart-duration': heart.duration,
            '--heart-drift': heart.drift,
            '--heart-start': heart.start,
            '--heart-opacity': heart.opacity,
          } as CSSProperties}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
