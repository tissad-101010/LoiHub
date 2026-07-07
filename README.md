# LoiHub — le dépôt de la loi

> *Suivre une loi comme on suit un dépôt de code : parcours, diffs, amendements, contributeurs.*

LoiHub permet d'explorer les textes législatifs français comme s'ils étaient du code source versionné. Chaque projet ou proposition de loi devient un « dépôt » : on voit son parcours (dépôt → commission → lectures → adoption → promulgation), le diff ligne à ligne de chaque article, la chaîne des amendements (auteur, groupe, statut), les scrutins et la répartition des votes par groupe.

https://github.com/user-attachments/assets/5db2afaa-2ef0-4482-a698-9c5027bb22a2

Les données proviennent des **jeux de données ouverts de l'Assemblée nationale** (XVIIe législature). Il n'y a **pas de git** côté données : la métaphore « GitHub de la loi » est une UX, pas une implémentation — le backend reconstitue les versions successives d'un texte par des requêtes SQL sur une base PostgreSQL.

Projet initié lors du **Hackathon Assemblée nationale 2026** (voir [`hackathon-an-2026/`](hackathon-an-2026/)).

---

## Démarrage rapide (Docker)

Le seul prérequis est **Docker** (avec Docker Compose v2). La base est **automatiquement restaurée** depuis le dump versionné (`docker/seed/loihub.sql.gz`) — aucun import manuel à lancer.

```bash
make up
```

Cette commande :
1. démarre PostgreSQL et restaure le dump au premier lancement (amendements, députés, textes de loi, scrutins & votes, exposés des motifs, cosignataires) ;
2. démarre Meilisearch et **indexe la recherche** (lois / amendements / députés) ;
3. démarre le front Next.js.

Puis ouvrir **http://localhost:3000**.

### Autres commandes

| Commande | Effet |
|---|---|
| `make up` | Build + démarre toute la stack, indexe la recherche |
| `make down` | Arrête les conteneurs (**données conservées**) |
| `make re` | `down` puis `up` |
| `make fclean` | Arrête **et réinitialise la base** (le dump est re-restauré au prochain `up`) |
| `make index` | Ré-indexe la recherche à la demande, sans redémarrer la stack |

Sans `make`, l'équivalent de `make up` est `docker compose up -d --build --remove-orphans`.

### Variables d'environnement (optionnelles)

Toutes ont une valeur par défaut ; rien n'est requis pour démarrer.

| Variable | Défaut | Rôle |
|---|---|---|
| `APP_PORT` | `3000` | Port exposé du front |
| `MEILI_PORT` | `7700` | Port exposé de Meilisearch |
| `MEILI_MASTER_KEY` | `loihub-dev-master-key` | Clé maître Meilisearch |
| `MISTRAL_API_KEY` | — | Active le résumé d'amendement par IA (facultatif) |

---

## Structure du dépôt

```
.
├── docker-compose.yml      # stack complète : db + meilisearch + indexer + web
├── Makefile                # raccourcis (up / down / re / fclean / index)
├── docker/seed/            # dump PostgreSQL restauré automatiquement
├── hackathon-an-2026/      # contexte & présentation du projet
└── src/front/              # l'application (Next.js) — tout le code vit ici
```

L'application est **entièrement contenue dans [`src/front/`](src/front/)** (code, schéma Prisma, scripts d'indexation, Dockerfile).

---

## Stack technique

| Couche | Techno |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| UI | Tailwind CSS v4 · design inspiré du Système de Design de l'État (DSFR) |
| Base de données | PostgreSQL 17 · Prisma |
| Recherche | Meilisearch |
| Orchestration | Docker Compose |

---

## Fonctionnalités

- **Registre législatif** paginé — tous les dossiers de la législature, classés par volume d'amendements, avec recherche.
- **Page d'une loi** — en-tête (statut, dates, lien Légifrance), parcours législatif, répartition des votes par groupe, scrutins, décisions du Conseil constitutionnel.
- **Explorateur de texte** — sommaire Titre › Chapitre › Article ; à chaque étape du parcours, le texte de l'article **tel qu'il était** à cette date, avec le diff ligne à ligne introduit par rapport à la version précédente.
- **Amendements** — dispositif intégral, exposé des motifs, auteur, cosignataires, statut.
- **Députés** — annuaire, profil, bilan de votes et activité.
- **Recherche instantanée** sur les lois, amendements et députés (Meilisearch).

---

## Sources de données

Catalogue de référence : [Hackathon AN 2026 — Ressources](https://hackathon2026.assemblee-nationale.fr/ressources)

| Catégorie | Source |
|---|---|
| Dossiers législatifs | [data.assemblee-nationale.fr — dossiers-legislatifs](https://data.assemblee-nationale.fr/travaux-parlementaires/dossiers-legislatifs) |
| Amendements | [data.assemblee-nationale.fr — tous-les-amendements](https://data.assemblee-nationale.fr/travaux-parlementaires/amendements/tous-les-amendements) |
| Scrutins publics | [data.assemblee-nationale.fr — scrutins](https://data.assemblee-nationale.fr/travaux-parlementaires/votes) |
| Députés | [data.assemblee-nationale.fr — deputes-en-exercice](https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice) |

---

## Développement local (hors Docker)

Le chemin recommandé reste `make up`. Pour travailler directement sur le front, il faut néanmoins une base PostgreSQL et un Meilisearch accessibles (par ex. lancés via `docker compose up -d db meilisearch`) :

```bash
cd src/front
npm install
# renseigner DATABASE_URL, MEILI_HOST, MEILI_MASTER_KEY (voir docker-compose.yml)
npm run dev
```
