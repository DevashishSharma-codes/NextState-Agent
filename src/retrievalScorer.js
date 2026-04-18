export function scoreRetrieval(result, action) {
  if (action?.type !== "search_web") {
    return {
      retrievalQuality: null,
      retrievalQualityReason: null
    };
  }

  // Expecting Tavily format, where rawToolResult is { results: [...] } or an array
  const rawData = result?.rawToolResult || {};
  const results = Array.isArray(rawData) ? rawData : (rawData.results || []);

  if (!results || results.length === 0) {
    return {
      retrievalQuality: 0.15,
      retrievalQualityReason: "No search results returned."
    };
  }

  let baseScore = 0.5;
  if (results.length === 1) baseScore = 0.35;
  else if (results.length <= 3) baseScore = 0.6;
  else baseScore = 0.8;

  // Simple heuristic checks on top titles/urls
  let genericCount = 0;
  const genericTerms = ["latest news", "home", "category", "insights", "news portal"];

  for (const r of results) {
    const title = (r.title || "").toLowerCase();
    const url = (r.url || "").toLowerCase();
    
    const isGeneric = genericTerms.some(term => title.includes(term)) || url.endsWith(".com") || url.endsWith(".org") || url.endsWith(".net");
    if (isGeneric) {
      genericCount++;
    }
  }

  let finalScore = baseScore;
  let reason = `Found ${results.length} decent results.`;

  if (genericCount > 0) {
    finalScore = Math.max(0.1, finalScore - (genericCount * 0.1));
    reason = `Relevant results were found, but ${genericCount} top result(s) seem to be generic portals or homepages.`;
  } else {
    reason = `Found ${results.length} specific article-like results.`;
  }

  // Ensure it's between 0 and 1
  finalScore = Math.max(0, Math.min(1, finalScore));

  return {
    retrievalQuality: Number(finalScore.toFixed(2)),
    retrievalQualityReason: reason
  };
}
