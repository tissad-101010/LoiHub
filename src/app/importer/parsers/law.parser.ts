function safeJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

function toArray(value: unknown): unknown[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function cleanText(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (typeof value === "object") {
    if (typeof (value as Record<string, unknown>)["#text"] === "string") return cleanText((value as Record<string, unknown>)["#text"]);
    if (typeof (value as Record<string, unknown>).texte === "string") return cleanText((value as Record<string, unknown>).texte);
    if (typeof (value as Record<string, unknown>).contenu === "string") return cleanText((value as Record<string, unknown>).contenu);
  }

  return "";
}

function extractArticleContent(article: unknown): string {
  const articleObj = article as Record<string, unknown>;
  const direct =
    cleanText(articleObj?.contenu) ||
    cleanText(articleObj?.texte) ||
    cleanText(articleObj?.corps) ||
    cleanText(articleObj?.alineas);

  if (direct) return direct;

  const alineas = toArray((articleObj?.alineas as Record<string, unknown>)?.alinea ?? articleObj?.alinea);

  return alineas
    .map((a: unknown) => cleanText(a))
    .filter(Boolean)
    .join("\n");
}

function extractArticlesFromAnyShape(document: unknown) {
  const results: Array<{uid: unknown; number: unknown; title: unknown; content: string; raw: unknown}> = [];

  function walk(value: unknown) {
    if (!value || typeof value !== "object") return;

    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }

    const valueObj = value as Record<string, unknown>;
    const articlesProp = (valueObj?.articles) as unknown;
    const hasIterator =
      articlesProp && typeof (articlesProp as Iterable<unknown>)[Symbol.iterator] === "function";
    const articles = hasIterator ? (articlesProp as Record<string, unknown>)?.article : valueObj?.article;

    if (articles) {
      for (const article of toArray(articles)) {
        if (!article || typeof article !== "object") continue;

        const content = extractArticleContent(article);

        if (content) {
          const articleObj = article as Record<string, unknown>;
          results.push({
            uid: articleObj.uid ?? articleObj.id ?? articleObj["@id"] ?? null,
            number:
              articleObj.num ??
              articleObj.numero ??
              articleObj.ordre ??
              articleObj["@id"] ??
              articleObj.titre ??
              null,
            title:
              articleObj.titre ??
              articleObj.libelle ??
              articleObj.designation ??
              null,
            content,
            raw: safeJson(article),
          });
        }
      }
    }

    for (const child of Object.values(valueObj)) {
      walk(child);
    }
  }

  walk(document);

  const seen = new Set<string>();

  return results.filter((article) => {
    const key = `${article.uid ?? ""}-${article.number ?? ""}-${article.content}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseLaw(raw: unknown) {
  const rawObj = raw as Record<string, unknown>;
  const d = rawObj?.document;
  if (!d || typeof d !== "object") return null;

  const dObj = d as Record<string, unknown>;
  const externalId =
    dObj.uid ??
    dObj.id ??
    dObj["@uid"] ??
    (dObj.notice as Record<string, unknown>)?.numNotice ??
    null;

  if (!externalId) return null;

  const title =
    (dObj.titres as Record<string, unknown>)?.titrePrincipal ??
    dObj.titrePrincipal ??
    dObj.title ??
    dObj.titre ??
    (dObj.notice as Record<string, unknown>)?.titre ??
    String(externalId);

  const description =
    (dObj.titres as Record<string, unknown>)?.titrePrincipalCourt ??
    dObj.description ??
    (dObj.notice as Record<string, unknown>)?.formule ??
    null;

  const content =
    cleanText(dObj.contenu) ||
    cleanText(dObj.texte) ||
    cleanText(dObj.expose) ||
    JSON.stringify(d);

  const articles = extractArticlesFromAnyShape(d);

  return {
    uid: String(externalId),
    externalId: String(externalId),
    title: String(title).trim(),
    description: description ? String(description).trim() : null,
    content,
    articles,
    raw: safeJson(raw),
  };
}