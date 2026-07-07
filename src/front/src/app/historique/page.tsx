import { redirect } from "next/navigation";

// La page « historique » a été remplacée par le registre législatif complet paginé.
export default function HistoriqueRedirect() {
  redirect("/lois");
}
