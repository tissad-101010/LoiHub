// lib/api.ts

export async function fetchLaws() {
  const res = await fetch("/api/laws");
  return res.json();
}

export async function fetchLaw(id: string) {
  const res = await fetch(`/api/laws/${id}`);
  return res.json();
}

export async function fetchAmendments(lawId: string) {
  const res = await fetch(`/api/laws/${lawId}/amendments`);
  return res.json();
}