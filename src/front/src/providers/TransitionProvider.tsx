"use client";
import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

// Transition SVG (stroke) pilotée MANUELLEMENT (le lifecycle de
// next-transition-router n'était pas fiable avec Next 16 / Server Components :
// l'overlay restait figé). Ici : `navigate(href)` joue le "leave" (l'overlay se
// dessine et couvre) -> router.push -> au changement de route, le "enter" révèle.
// Seuls les liens qui appellent `navigate` sont animés (Suivre l'avancement,
// retour à l'accueil, logo). Le reste navigue normalement.

const TransitionCtx = createContext<(href: string) => void>(() => {});
export const useTransitionNavigate = () => useContext(TransitionCtx);

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const revealPending = useRef(false);
  const animating = useRef(false);

  // état initial : traits invisibles
  useEffect(() => {
    if (!svgRef.current) return;
    const paths = Array.from(svgRef.current.querySelectorAll("path"));
    pathsRef.current = paths;
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });
  }, []);

  // "enter" : révèle la nouvelle page, uniquement si la navigation a été
  // déclenchée par la transition (revealPending). Aucune animation au refresh.
  useEffect(() => {
    if (!revealPending.current) return;
    revealPending.current = false;
    const paths = pathsRef.current;
    if (!paths.length) {
      animating.current = false;
      return;
    }
    const tl = gsap.timeline({ onComplete: () => (animating.current = false) });
    paths.forEach((p) => {
      const len = p.getTotalLength();
      tl.to(
        p,
        {
          strokeDashoffset: -len,
          attr: { "stroke-width": 200 },
          duration: 0.8,
          ease: "power1.inOut",
          onComplete: () => gsap.set(p, { strokeDashoffset: len }),
        },
        0
      );
    });
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      const paths = pathsRef.current;
      if (animating.current) return;
      if (!paths.length) {
        router.push(href);
        return;
      }
      animating.current = true;
      revealPending.current = true;

      // "leave" : les traits se dessinent et couvrent l'écran, puis on navigue.
      const tl = gsap.timeline({ onComplete: () => router.push(href) });
      paths.forEach((p) => {
        tl.to(
          p,
          {
            strokeDashoffset: 0,
            attr: { "stroke-width": 700 },
            duration: 0.8,
            ease: "power1.inOut",
          },
          0
        );
      });

      // filet de sécurité : si la révélation n'arrive jamais, on débloque tout.
      setTimeout(() => {
        if (animating.current) {
          paths.forEach((p) => gsap.set(p, { strokeDashoffset: p.getTotalLength() }));
          animating.current = false;
          revealPending.current = false;
        }
      }, 6000);
    },
    [router]
  );

  return (
    <TransitionCtx.Provider value={navigate}>
      <div className="transition-svg">
        <svg
          ref={svgRef}
          viewBox="0 0 2453 2535"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
            stroke="var(--transition-stroke-1)"
            strokeWidth="200"
            strokeLinecap="round"
          />
          <path
            d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
            stroke="var(--transition-stroke-2)"
            strokeWidth="200"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {children}
    </TransitionCtx.Provider>
  );
}
