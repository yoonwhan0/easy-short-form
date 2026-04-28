function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

function uniq(list) {
  return [...new Set(list.filter(Boolean))];
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    return json(500, { error: "PIXABAY_API_KEY 환경변수가 없습니다." });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (_) {
    return json(400, { error: "잘못된 JSON 요청입니다." });
  }

  const count = Math.max(1, Math.min(30, Number(body.count) || 6));
  const aiPrompt = String(body.aiPrompt || "").trim();
  const keywords = Array.isArray(body.keywords)
    ? body.keywords.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 8)
    : [];
  const mergedKeywords = uniq([...keywords, ...aiPrompt.split(/[,\n ]/).slice(0, 5)]).slice(0, 8);
  const query = mergedKeywords.length ? mergedKeywords.join(", ") : "kindergarten kids class";
  const endpoint = new URL("https://pixabay.com/api/");
  endpoint.searchParams.set("key", apiKey);
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("image_type", "photo");
  endpoint.searchParams.set("orientation", "vertical");
  endpoint.searchParams.set("safesearch", "true");
  endpoint.searchParams.set("per_page", String(Math.max(10, count * 3)));

  const res = await fetch(endpoint.toString());
  if (!res.ok) {
    const msg = await res.text();
    return json(res.status, { error: `Pixabay API 오류: ${msg || res.statusText}` });
  }
  const data = await res.json();
  const hits = Array.isArray(data?.hits) ? data.hits : [];
  const items = hits
    .map((h) => ({
      url: h?.largeImageURL || h?.webformatURL || "",
      tags: String(h?.tags || ""),
    }))
    .filter((v) => v.url)
    .slice(0, count);
  return json(200, { items, query });
};
