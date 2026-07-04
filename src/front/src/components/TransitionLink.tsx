"use client";
import { useTransitionNavigate } from "@/providers/TransitionProvider";

// Lien qui déclenche la transition SVG au clic (au lieu d'une navigation directe).
// À utiliser uniquement là où on veut l'animation (Suivre l'avancement, retour
// accueil, logo).
export default function TransitionLink({
  href,
  className,
  children,
  style,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const navigate = useTransitionNavigate();
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
