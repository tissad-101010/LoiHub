-- Index de performance sur les colonnes de jointure/filtre.
-- Postgres n'indexe pas les FK automatiquement -> sans ça, la page loi fait
-- un Seq Scan des ~121k amendements. Mesuré : dossier typique 35ms -> 0.36ms.
CREATE INDEX IF NOT EXISTS "Amendment_lawId_idx" ON "Amendment"("lawId");
CREATE INDEX IF NOT EXISTS "Amendment_authorId_idx" ON "Amendment"("authorId");
CREATE INDEX IF NOT EXISTS "Amendment_status_idx" ON "Amendment"("status");
CREATE INDEX IF NOT EXISTS "Law_dossierId_idx" ON "Law"("dossierId");
