### Nom du défi
LoiHub, Le Hub de la loi

### Description courte
LoiHub est une plateforme qui permet d’explorer les lois françaises comme si elles étaient du code source versionné.

### Porteur
Tahar Issad, FullStack Developer/Software Engineer student @42Paris

### URL de démonstration
https://loihub.retrystudio.com/

### Description longue
**Contexte**

Aujourd’hui, une loi est difficile à lire dans son ensemble : elle évolue au fil des amendements, des débats, des votes et des navettes parlementaires. Ces informations existent, mais elles sont dispersées et peu lisibles pour le citoyen.

LoiHub réunit tout cela dans une interface unique et compréhensible, inspirée des outils de développement comme Git.

**Objectif**

Rendre le processus législatif transparent, traçable et intelligible, en montrant comment une loi se construit étape par étape.

**Concept clé** 
Chaque loi est transformée en un “repository” :

- un projet de loi = un dépôt
- un amendement adopté = un commit
- une modification de texte = un diff
- l’auteur d’un amendement = l’auteur du commit
- l’historique parlementaire = le git log

**Fonctionnalités principales**

- Visualisation des versions de la loi
Voir comment un texte évolue entre sa version initiale, les amendements et la version finale.
- Diff législatif
Afficher clairement ce qui a été ajouté, supprimé ou modifié dans un article de loi.
- Git blame législatif
En regard de chaque alinéa, la version du texte qui l’a introduit — dépôt, commission, séance, navette — et, lorsque la correspondance est certaine, l’amendement adopté et son auteur.
- Timeline interactive
Explorer la chronologie complète d’un texte : dépôt, commissions, séances, votes.
- Votes nominatifs
Les scrutins publics rattachés à chaque texte et à chaque amendement, avec la position de chaque député ventilée par groupe.
- Explications IA
Résumer les changements complexes en langage simple pour les citoyens.

**Périmètre des données**

Tout provient des jeux ouverts de l’Assemblée nationale, sans saisie manuelle : 2 926 dossiers
législatifs, 121 109 amendements, 577 députés, 7 979 scrutins publics et 1 215 050 positions de
vote nominatives. La lecture article par article, le diff et le blame supposent que l’Assemblée
ait publié le texte articulé du dossier : c’est le cas pour une partie d’entre eux, et l’interface
signale explicitement les autres plutôt que d’afficher une page vide.



### Image principale
![LoiHub](images/coverLH.png)

### Contributeurs
- Tahar Issad

### Ressources utilisées
<!-- Consigne du gabarit : cocher en remplaçant [ ] par [x]. -->

- [ ] `openfisca-france-parameters` — Base de données de paramètres ✺ OpenFisca
- [x] `an-dossiers-legislatifs` — Dossiers législatifs de l'Assemblée nationale (législature courante) ✺ Assemblée nationale
- [x] `an-amendements-xvii` — Amendements déposés à l'Assemblée nationale (législature actuelle) ✺ Assemblée nationale
- [ ] `an-comptes-rendus` — Comptes rendus de la séance publique à l'Assemblée nationale (législature actuelle) ✺ Assemblée nationale
- [x] `an-votes-xvii` — Votes des députés (législature actuelle) ✺ Assemblée nationale
- [x] `an-deputes-en-exercice` — Députés en exercice ✺ Assemblée nationale
- [x] `an-deputes-historique` — Historique des députés ✺ Assemblée nationale
- [ ] `an-deputes-senateurs-ministres-par-legislature` — Députés, sénateurs et ministres d'une législature ✺ Assemblée nationale
- [ ] `an-agenda-reunions` — Agenda des réunions à l'Assemblée nationale (législature courante) ✺ Assemblée nationale
- [ ] `an-questions-gouvernement` — Questions de l'Assemblée nationale au Gouvernement ✺ Assemblée nationale
- [ ] `an-questions-gouvernement-ecrites` — Questions écrites de l'Assemblée nationale au Gouvernement ✺ Assemblée nationale
- [ ] `an-questions-gouvernement-orales` — Questions orales de l'Assemblée nationale au Gouvernement ✺ Assemblée nationale
- [ ] `premier-ministre-legi` — Codes, lois et règlements consolidés ✺ Premier ministre
- [ ] `premier-ministre-dole` — Dossiers législatifs Légifrance ✺ Premier ministre
- [ ] `premier-ministre-jorf` — Édition ''Lois et décrets'' du Journal officiel ✺ Premier ministre
- [ ] `senat-dispositifs-textes` — Dispositifs des textes déposés ou adoptés au Sénat ✺ Sénat
- [ ] `senat-dossiers-legislatifs` — Dossiers législatifs du Sénat ✺ Sénat
- [ ] `senat-amendements` — Amendements déposés au Sénat ✺ Sénat
- [ ] `senat-senateurs` — Sénateurs ✺ Sénat
- [ ] `senat-questions-gouvernement` — Questions orales et écrites du Sénat au Gouvernement ✺ Sénat
- [ ] `senat-comptes-rendus` — Comptes rendus de la séance publique au Sénat ✺ Sénat
- [ ] `an-et-co-database-regroupement-toutes-donnees` — Base de données unifiée Parlement / Législation / Service Public ✺ Assemblée nationale & communauté
- [ ] `an-et-co-serveur-mcp-regroupement-toutes-donnees` — Serveur MCP - Accès unifié Parlement / Législation / Service Public ✺ Assemblée nationale & communauté
- [ ] `an-et-co-api-regroupement-toutes-donnees` — API - Accès unifié Parlement / Législation / Service Public ✺ Assemblée nationale & communauté
- [ ] `legiwatch-api-parlement` — API Parlement ✺ LegiWatch
- [ ] `legiwatch-database-parlement` — Base de données Parlement ✺ LegiWatch
- [ ] `legiwatch-serveur-mcp-parlement` — Serveur MCP Parlement ✺ LegiWatch

