import React, { useEffect, useState } from "react";

const phrases = [
  "Curious Observer & Logic Enthusiast",
  "Full-Stack Builder & UI Tinkerer",
  "Agent Babysitter & Chief Token Burner",
];

const ROTATION_INTERVAL_MS = 3000;
const FLIP_DURATION_MS = 500;

export default function HeroTitle() {
  const [rotation, setRotation] = useState<{
    currentIndex: number;
    previousIndex: number | null;
  }>({ currentIndex: 0, previousIndex: null });

  useEffect(() => {
    let settleTimeoutId: number | undefined;

    const intervalId = window.setInterval(() => {
      setRotation(({ currentIndex }) => ({
        currentIndex: (currentIndex + 1) % phrases.length,
        previousIndex: currentIndex,
      }));

      settleTimeoutId = window.setTimeout(() => {
        setRotation(({ currentIndex }) => ({ currentIndex, previousIndex: null }));
      }, FLIP_DURATION_MS);
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      if (settleTimeoutId !== undefined) window.clearTimeout(settleTimeoutId);
    };
  }, []);

  return (
    <p className="hero-title">
      <span className="hero-title-sizer" aria-hidden="true">
        <span className="hero-title-sizer-name">Chloe Jin</span>
        <span>{phrases[2]}</span>
      </span>
      <strong className="hero-title-name">Chloe Jin</strong>
      <span className="hero-title-rotator" aria-live="polite" aria-atomic="true">
        {rotation.previousIndex !== null && (
          <span
            className="hero-title-phrase is-outgoing"
            aria-hidden="true"
            key={`outgoing-${rotation.previousIndex}-${rotation.currentIndex}`}
          >
            {phrases[rotation.previousIndex]}
          </span>
        )}
        <span
          className={`hero-title-phrase${rotation.previousIndex !== null ? " is-incoming" : " is-current"}`}
          key={`current-${rotation.currentIndex}-${rotation.previousIndex ?? "rest"}`}
        >
          {phrases[rotation.currentIndex]}
        </span>
      </span>
    </p>
  );
}
