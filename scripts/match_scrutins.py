# Rapprochement scrutin -> dossier par titre, normalisé (casse/accents/typo).
# Règle de prudence : on ne lie QUE si un seul dossier correspond (aucune ambiguïté).
import re
import unicodedata

def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")  # retire accents
    s = s.replace("’", "'").replace("œ", "oe")
    s = re.sub(r"[^a-z0-9]+", " ", s.lower())
    return s.strip()

dossiers = []
seen_titles = {}
for line in open("dossiers.tsv", encoding="utf-8"):
    parts = line.rstrip("\n").split("\t")
    if len(parts) != 2:
        continue
    uid, title = parts
    t = norm(title)
    if len(t) < 15:  # titres trop courts -> risque de faux positifs ("fin de vie" ok à 10... on garde >=15 prudent)
        continue
    dossiers.append((uid, t))
    seen_titles.setdefault(t, []).append(uid)

# titres de dossiers dupliqués -> jamais utilisés (ambigus par nature)
ambigus = {t for t, uids in seen_titles.items() if len(uids) > 1}
dossiers = [(u, t) for u, t in dossiers if t not in ambigus]

matches = {}
multi = 0
for line in open("scrutins_nolink.tsv", encoding="utf-8"):
    parts = line.rstrip("\n").split("\t")
    if len(parts) != 2:
        continue
    suid, titre = parts
    st = norm(titre)
    found = [duid for duid, dt in dossiers if dt in st]
    if len(found) == 1:
        matches[suid] = found[0]
    elif len(found) > 1:
        # si un titre est strictement plus long (plus spécifique) et unique, on le préfère
        cand = sorted(((duid, dt) for duid, dt in dossiers if dt in st), key=lambda x: -len(x[1]))
        if len(cand[0][1]) > len(cand[1][1]):
            matches[suid] = cand[0][0]
        else:
            multi += 1

print(f"scrutins non liés : 5827 | liés par titre unique : {len(matches)} | ambigus ignorés : {multi}")

with open("update_scrutins.sql", "w", encoding="utf-8") as f:
    f.write("BEGIN;\n")
    for suid, duid in matches.items():
        f.write(f"UPDATE \"Scrutin\" SET \"dossierUid\" = '{duid}' WHERE uid = '{suid}' AND \"dossierUid\" IS NULL;\n")
    f.write("COMMIT;\n")
print("update_scrutins.sql généré")
