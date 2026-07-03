# $\color{cornflowerblue}{\huge\text{LoiHub}}$
## $\color{midnightblue}{\small\text{Le GitHub de la loi}}$

> *Suivre une loi comme on suit un dépôt de code : commits, diffs, contributeurs.*

> [!NOTE]
> **TODO** : ajouter ici l'arborescence du README (sommaire) et la section *Getting Started* (Installation + Environment Configuration) une fois la stack stabilisée.

## Description

LoiHub est une plateforme qui permet aux citoyens, parlementaires et juristes de suivre en temps réel l'évolution d'une loi ou d'une proposition de loi : quels articles ont changé, qui a proposé quoi (amendements), et pourquoi.

La métaphore est celle de GitHub — diffs, historique, contributeurs — mais le projet **n'utilise pas git**. Le backend repose sur des données relationnelles construites à partir des jeux de données ouverts de l'Assemblée nationale et du Sénat, interrogées via SQL pour reconstituer les versions successives d'un texte et la chaîne des amendements qui y ont mené.

Projet développé dans le cadre du **Hackathon Assemblée nationale 2026** ([hackathon2026.assemblee-nationale.fr](https://hackathon2026.assemblee-nationale.fr/)).

---

## Enjeux

Suivre la vie d'une loi aujourd'hui reste un exercice réservé aux initiés :

- Les textes législatifs évoluent au fil de centaines d'amendements, **sans vue d'ensemble accessible**
- Le grand public **n'a pas accès à une lecture claire** de ce qui change concrètement dans un article
- Les parlementaires manquent d'un outil simple pour **suivre l'impact des amendements** de leurs collègues ou groupes
- Les juristes doivent reconstituer **à la main** l'historique précis des versions d'un article et le sourcer

LoiHub répond à ces manques en traitant chaque loi comme un dépôt de code : versionné, diffable, attribuable.

| Besoin | Approche actuelle | LoiHub |
|---|---|---|
| Comprendre ce qui change dans un article | ❌ Jargon juridique, PDF dispersés | ✅ Diff ligne à ligne, résumé en langage clair |
| Retracer un amendement | ❌ Recherche manuelle dans les dossiers | ✅ Frise chronologique par article |
| Suivre le parcours d'un texte | ❌ Dossier législatif brut | ✅ Timeline verticale illustrée |
| Identifier qui a influencé un article | ❌ Quasi impossible sans dépouillement | ✅ Classement par % de contribution |
| Sourcer une modification | ❌ Croisement manuel de plusieurs bases | ✅ Bloc "Origine de cette modification" |

---

## Fonctionnalités de la maquette

La maquette front couvre la page dédiée à une loi (ex. *Projet de loi n°1234 — Logement abordable*) :

- **En-tête** — numéro, titre, statut (déposé / adopté / promulgué), dates clés, lien vers le dossier législatif
- **Parcours législatif** — timeline verticale : dépôt → commission → 1ère lecture AN → Sénat → 2nde lecture → adoption → promulgation
- **Stats globales** — nombre d'amendements (total + adoptés), députés impliqués (sur 577), scrutins publics, heures de débat
- **Explorateur de texte** — sommaire hiérarchique Titre > Chapitre > Article, avec mention *"Modifié par amendement n°X"* et bloc *"Origine de cette modification"* (auteur, groupe, statut, dates, lien vers l'amendement)
- **Diff viewer** — comparaison ligne à ligne façon code entre deux versions d'un article (rouge = supprimé, vert = ajouté)
- **Historique des amendements** — frise chronologique par article : texte initial → amendements successifs (retiré / rejeté / adopté) → version finale
- **"Qui a influencé cet article ?"** — classement des députés par % de contribution au texte final, coloré par groupe politique

> Le résumé d'amendement en langage clair est généré par IA et affiché directement dans le bloc "Origine de cette modification".

---

## Architecture technique

**Front-end** — codé à la main à partir de la maquette existante (charte bleu marine / tricolore, cards, timeline, diff viewer), avec Next.js, Tailwind et shadcn/ui.

**Données** — ingestion des jeux de données ouverts de l'Assemblée nationale (et éventuellement du Sénat / d'une base unifiée) dans une base PostgreSQL via Prisma, puis requêtes SQL pour reconstituer :

- les versions successives d'un article
- la chaîne des amendements (auteur, groupe, statut, dates)
- les stats agrégées (nb amendements, nb députés, votes, débats)
- le score d'influence par député sur un article donné

**Pas de version-control (git) côté données** — git n'intervient nulle part dans le pipeline : la métaphore "GitHub de la loi" est purement une UX, pas une implémentation.

| Couche | Techno |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Tailwind CSS, shadcn/ui (Radix), lucide-react |
| ORM / DB | Prisma + PostgreSQL |
| Files d'attente | BullMQ + Redis (ioredis) |
| Validation | Zod |
| Tests | Vitest |
| Diagrammes | React Flow |

---

## Sources de données

Catalogue de référence : [Hackathon AN 2026 — Ressources](https://hackathon2026.assemblee-nationale.fr/ressources)

| Catégorie | Source | Format | Périmètre |
|---|---|---|---|
| Dossiers législatifs | [data.assemblee-nationale.fr](https://data.assemblee-nationale.fr/travaux-parlementaires/dossiers-legislatifs) | XML/JSON | XVIIe législature (+ XIV-XVI) |
| Dossiers législatifs | [data.senat.fr/dosleg](https://data.senat.fr/dosleg/) | PostgreSQL | depuis oct. 1977 |
| Dossiers législatifs | Légifrance (DOLE, via data.gouv.fr) | XML | depuis juin 2002 |
| Amendements (source principale) | [data.assemblee-nationale.fr — tous les amendements](https://data.assemblee-nationale.fr/travaux-parlementaires/amendements/tous-les-amendements) | XML/JSON | toutes lectures, XVIIe législature |
| Amendements | [data.senat.fr/ameli](https://data.senat.fr/ameli/) | PostgreSQL | temps réel, depuis 2001/2010 |
| Députés en exercice | [data.assemblee-nationale.fr — deputes-en-exercice](https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice) | CSV/XML | depuis le 8 juillet 2024 |
| Historique des députés | [data.assemblee-nationale.fr — historique-des-deputes](https://data.assemblee-nationale.fr/acteurs/historique-des-deputes) | XML/JSON | depuis juin 1997 |
| Base unifiée (à évaluer) | Base PostgreSQL AN + Sénat + Légifrance + Service Public | PostgreSQL | XIVe législature+ |
| API unifiée | [tricoteuses.fr — api-canutes-legifrance](https://www.tricoteuses.fr/services/api-canutes-legifrance/documentation) | REST JSON | — |

---

## Prochaines étapes

> [!NOTE]
> **TODO** : à compléter (roadmap technique — choix du schéma Postgres, requêtes SQL clés, branchement du front, résumé IA / score d'influence).

---

## Contributions

Projet développé dans le cadre du **Hackathon Assemblée nationale 2026**.
