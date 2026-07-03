// lib/types.ts

export type Law = {
  uid: string;
  title: string;
  type: string;
  legislature: string;
  date?: string;
};

export type Amendment = {
  id: string;
  article?: string;
  content: string;
  status?: "adopted" | "rejected" | "pending";
  lawRef: string;
  deputyRef?: string;
};

export type Deputy = {
  id: string;
  name: string;
  group?: string;
};

export type Dossier = {
  id: string;
  steps: string[];
};