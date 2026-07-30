# Rattachement scrutin -> amendement précis.
# Le titre d'un scrutin cite « l'amendement n° X de M./Mme NOM ... ».
# On matche sur le triplet (dossier, numéro, nom de famille de l'auteur) et on
# n'accepte QUE les correspondances uniques — l'exactitude prime sur la couverture.
import re
import unicodedata
from collections import defaultdict

def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]+", " ", s.lower().replace("’", "'")).strip()

# amendements indexés par (dossierUid, numero)
amdts = defaultdict(list)
for line in open("amendements.tsv", encoding="utf-8"):
    p = line.rstrip("\n").split("\t")
    if len(p) != 4:
        continue
    uid, dossier, numero, auteur = p
    amdts[(dossier, numero)].append((uid, norm(auteur)))

# « l'amendement n° 2194 (rect.) de Mme Sylvie Bonnet ... » -> (2194, "sylvie bonnet")
RX = re.compile(
    r"l'amendement n° ?(\d+)(?: \(rect\.?\))? de (?:M\.|Mme|M) ([^,(]+?)"
    r"(?: et (?:l'amendement|les amendements)| à | après | avant | de suppression| au | aux |,|\()",
    re.IGNORECASE,
)

liens = {}
stats = {"pas_regex": 0, "pas_candidat": 0, "ambigu": 0, "ok": 0}
for line in open("scrutins_amdt.tsv", encoding="utf-8"):
    p = line.rstrip("\n").split("\t")
    if len(p) != 3:
        continue
    suid, dossier, titre = p
    m = RX.search(titre.replace("’", "'"))
    if not m:
        stats["pas_regex"] += 1
        continue
    numero, auteur_cite = m.group(1), norm(m.group(2))
    candidats = amdts.get((dossier, numero), [])
    if not candidats:
        stats["pas_candidat"] += 1
        continue
    # nom de famille = dernier mot du nom cité ; il doit apparaître dans le nom en base
    nom_famille = auteur_cite.split()[-1] if auteur_cite else ""
    retenus = [uid for uid, a in candidats if nom_famille and nom_famille in a]
    # cas « le Gouvernement » : auteur non député -> nom vide en base
    if not retenus and "gouvernement" in auteur_cite:
        retenus = [uid for uid, a in candidats if a == ""]
    if len(set(retenus)) == 1:
        liens[suid] = retenus[0]
        stats["ok"] += 1
    elif len(set(retenus)) > 1:
        stats["ambigu"] += 1
    else:
        stats["pas_candidat"] += 1

print(stats)
with open("update_amdt_scrutins.sql", "w", encoding="utf-8") as f:
    f.write("BEGIN;\n")
    for suid, auid in liens.items():
        f.write(f"UPDATE \"Scrutin\" SET \"amendementUid\" = '{auid}' WHERE uid = '{suid}';\n")
    f.write("COMMIT;\n")
print("SQL généré :", len(liens), "liens")
