import { StatutAmendement } from "./types";

export const badgeStatutClass: Record<StatutAmendement, string> = {
  Adopté: "bg-green-100 text-green-700",
  Rejeté: "bg-red-100 text-red-700",
  Retiré: "bg-gray-100 text-gray-600",
};

export const dotStatutClass: Record<StatutAmendement, string> = {
  Adopté: "bg-green-500",
  Rejeté: "bg-red-500",
  Retiré: "bg-gray-400",
};
