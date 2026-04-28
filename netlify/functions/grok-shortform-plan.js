const ANIMATIONS = ["zoomIn", "zoomOut", "panLeft", "panRight", "wobble", "pulse", "ken", "none"];
const EFFECTS = [
  "none",
  "stars",
  "sparkle",
  "hearts",
  "dream",
  "neon",
  "sunset",
  "mono",
  "snow",
  "rain",
  "comic",
  "vintage",
  "ocean",
  "aurora",
  "fireworks",
  "bloom",
  "film",
  "cyber",
  "dust",
  "glitch",
  "spotlight",
  "pastel",
  "lava",
  "forest",
  "ice",
  "noir",
  "sepia",
];

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

function extractJsonObject(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_) {}
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch (_) {}
  }
  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return json(500, { error: "XAI_API_KEY 환경변수가 없습니다." });
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch (_) {
    return json(400, { error: "잘못된 JSON 요청입니다." });
  }

  const prompt = String(body.prompt || "").trim();
  const sceneCount = Math.max(1, Math.min(60, Number(body.sceneCount) || 1));
  if (!prompt) {
    return json(400, { error: "prompt가 비어 있습니다." });
  }

  const systemPrompt = [
    "너는 한국어 숏폼 기획자다.",
    "반드시 JSON만 반환해라. 마크다운/설명 금지.",
    `animation은 ${ANIMATIONS.join(", ")} 중 하나만 사용.`,
    `effect는 ${EFFECTS.join(", ")} 중 하나만 사용.`,
    "형식:",
    '{"scenes":[{"text":"짧은 자막","animation":"zoomIn","effect":"sparkle","stickerEmojis":["✨","💖"]}]}',
  ].join("\n");

  const userPrompt = [
    `주제: ${prompt}`,
    `장면 수: ${sceneCount}`,
    "조건:",
    "- 장면 개수와 동일하게 scenes를 만든다.",
    "- 각 text는 16자 내외 한국어 자막으로 간결하게 쓴다.",
    "- stickerEmojis는 장면당 0~3개.",
  ].join("\n");

  const resp = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    return json(resp.status, { error: `Grok API 오류: ${t || resp.statusText}` });
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "";
  const parsed = extractJsonObject(content);
  if (!parsed || !Array.isArray(parsed.scenes)) {
    return json(502, { error: "Grok 응답 파싱 실패", raw: content });
  }

  return json(200, {
    scenes: parsed.scenes.slice(0, sceneCount),
  });
};