### Galerie
- ![LoiHub — explorer les lois comme du code source versionné](images/coverLH.png)
- ![Accueil : un diff législatif réel en page d'entrée, avec l'amendement qui l'a produit et son auteur](images/image-1.png)
- ![Page d'une loi : sommaire des articles, origine de chaque modification, comparaison de versions et parcours législatif](images/image-2.png)
- ![Les quatre entrées du projet : diff, blame, historique complet et explications en langage clair](images/image-3.png)

### Documents
- [Présentation LoiHub](docs/loihub-presentation.pdf)

<!-- VIDÉO DE DÉMONSTRATION — comment le site du hackathon la récupère.
     Le type du document est déduit de l'EXTENSION du fichier : rien d'autre à déclarer.

  Voie recommandée — une entrée de cette section « Documents » vers un .mp4 :
  la page du défi le rend en bloc vidéo 16/9 pleine largeur dans « Documents du
  défi », le traitement le plus visible de toute la fiche. Huit défis procèdent
  ainsi. Marche à suivre :
    1. exporter en .mp4 — sur 38 fiches lues, les 8 vidéos déclarées sont TOUTES
       en .mp4 ; aucun .webm, .mov, YouTube ou Vimeo observé, donc hors .mp4 on ne
       sait pas ce que le site fait
    2. déposer le fichier dans hackathon-an-2026/docs/, sans espace ni accent dans
       le nom, et le pousser AVANT d'ajouter la ligne ci-dessous
    3. ajouter au-dessus, dans cette section, la ligne :
           - [Vidéo de démonstration — parcours complet (~2 min)](docs/demo-loihub.mp4)
       Le libellé affiché est le texte ENTRE CROCHETS ; ce qui précède le crochet
       ouvrant est supprimé au rendu (LegisLens écrit « - 🎥 [Vidéo… ] » et l'emoji
       disparaît). Mettre la durée dans les crochets, comme les autres équipes.

  NE PAS ajouter la ligne avant que le fichier soit poussé : le site afficherait un
  document en lien mort.

  Autre emplacement, le champ dédié demoVideoUrl : il se remplit depuis la
  section « URL de démonstration » quand celle-ci pointe vers un fichier vidéo DU
  DÉPÔT en lien relatif, et non vers une URL absolue (seul défi à l'utiliser :
  codeberg.org/rvba/tablette-02). Notre section « URL de démonstration » contient
  l'URL de la démo en ligne, qui alimente demoUrl et produit le bouton
  « Démonstration » des livrables. Aucun défi n'ayant renseigné les deux champs à
  la fois, on ne sait pas si les faire cohabiter dans la même section fonctionne :
  à tester avant de sacrifier le lien vers la démo en ligne, plus utile qu'une
  vidéo pour un jury qui veut cliquer.

  Le PDF de présentation est volontairement référencé DEUX fois : ici, pour la
  carte de « Documents du défi », et dans « Diapositives de présentation »
  ci-dessous, qui alimente le bouton dédié des livrables. Ce n'est pas un oubli. -->

<!-- À FAIRE, BLOQUANT : docs/loihub-presentation.pdf fait 0 OCTET, y compris dans le
     commit publié (blob e69de29b, le blob vide de Git). La fiche en ligne propose
     donc déjà un document vide au téléchargement. Les DEUX champs ci-dessous le
     citent — la carte de « Documents du défi » et le bouton « Diapositives de la
     présentation » des livrables : tant que le fichier n'a pas de contenu, mieux
     vaut ne pas pousser la section ci-dessous, elle ne ferait qu'ajouter un second
     lien mort bien visible. -->

### Diapositives de présentation
[Diapositives de présentation (PDF)](docs/loihub-presentation.pdf)