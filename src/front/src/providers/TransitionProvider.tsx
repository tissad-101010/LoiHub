"use client";

// Transition désactivée : next-transition-router + GSAP se comportaient mal avec
// Next 16 / Server Components (overlay orange figé, animation rejouée au refresh).
// On rend simplement les pages, navigation instantanée et fiable.
export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
