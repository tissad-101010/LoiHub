# Scripts de qualité des données

Scripts ponctuels utilisés pour corriger les liens manquants dans les données
importées (le dump `docker/seed/loihub.sql.gz` intègre déjà leur résultat).

## `match_scrutins.py` — scrutins → dossiers

À l'import initial, 73 % des scrutins n'étaient rattachés à aucun dossier
législatif (`Scrutin.dossierUid` NULL). Ce script reconstruit le lien par
correspondance de titres **normalisés** (minuscules, sans accents), restreinte
aux dossiers de type `DossierLegislatif_Type`, et n'accepte une correspondance
que si elle est **unique** — les titres ambigus (ex. deux dossiers
« Nationalisation d'ArcelorMittal France ») sont volontairement laissés non liés.

Résultat : 4 339 scrutins rattachés (81 % de couverture). Les scrutins restants
sont majoritairement des motions de censure et déclarations du Gouvernement,
qui n'ont pas de dossier législatif.

## `match_amendements.py` — scrutins → amendements

Les titres de scrutins citent l'amendement voté (« l'amendement n° 452 de
M. Dupont… »). Le numéro seul est ambigu (il se répète d'une lecture à l'autre) :
le script matche sur le triplet **dossier + numéro + nom de famille de
l'auteur**, avec la même exigence d'unicité. Résultat : 3 453 scrutins liés à
leur amendement précis (`Scrutin.amendementUid`), affichés sur les fiches
amendement (« Le vote des députés sur cet amendement »).

## Usage

Les deux scripts lisent des exports TSV de la base (requêtes en tête de chaque
script) et génèrent un fichier SQL d'UPDATE à appliquer via `psql`. Ils sont
idempotents : relancer sur une base déjà corrigée ne change rien.
