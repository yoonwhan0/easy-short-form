const _EsfT = () => new Date().toISOString();
const _EsfZ = "[easyshortform]";
const esf =
  typeof globalThis !== "undefined" && globalThis.__ESF_LOG__
    ? globalThis.__ESF_LOG__
    : {
        t: _EsfT,
        d(m, d) {
          console.log(_EsfZ, _EsfT(), m, d !== undefined ? d : "");
        },
        i(m, d) {
          console.info(_EsfZ, _EsfT(), m, d !== undefined ? d : "");
        },
        w(m, d) {
          console.warn(_EsfZ, _EsfT(), m, d !== undefined ? d : "");
        },
        e(m, d) {
          console.error(_EsfZ, _EsfT(), m, d !== undefined ? d : "");
        },
      };

const W = 1080;
const H = 1920;

const canvas = document.getElementById("preview");
const ctx = canvas.getContext("2d");
const audioEl = document.getElementById("hiddenAudio");

const els = {
  images: document.getElementById("images"),
  music: document.getElementById("music"),
  fileList: document.getElementById("fileList"),
  btnPlay: document.getElementById("btnPlay"),
  btnStop: document.getElementById("btnStop"),
  timeLabel: document.getElementById("timeLabel"),
  sceneHint: document.getElementById("sceneHint"),
  sceneText: document.getElementById("sceneText"),
  sceneDur: document.getElementById("sceneDur"),
  sceneAnim: document.getElementById("sceneAnim"),
  sceneEffect: document.getElementById("sceneEffect"),
  sceneMediaScale: document.getElementById("sceneMediaScale"),
  sceneFont: document.getElementById("sceneFont"),
  stickerPalette: document.getElementById("stickerPalette"),
  btnStickerPlace: document.getElementById("btnStickerPlace"),
  btnClearStickers: document.getElementById("btnClearStickers"),
  timeline: document.getElementById("timeline"),
  btnRender: document.getElementById("btnRender"),
  status: document.getElementById("status"),
  dropZone: document.getElementById("dropZone"),
  btnOneClick: document.getElementById("btnOneClick"),
  sceneLiveMotion: document.getElementById("sceneLiveMotion"),
  layoutEditToggle: document.getElementById("layoutEditToggle"),
  layoutEditHint: document.getElementById("layoutEditHint"),
  sceneFontSize: document.getElementById("sceneFontSize"),
  audioFadeOutSec: document.getElementById("audioFadeOutSec"),
  mediaBaseScale: document.getElementById("mediaBaseScale"),
  aiPrompt: document.getElementById("aiPrompt"),
};

/** 스티커 팔레트 (유니코드 이모지 · API 불필요) */
const STICKER_EMOJIS = [
  "⭐",
  "🌟",
  "✨",
  "💫",
  "🔥",
  "💕",
  "💖",
  "💗",
  "💘",
  "🌸",
  "🌺",
  "🌷",
  "🌼",
  "🌻",
  "🍀",
  "🎀",
  "🎁",
  "🎉",
  "🎊",
  "🎈",
  "🏆",
  "👑",
  "💎",
  "✅",
  "💯",
  "👍",
  "👏",
  "🙌",
  "🤍",
  "💙",
  "💜",
  "🧡",
  "💛",
  "💚",
  "🌈",
  "☁️",
  "⛅",
  "🌙",
  "⚡",
  "☕",
  "🍰",
  "🧁",
  "🍭",
  "🍬",
  "🐻",
  "🐰",
  "🐶",
  "🐱",
  "🦄",
  "🦋",
  "🐝",
  "❤️",
  "🧸",
  "📸",
  "🎵",
  "🎶",
  "✈️",
  "🚗",
  "⛱️",
  "🏖️",
  "🎬",
  "📌",
  "💬",
  "✍️",
  "🫶",
  "😊",
  "😍",
  "🥳",
  "🤩",
  "😎",
  "🙏",
];

/** 미리보기+서버번들 TTF (패밀리명은 Google Fonts와 동일) */
const FONT_CATALOG = [
  { family: "Jua", label: "주아 · 둥글" },
  { family: "Gaegu", label: "개구 · 손글씨" },
  { family: "Dongle", label: "동글 · 심플" },
  { family: "Kirang Haerang", label: "기랑해랑 · 튀는 손글씨" },
  { family: "Hi Melody", label: "하이멜로디" },
  { family: "Mochiy Pop One", label: "모찌 팝 · 둥근 팝" },
  { family: "Bagel Fat One", label: "베이글 팻" },
  { family: "Gamja Flower", label: "감자꽃" },
  { family: "Single Day", label: "싱글 데이" },
  { family: "Poor Story", label: "풀 스토리" },
  { family: "Nanum Pen Script", label: "나눔펜" },
  { family: "Nanum Brush Script", label: "나눔붓 · 붓" },
  { family: "Yeon Sung", label: "연성" },
  { family: "Diphylleia", label: "디필레아 · 세리프" },
  { family: "Gowun Dodum", label: "고운돋움" },
  { family: "Gowun Batang", label: "고운바탕" },
  { family: "Orbit", label: "오빗 · 둥근 고딕" },
  { family: "Sunflower", label: "해바라기" },
  { family: "Do Hyeon", label: "도현" },
  { family: "Black Han Sans", label: "블랙한산 · 제목" },
];

const FONT_LOAD_SAMPLE = "숏폼가나다라마바123 Cute!";

const ANIM_CATALOG = [
  { value: "zoomIn", label: "줌 인" },
  { value: "zoomOut", label: "줌 아웃" },
  { value: "panLeft", label: "팬 왼쪽" },
  { value: "panRight", label: "팬 오른쪽" },
  { value: "wobble", label: "출렁·줌 (역동)" },
  { value: "pulse", label: "맥박·줌 (역동)" },
  { value: "ken", label: "강한 줌인" },
  { value: "none", label: "없음" },
];

let fontsReadyPromise = null;

const EFFECT_OPTIONS = [
  { value: "none", label: "없음" },
  { value: "stars", label: "별빛·비네" },
  { value: "sparkle", label: "반짝 글리터" },
  { value: "hearts", label: "하트·핑크" },
  { value: "dream", label: "몽환 퍼플" },
  { value: "neon", label: "네온" },
  { value: "sunset", label: "노을" },
  { value: "mono", label: "흑백 필름" },
  { value: "snow", label: "눈 내림" },
  { value: "rain", label: "빗방울 느낌" },
  { value: "comic", label: "코믹·grain" },
  { value: "vintage", label: "빈티지" },
  { value: "ocean", label: "오션 블루" },
  { value: "aurora", label: "오로라 웨이브" },
  { value: "fireworks", label: "불꽃 파티클" },
  { value: "bloom", label: "블룸 하이라이트" },
  { value: "film", label: "필름 그레인+스크래치" },
  { value: "cyber", label: "사이버 스캔라인" },
  { value: "dust", label: "먼지 보케" },
  { value: "glitch", label: "글리치 RGB 분리" },
  { value: "spotlight", label: "스포트라이트" },
  { value: "pastel", label: "파스텔 워시" },
  { value: "lava", label: "라바 레드" },
  { value: "forest", label: "포레스트 그린" },
  { value: "ice", label: "아이스 민트" },
  { value: "noir", label: "누아르 콘트라스트" },
  { value: "sepia", label: "세피아 클래식" },
];

let placementMode = false;
let pendingStickerEmoji = null;

/** 미리보기 정지 + 체크 시: 자막·스티커 드래그·휠 크기 */
let layoutEditMode = false;
/** @type {null | (object & { ptrId: number })} */
let layoutDrag = null;
let fontSizePrimeTimer = null;

/** @type {{ width: number, height: number, scenes: any[], mediaFiles: File[], audioFile: File | null }} */
const project = {
  width: W,
  height: H,
  scenes: [],
  mediaFiles: [],
  audioFile: null,
  audioFadeOutSec: 2,
  mediaBaseScale: 100,
};

let selectedIndex = -1;
let playing = false;
let raf = 0;
/** 정지/일시정지 시점의 재생 위치(초) */
let cursorSec = 0;
/** 무음 재생: 재생 시작 시각 */
let playStartMono = 0;

const captions = [
  "오늘의 특별한 순간",
  "즐거운 하루 시작",
  "함께라서 더 좋아요",
  "행복한 추억 만들기",
  "소중한 시간",
  "웃음 가득한 하루",
];
const RANDOM_ANIMS = ["zoomIn", "zoomOut", "panLeft", "panRight", "wobble", "pulse", "ken"];

function tplStyle(name) {
  const base = {
    x: W / 2,
    y: H * 0.78,
    fontSize: 58,
    align: "center",
    fontFamily: "Jua",
    liveMotion: true,
  };
  if (name === "bright") {
    return {
      ...base,
      color: "#1a1a1a",
      bgColor: "rgba(255,255,255,0.78)",
      fontFamily: "Dongle",
      fontSize: 62,
    };
  }
  if (name === "kids") {
    return {
      ...base,
      fontSize: 64,
      color: "#fff9c4",
      bgColor: "rgba(183,28,28,0.5)",
      fontFamily: "Gaegu",
    };
  }
  return { ...base, color: "#ffffff", bgColor: "rgba(0,0,0,0.5)", fontFamily: "Jua" };
}

function getDynamicDurations(total, count) {
  const base = total / count;
  const arr = Array.from({ length: count }, () => base + base * (Math.random() * 0.4 - 0.2));
  const sum = arr.reduce((a, b) => a + b, 0);
  return arr.map((d) => (d * total) / sum);
}

function autoCaption(i) {
  return captions[i % captions.length];
}

function sanitizeAiPlan(raw, sceneCount) {
  if (!raw || typeof raw !== "object") return null;
  const scenes = Array.isArray(raw.scenes) ? raw.scenes.slice(0, sceneCount) : [];
  if (!scenes.length) return null;
  return scenes.map((item, i) => {
    const text = typeof item?.text === "string" && item.text.trim() ? item.text.trim() : autoCaption(i);
    const animation = ANIM_CATALOG.some((a) => a.value === item?.animation) ? item.animation : pickAnimation(i);
    const effect = EFFECT_OPTIONS.some((e) => e.value === item?.effect) ? item.effect : "none";
    const stickerEmojis = Array.isArray(item?.stickerEmojis)
      ? item.stickerEmojis.filter((v) => typeof v === "string" && v.trim()).slice(0, 3)
      : [];
    return { text, animation, effect, stickerEmojis };
  });
}

async function requestAiShortformPlan() {
  const userPrompt = String(els.aiPrompt?.value || "").trim();
  const mediaCount = project.mediaFiles.length;
  if (!userPrompt || mediaCount <= 0) return null;
  const payload = {
    prompt: userPrompt,
    sceneCount: mediaCount,
  };
  const res = await fetch("/.netlify/functions/grok-shortform-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`AI 요청 실패 (${res.status}): ${msg || "서버 오류"}`);
  }
  const data = await res.json();
  return sanitizeAiPlan(data, mediaCount);
}

function pickAnimation(i) {
  return RANDOM_ANIMS[i % RANDOM_ANIMS.length];
}

function escapeFontFamily(family) {
  return String(family || "Jua").replace(/["\\]/g, "");
}

function makeFontStack(size, family) {
  const f = escapeFontFamily(family);
  return `${size}px "${f}", "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
}

async function ensureFontsLoaded() {
  if (fontsReadyPromise) return fontsReadyPromise;
  fontsReadyPromise = (async () => {
    if (!document.fonts || !document.fonts.load) {
      return;
    }
    const jobs = [];
    const sizes = [24, 32, 40, 48, 56, 64, 72, 80, 96, 110, 128];
    for (const fam of FONT_CATALOG) {
      const f = escapeFontFamily(fam.family);
      for (const size of sizes) {
        const spec = `${size}px "${f}"`;
        jobs.push(
          document.fonts.load(spec, FONT_LOAD_SAMPLE).catch(() => {}),
          document.fonts.load(spec).catch(() => {}),
        );
      }
    }
    await Promise.all(jobs);
    try {
      await document.fonts.ready;
    } catch (e) {
      esf.d("ensureFonts:fonts.ready (ignored)", String(e));
    }
    esf.d("ensureFonts:done", { families: FONT_CATALOG.length });
  })();
  return fontsReadyPromise;
}

async function loadFontFamily(family, fontSize) {
  if (!document.fonts?.load || !family) return;
  const f = escapeFontFamily(family);
  const sizeSet = new Set([20, 32, 40, 48, 56, 64, 72, 80, 96, 110, 120, 144, 160, 200]);
  if (fontSize != null) {
    const c = Math.max(20, Math.min(200, Math.round(Number(fontSize) || 56)));
    for (let d = -12; d <= 12; d += 4) {
      const s = c + d;
      if (s >= 20 && s <= 200) sizeSet.add(s);
    }
  }
  const sizes = [...sizeSet].sort((a, b) => a - b);
  for (const size of sizes) {
    const spec = `${size}px "${f}"`;
    await document.fonts.load(spec, FONT_LOAD_SAMPLE).catch(() => {});
    await document.fonts.load(spec).catch(() => {});
  }
  try {
    await document.fonts.ready;
  } catch (e) {
    esf.d("loadFontFamily:fonts.ready (ignored)", String(e));
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  esf.d("loadFontFamily:done", { family: f, sizeSteps: sizes.length, fontSizeHint: fontSize });
}

function revokeScenes() {
  for (const sc of project.scenes) {
    if (sc.objectUrl) {
      try {
        URL.revokeObjectURL(sc.objectUrl);
      } catch (e) {
        esf.d("revokeObjectURL (ignored)", String(e));
      }
    }
    if (sc.videoEl) {
      try {
        sc.videoEl.pause();
        sc.videoEl.removeAttribute("src");
        sc.videoEl.load();
      } catch (e) {
        esf.d("videoEl cleanup (ignored)", String(e));
      }
    }
  }
  project.scenes = [];
}

function loadMediaIntoScene(sc) {
  if (sc.type === "video") {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.src = sc.objectUrl;
    sc.videoEl = v;
    sc.img = null;
    return new Promise((res) => {
      v.addEventListener(
        "loadeddata",
        () => {
          sc.ready = true;
          res();
        },
        { once: true },
      );
      v.addEventListener(
        "error",
        () => {
          esf.w("loadMedia:video error", { name: sc.file?.name, type: sc.type });
          res();
        },
        { once: true },
      );
    });
  }
  const im = new Image();
  im.decoding = "async";
  im.src = sc.objectUrl;
  sc.img = im;
  sc.videoEl = null;
  return new Promise((res) => {
    im.onload = () => {
      sc.ready = true;
      res();
    };
    im.onerror = () => {
      esf.w("loadMedia:image error", { name: sc.file?.name, type: sc.type });
      res();
    };
  });
}

async function buildScenesFromDuration(totalSec, files) {
  esf.d("buildScenesFromDuration:start", {
    totalSec,
    fileCount: files.length,
    names: [...files].map((f) => f.name),
  });
  try {
    revokeScenes();
    selectedIndex = -1;
    const list = [...files];
    if (!list.length) {
      esf.w("buildScenesFromDuration:no files after spread");
      return;
    }

    const durs = getDynamicDurations(totalSec, list.length);
    let t = 0;
    project.scenes = list.map((file, i) => {
      const isVid = file.type.startsWith("video");
      const sc = {
        type: isVid ? "video" : "image",
        file,
        objectUrl: URL.createObjectURL(file),
        start: t,
        duration: durs[i],
        text: autoCaption(i),
        animation: pickAnimation(i),
        transition: "fade",
        textStyle: { ...tplStyle("mood") },
        effect: "none",
        mediaScale: null, // null이면 전역 기본값(project.mediaBaseScale) 사용
        stickers: [],
        img: null,
        videoEl: null,
        ready: false,
      };
      t += durs[i];
      return sc;
    });

    await Promise.all(project.scenes.map((s) => loadMediaIntoScene(s)));
    renderFileList();
    renderTimeline();
    selectScene(0);
    drawFrame(0);
    esf.i("buildScenesFromDuration:done", {
      sceneCount: project.scenes.length,
      types: project.scenes.map((s) => s.type),
      durs: project.scenes.map((s) => s.duration),
    });
  } catch (e) {
    esf.e("buildScenesFromDuration:failed", e);
    throw e;
  }
}

function getAudioDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    a.preload = "metadata";
    a.src = url;
    const done = (sec) => {
      URL.revokeObjectURL(url);
      resolve(sec);
    };
    a.addEventListener("loadedmetadata", () => {
      const d = a.duration;
      done(Number.isFinite(d) && d > 0 ? d : 24);
    });
    a.addEventListener(
      "error",
      () => {
        esf.w("getAudioDuration:audio metadata error, fallback 24s", { name: file?.name });
        done(24);
      },
      { once: true },
    );
  });
}

function totalDuration() {
  return project.scenes.reduce((s, sc) => s + sc.duration, 0) || 0.01;
}

function sceneAtTime(globalT) {
  let acc = 0;
  for (let i = 0; i < project.scenes.length; i++) {
    const d = project.scenes[i].duration;
    if (globalT < acc + d) {
      return { index: i, local: globalT - acc };
    }
    acc += d;
  }
  const last = Math.max(0, project.scenes.length - 1);
  return { index: last, local: 0 };
}

function clampAudioFadeOutSec(v) {
  return Math.max(0, Math.min(30, Number(v) || 0));
}

function clampMediaBaseScale(v) {
  return Math.max(50, Math.min(120, Number(v) || 100));
}

function clampSceneMediaScale(v) {
  return Math.max(10, Math.min(200, Number(v) || 100));
}

function populateSceneMediaScaleSelect() {
  if (!els.sceneMediaScale) return;
  els.sceneMediaScale.innerHTML = "";
  const d = document.createElement("option");
  d.value = "";
  d.textContent = "기본값(왼쪽 전체)";
  els.sceneMediaScale.appendChild(d);
  for (let p = 10; p <= 200; p += 10) {
    const o = document.createElement("option");
    o.value = String(p);
    o.textContent = `${p}%`;
    els.sceneMediaScale.appendChild(o);
  }
}

function applyAudioFadeAtTime(currentSec, maxSec) {
  const fade = clampAudioFadeOutSec(project.audioFadeOutSec);
  if (!audioEl) return;
  if (fade <= 0 || !Number.isFinite(maxSec) || maxSec <= 0) {
    audioEl.volume = 1;
    return;
  }
  const remain = Math.max(0, maxSec - Math.max(0, currentSec));
  if (remain >= fade) {
    audioEl.volume = 1;
  } else {
    audioEl.volume = Math.max(0, Math.min(1, remain / fade));
  }
}

function drawRoundedRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 장면 인덱스 기준 고정 난수로 반짝 위치 고정 */
function drawOverlayEffect(sc, sceneIndex, globalT, localSec) {
  const eff = sc.effect || "none";
  const seed = sceneIndex * 977 + 1337;
  const rnd = mulberry32(seed);

  if (eff === "stars") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const twinkle = globalT * 3;
    for (let i = 0; i < 90; i++) {
      const x = rnd() * W;
      const y = rnd() * H * 0.72;
      const phase = rnd() * Math.PI * 2;
      const w = 0.35 + rnd() * 0.65;
      const alpha = 0.15 + w * 0.55 * (0.5 + 0.5 * Math.sin(twinkle + phase));
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + rnd() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.72);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,15,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "sparkle") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const t = globalT * 4 + localSec;
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W;
      const y = rnd() * H * 0.85;
      const pulse = 0.5 + 0.5 * Math.sin(t + i * 0.7);
      ctx.fillStyle = `rgba(255,230,120,${0.12 + pulse * 0.35})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + rnd() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (eff === "hearts") {
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "rgba(255,182,193,0.15)");
    g.addColorStop(1, "rgba(255,105,180,0.12)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 0.35;
    ctx.font = `${42 + rnd() * 28}px "Segoe UI Emoji","Apple Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < 18; i++) {
      const x = rnd() * W;
      const y = rnd() * H * 0.65 + H * 0.12;
      const bob = Math.sin(globalT * 2 + i) * 10;
      ctx.fillText("♥", x, y + bob);
    }
    ctx.restore();
    return;
  }

  if (eff === "dream") {
    const g = ctx.createRadialGradient(W / 2, H * 0.35, 40, W / 2, H / 2, H * 0.65);
    g.addColorStop(0, "rgba(180,160,255,0.18)");
    g.addColorStop(0.5, "rgba(120,90,200,0.08)");
    g.addColorStop(1, "rgba(20,10,60,0.22)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "neon") {
    ctx.save();
    const g = ctx.createLinearGradient(0, H * 0.55, W, H);
    g.addColorStop(0, "rgba(0,255,255,0.1)");
    g.addColorStop(0.5, "rgba(255,0,200,0.12)");
    g.addColorStop(1, "rgba(0,80,255,0.1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 20; i++) {
      const y = H * 0.7 + Math.sin(globalT * 3 + i * 0.7) * 50;
      ctx.strokeStyle = `rgba(0,255,255,${0.12 + 0.08 * Math.sin(globalT * 2 + i)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y * 0.97);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (eff === "sunset") {
    const g = ctx.createLinearGradient(0, H * 0.25, 0, H);
    g.addColorStop(0, "rgba(255,200,120,0.4)");
    g.addColorStop(0.45, "rgba(255,100,140,0.25)");
    g.addColorStop(1, "rgba(40,20,70,0.42)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "mono") {
    ctx.save();
    ctx.fillStyle = "#889";
    ctx.globalCompositeOperation = "color";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    return;
  }

  if (eff === "snow") {
    ctx.save();
    const t = globalT * 55;
    for (let i = 0; i < 120; i++) {
      const x = ((i * 137 + t * (0.4 + rnd())) % (W + 80)) - 40;
      const y = ((i * 211 + t * 1.8 * rnd()) % (H + 60)) - 30;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath();
      ctx.arc(x, y, 1 + rnd() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (eff === "rain") {
    ctx.save();
    ctx.strokeStyle = "rgba(190,210,255,0.38)";
    ctx.lineWidth = 2;
    const t = globalT * 380;
    for (let i = 0; i < 90; i++) {
      const x = (i * 53 + t * 0.35) % (W + 80) - 40;
      const y = (i * 97 + t * 1.2) % (H + 100);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 16, y + 42);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (eff === "comic") {
    ctx.save();
    ctx.globalAlpha = 0.16;
    for (let i = 0; i < 480; i++) {
      ctx.fillStyle = rnd() > 0.5 ? "#000" : "#fff";
      ctx.fillRect(rnd() * W, rnd() * H, 2 + rnd() * 4, 2 + rnd() * 4);
    }
    ctx.restore();
    return;
  }

  if (eff === "vintage") {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.88);
    g.addColorStop(0, "rgba(255,230,200,0.14)");
    g.addColorStop(1, "rgba(60,35,15,0.28)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "ocean") {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(0,200,230,0.18)");
    g.addColorStop(1, "rgba(0,40,90,0.38)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "aurora") {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i++) {
      const y = H * (0.2 + i * 0.18) + Math.sin(globalT * 1.8 + i) * 60;
      const g = ctx.createLinearGradient(0, y - 180, W, y + 180);
      g.addColorStop(0, "rgba(90,255,180,0.06)");
      g.addColorStop(0.5, "rgba(120,180,255,0.18)");
      g.addColorStop(1, "rgba(220,120,255,0.09)");
      ctx.fillStyle = g;
      ctx.fillRect(0, y - 200, W, 400);
    }
    ctx.restore();
    return;
  }

  if (eff === "fireworks") {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const burstCount = 8;
    for (let b = 0; b < burstCount; b++) {
      const bx = rnd() * W;
      const by = rnd() * H * 0.55 + H * 0.08;
      const phase = (globalT * 1.2 + b * 0.37) % 1;
      const r = 30 + phase * 130;
      for (let i = 0; i < 18; i++) {
        const ang = (Math.PI * 2 * i) / 18 + b;
        const x = bx + Math.cos(ang) * r;
        const y = by + Math.sin(ang) * r;
        ctx.fillStyle = `rgba(255,${120 + ((i * 11) % 135)},${80 + ((b * 37) % 170)},${0.1 + (1 - phase) * 0.45})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + (1 - phase) * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    return;
  }

  if (eff === "bloom") {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const g = ctx.createRadialGradient(W / 2, H * 0.38, 20, W / 2, H * 0.45, H * 0.7);
    g.addColorStop(0, "rgba(255,255,255,0.24)");
    g.addColorStop(0.5, "rgba(255,240,200,0.10)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    return;
  }

  if (eff === "film") {
    ctx.save();
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = rnd() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(rnd() * W, rnd() * H, 1.5, 1.5);
    }
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    for (let i = 0; i < 4; i++) {
      const x = rnd() * W;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(globalT + i) * 12, H);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (eff === "cyber") {
    ctx.save();
    ctx.fillStyle = "rgba(0,255,255,0.08)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(90,255,255,0.12)";
    ctx.lineWidth = 1;
    const spacing = 24;
    const off = Math.floor((globalT * 30) % spacing);
    for (let y = -spacing; y < H + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y + off);
      ctx.lineTo(W, y + off);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (eff === "dust") {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 70; i++) {
      const x = rnd() * W;
      const y = (rnd() * H + globalT * (6 + rnd() * 12)) % H;
      const r = 12 + rnd() * 42;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,245,220,0.16)");
      g.addColorStop(1, "rgba(255,245,220,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
    return;
  }

  if (eff === "glitch") {
    ctx.save();
    const line = 8;
    for (let y = 0; y < H; y += line) {
      const shift = Math.sin(globalT * 12 + y * 0.07) * 6;
      ctx.fillStyle = "rgba(255,0,120,0.05)";
      ctx.fillRect(shift, y, W, line / 2);
      ctx.fillStyle = "rgba(0,220,255,0.05)";
      ctx.fillRect(-shift, y + line / 2, W, line / 2);
    }
    ctx.restore();
    return;
  }

  if (eff === "spotlight") {
    const cx = W * (0.5 + 0.2 * Math.sin(globalT * 0.7));
    const cy = H * (0.36 + 0.08 * Math.cos(globalT * 0.9));
    const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, H * 0.65);
    g.addColorStop(0, "rgba(255,255,240,0.28)");
    g.addColorStop(0.3, "rgba(255,255,220,0.1)");
    g.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "pastel") {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "rgba(255,190,220,0.15)");
    g.addColorStop(0.33, "rgba(180,220,255,0.13)");
    g.addColorStop(0.66, "rgba(210,255,220,0.12)");
    g.addColorStop(1, "rgba(255,235,180,0.14)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "lava") {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(255,70,40,0.1)");
    g.addColorStop(0.55, "rgba(255,120,30,0.16)");
    g.addColorStop(1, "rgba(70,10,10,0.4)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "forest") {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(80,170,90,0.14)");
    g.addColorStop(1, "rgba(15,55,20,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "ice") {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(190,250,255,0.14)");
    g.addColorStop(0.6, "rgba(120,210,255,0.1)");
    g.addColorStop(1, "rgba(20,70,100,0.3)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "noir") {
    ctx.save();
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }

  if (eff === "sepia") {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(140,98,58,0.35)";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    return;
  }
}

function drawStickersLayer(sc, globalT, sceneIndex, freezeLayout) {
  const list = sc.stickers || [];
  const motion = !freezeLayout && sc.textStyle?.liveMotion !== false;
  list.forEach((st, i) => {
    const emoji = st.emoji || "";
    if (!emoji) return;
    const scale = Number(st.scale) || 1;
    const fs = Math.round((sc.textStyle?.fontSize || 56) * scale * 1.25);
    const ox = motion ? 12 * Math.sin(globalT * 2.5 + i * 0.9 + st.x * 0.001) : 0;
    const oy = motion ? 10 * Math.cos(globalT * 2.2 + i * 0.7 + st.y * 0.001) : 0;
    const rot = motion ? 0.18 * Math.sin(globalT * 1.6 + sceneIndex + i * 0.4) : 0;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 12;
    ctx.font = `${fs}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(st.x + ox, st.y + oy);
    ctx.rotate(rot);
    ctx.fillText(emoji, 0, 0);
    ctx.restore();
  });
}

function canvasToSceneCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = ((clientX - rect.left) / rect.width) * W;
  const sy = ((clientY - rect.top) / rect.height) * H;
  return { x: sx, y: sy };
}

function getTextBlockBounds(sc) {
  const ts = sc.textStyle || {};
  const text = sc.text || "";
  if (!String(text).trim()) return null;
  const fs = ts.fontSize || 56;
  const family = ts.fontFamily || "Jua";
  ctx.save();
  ctx.font = makeFontStack(fs, family);
  ctx.textAlign = ts.align || "center";
  ctx.textBaseline = "middle";
  const tx = ts.x != null ? ts.x : W / 2;
  const ty = ts.y != null ? ts.y : H * 0.78;
  const lines = String(text).split("\n");
  let tw = 0;
  for (const line of lines) {
    tw = Math.max(tw, ctx.measureText(line).width);
  }
  const lineH = fs * 1.15;
  const th = lineH * lines.length;
  const pad = 16;
  let left;
  let right;
  if (ctx.textAlign === "center") {
    left = tx - tw / 2 - pad;
    right = left + tw + 2 * pad;
  } else if (ctx.textAlign === "right") {
    right = tx + pad;
    left = right - (tw + 2 * pad);
  } else {
    left = tx - pad;
    right = left + tw + 2 * pad;
  }
  const top = ty - th / 2;
  const bottom = ty + th / 2;
  ctx.restore();
  return { left, right, top, bottom, tw, th, tx, ty };
}

const LAYOUT_BOX_PAD = 6;
const LAYOUT_HANDLE_HIT = 30;
const LAYOUT_STICKER_KNOB_HIT = 28;

function getStickerRadiusForLayout(sc, st) {
  const fs = Math.round((sc.textStyle?.fontSize || 56) * (st.scale || 1) * 1.25);
  return Math.max(40, fs * 0.48);
}

function getStickerResizeKnob(sc, st) {
  const r = getStickerRadiusForLayout(sc, st);
  const kx = st.x + r * 0.92;
  const ky = st.y + r * 0.92;
  return { kx, ky, r };
}

/** @returns {"tl"|"tr"|"bl"|"br"|null} */
function hitTextCorner(x, y, b) {
  const m = LAYOUT_BOX_PAD;
  const corners = {
    tl: { cx: b.left - m, cy: b.top - m },
    tr: { cx: b.right + m, cy: b.top - m },
    bl: { cx: b.left - m, cy: b.bottom + m },
    br: { cx: b.right + m, cy: b.bottom + m },
  };
  for (const [name, p] of Object.entries(corners)) {
    if (Math.hypot(x - p.cx, y - p.cy) <= LAYOUT_HANDLE_HIT) {
      return /** @type {"tl"|"tr"|"bl"|"br"} */ (name);
    }
  }
  return null;
}

function cornerToCursor(c) {
  if (c === "tl" || c === "br") return "nwse-resize";
  return "nesw-resize";
}

function drawLayoutHandles(sc) {
  const b = getTextBlockBounds(sc);
  if (b) {
    const m = LAYOUT_BOX_PAD;
    const hx = 10;
    ctx.save();
    ctx.strokeStyle = "rgba(120, 210, 255, 0.95)";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    const wx = b.right - b.left + 2 * m;
    const hbox = b.bottom - b.top + 2 * m;
    ctx.strokeRect(b.left - m, b.top - m, wx, hbox);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(120, 210, 255, 0.75)";
    const cs = [
      { cx: b.left - m, cy: b.top - m },
      { cx: b.right + m, cy: b.top - m },
      { cx: b.left - m, cy: b.bottom + m },
      { cx: b.right + m, cy: b.bottom + m },
    ];
    for (const p of cs) {
      ctx.fillRect(p.cx - hx, p.cy - hx, 2 * hx, 2 * hx);
    }
    ctx.fillStyle = "rgba(120, 210, 255, 0.45)";
    ctx.beginPath();
    ctx.arc(b.tx, b.ty, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  (sc.stickers || []).forEach((st) => {
    const r0 = getStickerRadiusForLayout(sc, st);
    const { kx, ky } = getStickerResizeKnob(sc, st);
    ctx.save();
    ctx.strokeStyle = "rgba(255, 200, 100, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(st.x, st.y, r0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 200, 100, 0.85)";
    const ks = 12;
    ctx.fillRect(kx - ks, ky - ks, 2 * ks, 2 * ks);
    ctx.restore();
  });
}

function hitTestLayoutEdit(clientX, clientY) {
  if (selectedIndex < 0) return null;
  const { x, y } = canvasToSceneCoords(clientX, clientY);
  const sc = project.scenes[selectedIndex];
  if (!sc) return null;
  // 자막이 스티커보다 위에 그려지므로 먼저 판정
  const b = getTextBlockBounds(sc);
  if (b) {
    const c = hitTextCorner(x, y, b);
    if (c) {
      return { kind: "text", part: "resize", corner: c };
    }
    const pad = 28;
    if (x >= b.left - pad && x <= b.right + pad && y >= b.top - pad && y <= b.bottom + pad) {
      return { kind: "text", part: "body" };
    }
  }
  const stickers = sc.stickers || [];
  for (let i = stickers.length - 1; i >= 0; i--) {
    const st = stickers[i];
    const { kx, ky } = getStickerResizeKnob(sc, st);
    if (Math.hypot(x - kx, y - ky) <= LAYOUT_STICKER_KNOB_HIT) {
      return { kind: "sticker", part: "resize", index: i };
    }
    const rBody = getStickerRadiusForLayout(sc, st);
    if (Math.hypot(x - st.x, y - st.y) <= rBody) {
      return { kind: "sticker", part: "body", index: i };
    }
  }
  return null;
}

function drawMedia(sc, p, localSec, globalT) {
  const a = sc.animation || "zoomIn";
  const pulseT = globalT * 4.5 + localSec * 2.2;
  const effectiveScalePct =
    sc?.mediaScale == null ? clampMediaBaseScale(project.mediaBaseScale) : clampSceneMediaScale(sc.mediaScale);
  const baseScale = effectiveScalePct / 100;

  if (sc.type === "video" && sc.videoEl) {
    const v = sc.videoEl;
    try {
      const cap = Number.isFinite(v.duration) && v.duration > 0 ? v.duration - 0.06 : sc.duration;
      const target = Math.min(Math.max(0, localSec), cap);
      if (Math.abs(v.currentTime - target) > 0.04) {
        v.currentTime = target;
      }
    } catch (_) {}
    if (v.readyState >= 2) {
      let scaleExtra = 1;
      let dx = 0;
      let dy = 0;
      if (a === "zoomIn") scaleExtra = 1 + p * 0.12;
      else if (a === "zoomOut") scaleExtra = 1.12 - p * 0.12;
      else if (a === "wobble") {
        scaleExtra = 1.1 + 0.1 * Math.sin(p * Math.PI * 5);
        dx = 16 * Math.sin(p * 6 * Math.PI);
        dy = 10 * Math.cos(p * 4 * Math.PI);
      } else if (a === "pulse") {
        scaleExtra = 1.1 + 0.1 * Math.sin(pulseT);
      } else if (a === "ken") {
        scaleExtra = 1.04 + p * 0.22;
      } else if (a === "panLeft") {
        dx = -p * 48;
      } else if (a === "panRight") {
        dx = p * 48;
      }
      const vw = v.videoWidth || W;
      const vh = v.videoHeight || H;
      const r = Math.max(W / vw, H / vh) * scaleExtra * baseScale;
      const dw = vw * r;
      const dh = vh * r;
      const x = (W - dw) / 2 + dx;
      const y = (H - dh) / 2 + dy;
      ctx.drawImage(v, x, y, dw, dh);
    }
    return;
  }

  const im = sc.img;
  if (!im || !im.complete) return;
  let scaleM = 1;
  let dx = 0;
  let dy = 0;
  if (a === "zoomIn") scaleM = 1 + p * 0.16;
  else if (a === "zoomOut") scaleM = 1.16 - p * 0.16;
  else if (a === "wobble") {
    scaleM = 1.12 + 0.1 * Math.sin(p * Math.PI * 5);
    dx = 18 * Math.sin(p * 6 * Math.PI);
    dy = 10 * Math.cos(p * 4 * Math.PI);
  } else if (a === "pulse") {
    scaleM = 1.1 + 0.12 * Math.sin(pulseT);
  } else if (a === "ken") {
    scaleM = 1 + p * 0.28;
  } else if (a === "panLeft") {
    dx = -p * 48;
  } else if (a === "panRight") {
    dx = p * 48;
  } else if (a === "none") {
    scaleM = 1.05;
  }
  const r0 = Math.max(W / im.width, H / im.height) * scaleM * baseScale;
  const dw = im.width * r0;
  const dh = im.height * r0;
  const x = (W - dw) / 2 + dx;
  const y = (H - dh) / 2 + dy;
  ctx.drawImage(im, x, y, dw, dh);
}

function drawFrame(globalT) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  if (!project.scenes.length) return;

  const maxT = totalDuration();
  let t = ((globalT % maxT) + maxT) % maxT;
  const freeze = layoutEditMode && !playing;
  if (freeze && selectedIndex >= 0 && project.scenes[selectedIndex]) {
    const s = project.scenes[selectedIndex].duration;
    t = Math.min(
      sceneAtTimeFromIndex(selectedIndex) + Math.max(0.15, s * 0.35),
      maxT - 0.02,
    );
  }
  const { index, local } = sceneAtTime(t);
  const sc = project.scenes[index];
  if (!sc) return;

  const p = sc.duration > 0 ? Math.min(1, Math.max(0, local / sc.duration)) : 0;
  const freezeMotion = freeze;

  drawMedia(sc, p, local, t);
  drawOverlayEffect(sc, index, t, local);
  drawStickersLayer(sc, t, index, freezeMotion);

  const ts = sc.textStyle || {};
  const text = sc.text || "";
  if (text) {
    ctx.save();
    const fs = ts.fontSize || 56;
    const family = ts.fontFamily || "Jua";
    ctx.font = makeFontStack(fs, family);
    ctx.textAlign = ts.align || "center";
    ctx.textBaseline = "middle";
    let tx = ts.x != null ? ts.x : W / 2;
    let ty = ts.y != null ? ts.y : H * 0.78;
    const live = !freezeMotion && ts.liveMotion !== false;
    if (live) {
      const pulse = 1 + 0.045 * Math.sin(t * 4.2 + index * 0.3);
      const jx = 5 * Math.sin(t * 3.1 + index);
      const jy = 4 * Math.cos(t * 2.6 + index * 0.4);
      ctx.translate(tx + jx, ty + jy);
      ctx.scale(pulse, pulse);
      ctx.translate(-(tx + jx), -(ty + jy));
    }
    const lines = String(text).split("\n");
    let tw = 0;
    for (const line of lines) {
      tw = Math.max(tw, ctx.measureText(line).width);
    }
    const lineH = fs * 1.15;
    const th = lineH * lines.length;
    const pad = 16;
    if (ts.bgColor) {
      ctx.fillStyle = ts.bgColor;
      let bx;
      if (ctx.textAlign === "center") bx = tx - tw / 2 - pad;
      else if (ctx.textAlign === "right") bx = tx - tw - pad;
      else bx = tx - pad;
      drawRoundedRect(bx, ty - th / 2, tw + pad * 2, th, 12);
      ctx.fill();
    }
    ctx.fillStyle = ts.color || "#fff";
    lines.forEach((line, i) => {
      ctx.fillText(line, tx, ty - (th - lineH) / 2 + i * lineH);
    });
    ctx.restore();
  }

  if (freeze && selectedIndex === index) {
    drawLayoutHandles(sc);
  }
}

function nowPlaybackSec() {
  if (!playing) return cursorSec;
  const maxT = totalDuration();
  if (project.audioFile && audioEl.src) {
    return Math.min(audioEl.currentTime, maxT);
  }
  return Math.min(cursorSec + (performance.now() - playStartMono) / 1000, maxT);
}

function loop() {
  if (!playing) return;
  const t = nowPlaybackSec();
  const maxT = totalDuration();
  applyAudioFadeAtTime(t, maxT);
  drawFrame(t);
  els.timeLabel.textContent = `${t.toFixed(1)}s / ${maxT.toFixed(1)}s`;
  if (project.audioFile && audioEl.src) {
    if (audioEl.currentTime >= maxT - 0.03 || audioEl.ended) {
      stopPlayback({ resetToZero: true });
      audioEl.currentTime = 0;
      drawFrame(0);
      els.timeLabel.textContent = `0.0s / ${maxT.toFixed(1)}s`;
      return;
    }
  } else if (t >= maxT - 0.02) {
    stopPlayback({ resetToZero: true });
    drawFrame(0);
    els.timeLabel.textContent = `0.0s / ${maxT.toFixed(1)}s`;
    return;
  }
  raf = requestAnimationFrame(loop);
}

function stopPlayback(options = {}) {
  const reset = options.resetToZero === true;
  if (playing && !reset) {
    cursorSec = nowPlaybackSec();
  }
  if (reset) {
    cursorSec = 0;
  }
  esf.d("stopPlayback", { reset, cursorAfter: cursorSec });
  playing = false;
  cancelAnimationFrame(raf);
  audioEl.pause();
  audioEl.volume = 1;
  els.btnPlay.textContent = "미리보기 재생";
}

function setLayoutEdit(on) {
  if (on && playing) {
    on = false;
  }
  esf.d("setLayoutEdit", { on, playing });
  layoutEditMode = on;
  if (els.layoutEditToggle) {
    els.layoutEditToggle.checked = on;
  }
  if (els.layoutEditHint) {
    els.layoutEditHint.hidden = !on;
  }
  canvas.classList.toggle("layout-edit", on && !playing);
  layoutDrag = null;
  canvas.style.cursor = "";
}

function startPlayback() {
  if (!project.scenes.length) {
    esf.w("startPlayback: no scenes", { status: "user hint shown" });
    els.status.textContent = "먼저 「한 번에 숏폼 만들기」를 눌러 주세요.";
    return;
  }
  setLayoutEdit(false);
  playing = true;
  playStartMono = performance.now();
  esf.i("startPlayback", {
    cursorSec,
    maxT: totalDuration(),
    hasAudio: !!(project.audioFile && audioEl.src),
  });
  els.btnPlay.textContent = "일시정지";
  if (project.audioFile && audioEl.src) {
    audioEl.currentTime = Math.min(cursorSec, totalDuration());
    applyAudioFadeAtTime(audioEl.currentTime, totalDuration());
    audioEl.play().catch((e) => {
      esf.w("startPlayback:audio play failed", e);
    });
  }
  loop();
}

function resetPreview() {
  esf.d("resetPreview", { scenes: project.scenes.length });
  stopPlayback({ resetToZero: true });
  if (audioEl.src) {
    audioEl.currentTime = 0;
    audioEl.volume = 1;
  }
  drawFrame(0);
  const maxT = totalDuration();
  els.timeLabel.textContent = maxT > 0.01 ? `0.0s / ${maxT.toFixed(1)}s` : "0.0s";
}

function renderFileList() {
  els.fileList.innerHTML = "";
  project.mediaFiles.forEach((f, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${f.name}`;
    li.title = f.type;
    li.addEventListener("click", () => {
      if (!project.scenes.length) return;
      const idx = Math.min(i, project.scenes.length - 1);
      selectScene(idx);
    });
    els.fileList.appendChild(li);
  });
}

function renderTimeline() {
  els.timeline.innerHTML = "";
  project.scenes.forEach((sc, i) => {
    const div = document.createElement("div");
    div.className = "thumb" + (i === selectedIndex ? " active" : "");
    div.style.backgroundImage = sc.type === "image" && sc.objectUrl ? `url("${sc.objectUrl}")` : "none";
    if (sc.type === "video") div.style.backgroundColor = "#30363d";
    const idx = document.createElement("span");
    idx.className = "idx";
    idx.textContent = String(i + 1);
    const dur = document.createElement("span");
    dur.className = "dur";
    dur.textContent = `${sc.duration.toFixed(1)}s`;
    div.appendChild(idx);
    div.appendChild(dur);
    div.addEventListener("click", () => selectScene(i));
    els.timeline.appendChild(div);
  });
}

function selectScene(i) {
  esf.d("selectScene", {
    i,
    sceneCount: project.scenes.length,
    valid: i >= 0 && i < project.scenes.length,
  });
  if (i < 0 || i >= project.scenes.length) {
    selectedIndex = -1;
    els.sceneHint.textContent = "타임라인에서 장면을 선택하세요.";
    els.sceneText.disabled = true;
    els.sceneDur.disabled = true;
    els.sceneAnim.disabled = true;
    els.sceneEffect.disabled = true;
    if (els.sceneMediaScale) {
      els.sceneMediaScale.disabled = true;
      els.sceneMediaScale.value = "";
    }
    els.sceneFont.disabled = true;
    els.btnClearStickers.disabled = true;
    els.btnStickerPlace.disabled = true;
    if (els.sceneLiveMotion) {
      els.sceneLiveMotion.disabled = true;
    }
    if (els.layoutEditToggle) {
      els.layoutEditToggle.disabled = true;
      els.layoutEditToggle.checked = false;
    }
    if (els.sceneFontSize) {
      els.sceneFontSize.disabled = true;
    }
    if (els.layoutEditHint) {
      els.layoutEditHint.hidden = true;
    }
    layoutEditMode = false;
    if (els.stickerPalette) {
      els.stickerPalette.style.opacity = "0.35";
      els.stickerPalette.style.pointerEvents = "none";
    }
    els.sceneText.value = "";
    return;
  }
  selectedIndex = i;
  const sc = project.scenes[i];
  els.sceneHint.textContent = `장면 ${i + 1} (${sc.type === "video" ? "영상" : "이미지"})`;
  els.sceneText.disabled = false;
  els.sceneDur.disabled = false;
  els.sceneAnim.disabled = false;
  els.sceneEffect.disabled = false;
  if (els.sceneMediaScale) {
    els.sceneMediaScale.disabled = false;
    const v = sc.mediaScale == null ? "" : String(Math.round(clampSceneMediaScale(sc.mediaScale) / 10) * 10);
    els.sceneMediaScale.value = v;
  }
  els.sceneFont.disabled = false;
  els.btnClearStickers.disabled = false;
  els.btnStickerPlace.disabled = false;
  if (els.sceneLiveMotion) {
    els.sceneLiveMotion.disabled = false;
    els.sceneLiveMotion.checked = sc.textStyle?.liveMotion !== false;
  }
  if (els.layoutEditToggle) {
    els.layoutEditToggle.disabled = false;
  }
  if (els.sceneFontSize) {
    els.sceneFontSize.disabled = false;
    els.sceneFontSize.value = String(Math.round(sc.textStyle?.fontSize || 58));
  }
  if (els.stickerPalette) {
    els.stickerPalette.style.opacity = "1";
    els.stickerPalette.style.pointerEvents = "auto";
  }
  els.sceneText.value = sc.text || "";
  els.sceneDur.value = String(sc.duration.toFixed(2));
  els.sceneAnim.value = sc.animation || "zoomIn";
  els.sceneEffect.value = sc.effect || "none";
  {
    const ff = sc.textStyle?.fontFamily || "Jua";
    els.sceneFont.value = FONT_CATALOG.some((x) => x.family === ff) ? ff : "Jua";
  }

  [...els.timeline.children].forEach((el, j) => {
    el.classList.toggle("active", j === i);
  });
  [...els.fileList.children].forEach((el, j) => {
    el.classList.toggle("active", j === i);
  });

  if (!playing) {
    let start = 0;
    for (let k = 0; k < i; k++) start += project.scenes[k].duration;
    drawFrame(start);
  }
}

function applyTemplate(name) {
  const targets = selectedIndex >= 0 ? [project.scenes[selectedIndex]] : project.scenes;
  esf.d("applyTemplate", {
    name,
    mode: selectedIndex >= 0 ? "selection" : "all",
    count: targets.filter(Boolean).length,
  });
  const style = tplStyle(name);
  for (const sc of targets) {
    if (!sc) continue;
    sc.textStyle = { ...style, align: "center", fontFamily: style.fontFamily || "Jua" };
  }
  if (selectedIndex >= 0) {
    const sc0 = project.scenes[selectedIndex];
    els.sceneFont.value = sc0.textStyle?.fontFamily || "Jua";
    if (els.sceneFontSize) {
      els.sceneFontSize.value = String(Math.round(sc0.textStyle?.fontSize || 58));
    }
  }
  if (!playing) drawFrame(selectedIndex >= 0 ? sceneAtTimeFromIndex(selectedIndex) : 0);
  els.status.textContent =
    selectedIndex >= 0 ? `템플릿「${name}」적용 (선택 장면)` : `템플릿「${name}」적용 (전체)`;
}

function sceneAtTimeFromIndex(index) {
  let s = 0;
  for (let k = 0; k < index; k++) s += project.scenes[k].duration;
  return s;
}

function populateUiSelects() {
  if (els.sceneFont) {
    els.sceneFont.innerHTML = "";
    for (const f of FONT_CATALOG) {
      const o = document.createElement("option");
      o.value = f.family;
      o.textContent = f.label;
      els.sceneFont.appendChild(o);
    }
  }
  if (els.sceneEffect) {
    els.sceneEffect.innerHTML = "";
    for (const e of EFFECT_OPTIONS) {
      const o = document.createElement("option");
      o.value = e.value;
      o.textContent = e.label;
      els.sceneEffect.appendChild(o);
    }
  }
  if (els.sceneAnim) {
    els.sceneAnim.innerHTML = "";
    for (const a of ANIM_CATALOG) {
      const o = document.createElement("option");
      o.value = a.value;
      o.textContent = a.label;
      els.sceneAnim.appendChild(o);
    }
  }
}

async function generateSampleImageBlob(index, total) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  const hue = ((index / Math.max(1, total)) * 320 + 40) % 360;
  const g0 = x.createLinearGradient(0, 0, W, H);
  g0.addColorStop(0, `hsl(${hue},72%,42%)`);
  g0.addColorStop(1, `hsl(${(hue + 55) % 360},58%,28%)`);
  x.fillStyle = g0;
  x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 28; i++) {
    x.beginPath();
    x.arc(Math.random() * W, Math.random() * H, 30 + Math.random() * 140, 0, Math.PI * 2);
    x.fill();
  }
  x.strokeStyle = "rgba(255,255,255,0.25)";
  x.lineWidth = 4;
  x.strokeRect(48, 48, W - 96, H - 96);
  x.fillStyle = "rgba(255,255,255,0.95)";
  x.font = "bold 78px system-ui,sans-serif";
  x.textAlign = "center";
  x.fillText(`샘플 ${index + 1} / ${total}`, W / 2, H * 0.44);
  x.font = "44px system-ui,sans-serif";
  x.fillStyle = "rgba(255,255,255,0.85)";
  x.fillText("바로 편집 · 내보내기", W / 2, H * 0.51);
  return new Promise((resolve) => {
    c.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

async function fillQuickDemo() {
  els.status.textContent = "샘플 이미지·장면 생성 중…";
  try {
    esf.d("fillQuickDemo:start", { n: 12 });
    const n = 12;
    const files = [];
    for (let i = 0; i < n; i++) {
      const blob = await generateSampleImageBlob(i, n);
      files.push(new File([blob], `demo-${String(i + 1).padStart(2, "0")}.jpg`, { type: "image/jpeg" }));
    }
    project.mediaFiles = files;
    audioEl.pause();
    project.audioFile = null;
    audioEl.removeAttribute("src");
    renderFileList();
    await buildScenesFromDuration(24, files);

    const effects = EFFECT_OPTIONS.map((e) => e.value).filter((v) => v !== "none");
    const fams = FONT_CATALOG.map((f) => f.family);
    const lines = [
      ...captions,
      "즐거운 여행",
      "오늘도 화이팅",
      "특별한 하루",
      "함께한 추억",
      "또 만나요!",
      "행복 가득",
      "소중한 순간",
      "Best Day",
    ];

    project.scenes.forEach((sc, i) => {
      sc.effect = effects[i % effects.length];
      const fam = fams[i % fams.length];
      sc.textStyle = { ...sc.textStyle, fontFamily: fam, liveMotion: true };
      sc.animation = RANDOM_ANIMS[i % RANDOM_ANIMS.length];
      sc.text = lines[i % lines.length];
      sc.stickers = [];
      const scount = 4 + (i % 5);
      for (let j = 0; j < scount; j++) {
        sc.stickers.push({
          emoji: STICKER_EMOJIS[(i * 11 + j * 17) % STICKER_EMOJIS.length],
          x: W * (0.12 + ((j * 0.21) % 0.76)),
          y: H * (0.1 + ((j * 0.13) % 0.42)),
          scale: 0.62 + (j % 6) * 0.07,
        });
      }
    });

    renderTimeline();
    selectScene(0);
    esf.i("fillQuickDemo:ok", { n });
    els.status.textContent = `샘플 ${n}장·효과·폰트·스티커까지 구성됐어요. 「미리보기 재생」→「영상 다운로드」 순서로요.`;
  } catch (err) {
    esf.e("fillQuickDemo:failed", err);
    els.status.textContent = String(err?.message || err);
  }
}

async function oneClickShortform() {
  if (!els.btnOneClick) return;
  els.btnOneClick.disabled = true;
  els.status.textContent = "글꼴 불러오는 중…";
  try {
    esf.d("oneClickShortform:start", { mediaFiles: project.mediaFiles.length });
    await ensureFontsLoaded();
    if (!project.mediaFiles.length) {
      esf.d("oneClick: no media, fillQuickDemo");
      await fillQuickDemo();
      return;
    }
    let total = 24;
    if (project.audioFile) {
      total = await getAudioDuration(project.audioFile);
      if (!audioEl.src) {
        audioEl.src = URL.createObjectURL(project.audioFile);
      }
    }
    els.status.textContent = "장면 자동 구성 중…";
    await buildScenesFromDuration(total, project.mediaFiles);
    let aiPlan = null;
    try {
      els.status.textContent = "Grok으로 자막/효과 추천 받는 중…";
      aiPlan = await requestAiShortformPlan();
    } catch (aiErr) {
      esf.w("oneClickShortform:ai plan failed, fallback", aiErr);
      els.status.textContent = "AI 추천 실패로 기본 자동 구성으로 진행합니다.";
    }
    const effects = EFFECT_OPTIONS.map((e) => e.value).filter((v) => v !== "none");
    const fams = FONT_CATALOG.map((f) => f.family);
    project.scenes.forEach((sc, i) => {
      const ai = aiPlan?.[i];
      sc.effect = ai?.effect || effects[i % effects.length];
      sc.textStyle = {
        ...sc.textStyle,
        fontFamily: fams[i % fams.length],
        liveMotion: true,
      };
      sc.animation = ai?.animation || RANDOM_ANIMS[i % RANDOM_ANIMS.length];
      sc.text = ai?.text || captions[i % captions.length];
      sc.stickers = [];
      const stickerSeed =
        ai?.stickerEmojis?.length > 0
          ? ai.stickerEmojis
          : Array.from({ length: 3 }, (_, j) => STICKER_EMOJIS[(i * 5 + j * 11) % STICKER_EMOJIS.length]);
      for (let j = 0; j < stickerSeed.length; j++) {
        sc.stickers.push({
          emoji: stickerSeed[j],
          x: W * (0.18 + ((j * 0.26) % 0.58)),
          y: H * (0.14 + ((j * 0.12) % 0.34)),
          scale: 0.68 + (j % 5) * 0.07,
        });
      }
    });
    renderTimeline();
    selectScene(0);
    drawFrame(0);
    esf.i("oneClickShortform:ok", { scenes: project.scenes.length, total, hadMedia: true });
    els.status.textContent = aiPlan
      ? "✅ 완성! Grok 추천 자막/효과까지 적용됐어요. 미리보기 후 영상 다운로드 하세요."
      : "✅ 완성! 「미리보기 재생」으로 확인한 뒤, 「영상 다운로드」로 저장하세요 (로컬 녹화).";
  } catch (err) {
    esf.e("oneClickShortform:failed", err);
    els.status.textContent = String(err?.message || err);
  } finally {
    els.btnOneClick.disabled = false;
  }
}

function clearStickerPickHighlight() {
  if (!els.stickerPalette) return;
  els.stickerPalette.querySelectorAll("button.pick").forEach((b) => b.classList.remove("pick"));
}

function addStickerRandom(emoji) {
  if (selectedIndex < 0) return;
  const sc = project.scenes[selectedIndex];
  if (!sc.stickers) sc.stickers = [];
  sc.stickers.push({
    emoji,
    x: W / 2 + (Math.random() - 0.5) * 340,
    y: H * (0.26 + Math.random() * 0.22),
    scale: 0.85 + Math.random() * 0.38,
  });
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
}

function onStickerPick(emoji, btn) {
  if (selectedIndex < 0) return;
  if (placementMode) {
    pendingStickerEmoji = emoji;
    clearStickerPickHighlight();
    btn.classList.add("pick");
    els.status.textContent = "캔버스를 클릭하면 그 위치에 붙습니다.";
    return;
  }
  addStickerRandom(emoji);
}

function initStickerPalette() {
  if (!els.stickerPalette) return;
  els.stickerPalette.innerHTML = "";
  for (const emo of STICKER_EMOJIS) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = emo;
    b.addEventListener("click", () => onStickerPick(emo, b));
    els.stickerPalette.appendChild(b);
  }
}

async function mergeFilesFromInput(fileList) {
  const arr = Array.from(fileList || []);
  if (!arr.length) return;
  const next = [...project.mediaFiles, ...arr];
  project.mediaFiles = next;
  renderFileList();
  els.status.textContent = "장면·미리보기 구성 중…";
  try {
    let total = 24;
    if (project.audioFile) {
      total = await getAudioDuration(project.audioFile);
    }
    esf.d("mergeFilesFromInput: build", { total, files: project.mediaFiles.length });
    await buildScenesFromDuration(total, project.mediaFiles);
    esf.i("mergeFilesFromInput:ok", { count: project.mediaFiles.length, total });
    els.status.textContent = `미디어 ${project.mediaFiles.length}개 · 첫 장면이 미리보기에 보여요.`;
  } catch (err) {
    esf.e("mergeFilesFromInput:failed", err);
    els.status.textContent = String(err?.message || err);
  }
}

els.images.addEventListener("change", (e) => {
  void mergeFilesFromInput(e.target.files);
  e.target.value = "";
});

els.music.addEventListener("change", (e) => {
  const f = e.target.files?.[0];
  e.target.value = "";
  if (!f) return;
  esf.d("music:selected", { name: f.name, type: f.type, size: f.size });
  project.audioFile = f;
  audioEl.src = URL.createObjectURL(f);
  audioEl.volume = 1;
  els.status.textContent = `음악: ${f.name}`;
});

if (els.audioFadeOutSec) {
  els.audioFadeOutSec.addEventListener("change", (e) => {
    const v = clampAudioFadeOutSec(parseFloat(e.target.value));
    project.audioFadeOutSec = v;
    e.target.value = String(v);
    if (!playing) {
      applyAudioFadeAtTime(cursorSec, totalDuration());
    }
    els.status.textContent =
      v > 0 ? `음악 페이드아웃: 종료 ${v.toFixed(1)}초 전부터` : "음악 페이드아웃: 사용 안 함";
  });
}

els.btnPlay.addEventListener("click", () => {
  if (playing) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

els.btnStop.addEventListener("click", resetPreview);

els.sceneText.addEventListener("input", (e) => {
  if (selectedIndex < 0) return;
  project.scenes[selectedIndex].text = e.target.value;
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
});

els.sceneDur.addEventListener("change", (e) => {
  if (selectedIndex < 0) return;
  const v = Math.max(0.3, parseFloat(e.target.value) || 0.3);
  project.scenes[selectedIndex].duration = v;
  renderTimeline();
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
});

els.sceneAnim.addEventListener("change", (e) => {
  if (selectedIndex < 0) return;
  project.scenes[selectedIndex].animation = e.target.value;
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
});

els.sceneEffect.addEventListener("change", (e) => {
  if (selectedIndex < 0) return;
  project.scenes[selectedIndex].effect = e.target.value;
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
});

if (els.sceneMediaScale) {
  els.sceneMediaScale.addEventListener("change", (e) => {
    if (selectedIndex < 0) return;
    const raw = String(e.target.value || "").trim();
    const sc = project.scenes[selectedIndex];
    if (!raw) {
      sc.mediaScale = null;
    } else {
      sc.mediaScale = clampSceneMediaScale(parseInt(raw, 10));
      e.target.value = String(sc.mediaScale);
    }
    if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
    const txt = sc.mediaScale == null ? "기본값(왼쪽 전체)" : `${sc.mediaScale}%`;
    els.status.textContent = `장면 미디어 크기: ${txt}`;
  });
}

els.sceneFont.addEventListener("change", async (e) => {
  if (selectedIndex < 0) return;
  const sc = project.scenes[selectedIndex];
  sc.textStyle = { ...sc.textStyle, fontFamily: e.target.value };
  await loadFontFamily(e.target.value, sc.textStyle?.fontSize);
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
});

if (els.sceneLiveMotion) {
  els.sceneLiveMotion.addEventListener("change", (e) => {
    if (selectedIndex < 0) return;
    const sc = project.scenes[selectedIndex];
    sc.textStyle = { ...sc.textStyle, liveMotion: e.target.checked };
    if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
  });
}

if (els.btnOneClick) {
  els.btnOneClick.addEventListener("click", () => oneClickShortform());
}

if (els.layoutEditToggle) {
  els.layoutEditToggle.addEventListener("change", (e) => {
    esf.d("layoutEditToggle", { checked: e.target.checked });
    setLayoutEdit(e.target.checked);
    if (!playing) {
      drawFrame(selectedIndex >= 0 ? sceneAtTimeFromIndex(selectedIndex) : 0);
    }
  });
}

if (els.sceneFontSize) {
  els.sceneFontSize.addEventListener("change", async (e) => {
    if (selectedIndex < 0) return;
    const v = Math.max(20, Math.min(200, parseInt(e.target.value, 10) || 58));
    const sc = project.scenes[selectedIndex];
    sc.textStyle = { ...sc.textStyle, fontSize: v };
    e.target.value = String(v);
    await loadFontFamily(sc.textStyle?.fontFamily || "Jua", v);
    if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
  });
}

function updateLayoutEditHoverCursor(e) {
  const hit = hitTestLayoutEdit(e.clientX, e.clientY);
  if (!hit) {
    canvas.style.cursor = "";
    return;
  }
  if (hit.kind === "text" && hit.part === "resize") {
    canvas.style.cursor = hit.corner ? cornerToCursor(hit.corner) : "nwse-resize";
  } else if (hit.kind === "sticker" && hit.part === "resize") {
    canvas.style.cursor = "nwse-resize";
  } else {
    canvas.style.cursor = "move";
  }
}

function onLayoutPointerDown(e) {
  if (!layoutEditMode || playing) return;
  if (e.button !== 0) return;
  const hit = hitTestLayoutEdit(e.clientX, e.clientY);
  if (!hit) return;
  e.preventDefault();
  e.stopPropagation();
  const { x, y } = canvasToSceneCoords(e.clientX, e.clientY);
  const sc = project.scenes[selectedIndex];
  if (hit.kind === "text" && hit.part === "body") {
    const ts = sc.textStyle || {};
    const tx = ts.x != null ? ts.x : W / 2;
    const ty = ts.y != null ? ts.y : H * 0.78;
    layoutDrag = {
      kind: "text",
      action: "move",
      startSX: x,
      startSY: y,
      startTX: tx,
      startTY: ty,
      ptrId: e.pointerId,
    };
  } else if (hit.kind === "text" && hit.part === "resize") {
    const b0 = getTextBlockBounds(sc);
    if (!b0) return;
    const boxCx = (b0.left + b0.right) / 2;
    const boxCy = (b0.top + b0.bottom) / 2;
    const startDist = Math.max(14, Math.hypot(x - boxCx, y - boxCy));
    const startFS = sc.textStyle?.fontSize || 56;
    layoutDrag = {
      kind: "text",
      action: "resize",
      boxCx,
      boxCy,
      startDist,
      startFS,
      ptrId: e.pointerId,
    };
  } else if (hit.kind === "sticker" && hit.part === "body") {
    const st = sc.stickers[hit.index];
    layoutDrag = {
      kind: "sticker",
      action: "move",
      index: hit.index,
      startSX: x,
      startSY: y,
      startX: st.x,
      startY: st.y,
      ptrId: e.pointerId,
    };
  } else if (hit.kind === "sticker" && hit.part === "resize") {
    const st = sc.stickers[hit.index];
    const startDist = Math.max(14, Math.hypot(x - st.x, y - st.y));
    layoutDrag = {
      kind: "sticker",
      action: "resize",
      index: hit.index,
      stx: st.x,
      sty: st.y,
      startScale: st.scale || 1,
      startDist,
      ptrId: e.pointerId,
    };
  } else {
    return;
  }
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (e) {
    esf.d("setPointerCapture (ignored)", String(e));
  }
  canvas.classList.add("layout-dragging");
}

function onLayoutPointerMove(e) {
  if (!layoutEditMode || playing) {
    canvas.style.cursor = "";
    return;
  }
  if (!layoutDrag) {
    updateLayoutEditHoverCursor(e);
    return;
  }
  e.preventDefault();
  const { x, y } = canvasToSceneCoords(e.clientX, e.clientY);
  const sc = project.scenes[selectedIndex];
  if (!sc) return;
  if (layoutDrag.kind === "text" && layoutDrag.action === "move") {
    const dx = x - layoutDrag.startSX;
    const dy = y - layoutDrag.startSY;
    if (!sc.textStyle) sc.textStyle = {};
    sc.textStyle.x = Math.round(layoutDrag.startTX + dx);
    sc.textStyle.y = Math.round(layoutDrag.startTY + dy);
  } else if (layoutDrag.kind === "sticker" && layoutDrag.action === "move") {
    const dx = x - layoutDrag.startSX;
    const dy = y - layoutDrag.startSY;
    const st = sc.stickers[layoutDrag.index];
    if (st) {
      st.x = Math.round(layoutDrag.startX + dx);
      st.y = Math.round(layoutDrag.startY + dy);
    }
  } else if (layoutDrag.kind === "text" && layoutDrag.action === "resize") {
    if (!sc.textStyle) sc.textStyle = {};
    const d = Math.hypot(x - layoutDrag.boxCx, y - layoutDrag.boxCy);
    const next = Math.max(
      20,
      Math.min(200, Math.round((layoutDrag.startFS * d) / layoutDrag.startDist)),
    );
    sc.textStyle.fontSize = next;
    if (els.sceneFontSize) {
      els.sceneFontSize.value = String(next);
    }
    clearTimeout(fontSizePrimeTimer);
    fontSizePrimeTimer = setTimeout(() => {
      void loadFontFamily(sc.textStyle?.fontFamily || "Jua", sc.textStyle.fontSize);
    }, 100);
  } else if (layoutDrag.kind === "sticker" && layoutDrag.action === "resize") {
    const st = sc.stickers[layoutDrag.index];
    if (st) {
      const d = Math.hypot(x - layoutDrag.stx, y - layoutDrag.sty);
      st.scale = Math.max(
        0.25,
        Math.min(3, (layoutDrag.startScale * d) / layoutDrag.startDist),
      );
    }
  }
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
}

function onLayoutPointerUp(e) {
  if (!layoutDrag) return;
  if (layoutDrag.ptrId !== e.pointerId) return;
  const wasTextResize = layoutDrag.kind === "text" && layoutDrag.action === "resize";
  try {
    canvas.releasePointerCapture(e.pointerId);
  } catch (e) {
    esf.d("releasePointerCapture (ignored)", String(e));
  }
  layoutDrag = null;
  canvas.classList.remove("layout-dragging");
  if (els.sceneFontSize && selectedIndex >= 0 && project.scenes[selectedIndex]) {
    const fs = project.scenes[selectedIndex].textStyle?.fontSize;
    if (fs != null) els.sceneFontSize.value = String(Math.round(fs));
  }
  if (wasTextResize && selectedIndex >= 0) {
    const sc = project.scenes[selectedIndex];
    void loadFontFamily(sc.textStyle?.fontFamily || "Jua", sc.textStyle?.fontSize);
  }
  if (selectedIndex < 0 || !project.scenes[selectedIndex]) {
    canvas.style.cursor = "";
  } else {
    updateLayoutEditHoverCursor(e);
  }
}

function onLayoutWheel(e) {
  if (!layoutEditMode || playing) return;
  const hit = hitTestLayoutEdit(e.clientX, e.clientY);
  if (!hit) return;
  e.preventDefault();
  e.stopPropagation();
  const sc = project.scenes[selectedIndex];
  if (!sc) return;
  const step = e.deltaY < 0 ? 1 : -1;
  if (hit.kind === "text") {
    if (!sc.textStyle) sc.textStyle = {};
    const cur = sc.textStyle.fontSize || 56;
    sc.textStyle.fontSize = Math.max(20, Math.min(200, Math.round(cur + step * 2)));
    if (els.sceneFontSize) {
      els.sceneFontSize.value = String(sc.textStyle.fontSize);
    }
    els.status.textContent = `글씨 크기: ${sc.textStyle.fontSize}px (휠로 조절)`;
    clearTimeout(fontSizePrimeTimer);
    fontSizePrimeTimer = setTimeout(() => {
      void loadFontFamily(sc.textStyle?.fontFamily || "Jua", sc.textStyle.fontSize);
    }, 100);
  } else {
    const st = sc.stickers[hit.index];
    if (st) {
      st.scale = Math.max(0.25, Math.min(3, (st.scale || 1) + step * 0.1));
      els.status.textContent = `이모지 크기: ${(st.scale || 1).toFixed(2)}× (휠로 조절)`;
    }
  }
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
}

canvas.addEventListener("pointerdown", onLayoutPointerDown);
canvas.addEventListener("pointermove", onLayoutPointerMove);
canvas.addEventListener("pointerup", onLayoutPointerUp);
canvas.addEventListener("pointercancel", onLayoutPointerUp);
canvas.addEventListener("pointerleave", () => {
  if (!layoutDrag) {
    canvas.style.cursor = "";
  }
});
canvas.addEventListener("wheel", onLayoutWheel, { passive: false });

els.btnStickerPlace.addEventListener("click", () => {
  placementMode = !placementMode;
  els.btnStickerPlace.classList.toggle("active", placementMode);
  canvas.classList.toggle("place-mode", placementMode);
  pendingStickerEmoji = null;
  clearStickerPickHighlight();
  els.status.textContent = placementMode
    ? "위치 찍기: 스티커 선택 후 캔버스 클릭"
    : "빠른 붙이기: 스티커를 누르면 랜덤 위치에 추가";
});

els.btnClearStickers.addEventListener("click", () => {
  if (selectedIndex < 0) return;
  project.scenes[selectedIndex].stickers = [];
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
  els.status.textContent = "이 장면 스티커를 모두 지웠습니다.";
});

canvas.addEventListener("click", (e) => {
  if (layoutEditMode) return;
  if (!placementMode || !pendingStickerEmoji || selectedIndex < 0) return;
  e.preventDefault();
  const { x, y } = canvasToSceneCoords(e.clientX, e.clientY);
  const sc = project.scenes[selectedIndex];
  if (!sc.stickers) sc.stickers = [];
  sc.stickers.push({
    emoji: pendingStickerEmoji,
    x,
    y,
    scale: 1,
  });
  pendingStickerEmoji = null;
  clearStickerPickHighlight();
  if (!playing) drawFrame(sceneAtTimeFromIndex(selectedIndex));
  els.status.textContent = "스티커를 붙였습니다.";
});

document.querySelectorAll("[data-tpl]").forEach((btn) => {
  btn.addEventListener("click", () => applyTemplate(btn.getAttribute("data-tpl")));
});

function pickLocalRecorderMime(hasAudio) {
  const a = hasAudio
    ? [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
        "video/mp4;codecs=avc1.42E01E",
      ]
    : [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
        "video/mp4;codecs=avc1.42E01E",
      ];
  for (const m of a) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

function fileExtFromVideoMime(mime) {
  const m = (mime || "").toLowerCase();
  if (m.includes("mp4")) return "mp4";
  return "webm";
}

let ffmpegMp4 = null;
let ffmpegLoadTask = null;
let exportModalEl = null;
let exportModalBarEl = null;
let exportModalTitleEl = null;
let exportModalDetailEl = null;

function ensureExportModal() {
  if (exportModalEl) return;
  const wrap = document.createElement("div");
  wrap.className = "export-modal";
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="export-modal-card">
      <h3 class="export-modal-title">영상 다운로드 준비 중...</h3>
      <p class="export-modal-detail">잠시만 기다려 주세요.</p>
      <div class="export-progress-track">
        <div class="export-progress-bar"></div>
      </div>
      <p class="export-modal-sub">다운로드가 끝날 때까지 다른 조작은 잠시 멈춰주세요.</p>
    </div>
  `;
  document.body.appendChild(wrap);
  exportModalEl = wrap;
  exportModalBarEl = wrap.querySelector(".export-progress-bar");
  exportModalTitleEl = wrap.querySelector(".export-modal-title");
  exportModalDetailEl = wrap.querySelector(".export-modal-detail");
}

function setExportModalState({ title, detail, progress }) {
  ensureExportModal();
  if (title) exportModalTitleEl.textContent = title;
  if (detail) exportModalDetailEl.textContent = detail;
  const p = Math.max(0, Math.min(100, Math.round(progress || 0)));
  exportModalBarEl.style.width = `${p}%`;
}

function showExportModal() {
  ensureExportModal();
  exportModalEl.hidden = false;
}

function hideExportModal() {
  if (!exportModalEl) return;
  exportModalEl.hidden = true;
}

async function ensureMp4Transcoder() {
  if (ffmpegMp4) return ffmpegMp4;
  if (ffmpegLoadTask) return ffmpegLoadTask;
  ffmpegLoadTask = (async () => {
    esf.i("mp4:ffmpeg wasm loading");
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
      import("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js"),
      import("https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js"),
    ]);
    const ff = new FFmpeg();
    const base = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";
    const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm");
    await ff.load({
      coreURL,
      wasmURL,
    });
    ffmpegMp4 = ff;
    esf.i("mp4:ffmpeg wasm ready");
    return ff;
  })();
  return ffmpegLoadTask;
}

async function convertWebmBlobToMp4(blob, hasAudioTrack) {
  setExportModalState({
    title: "MP4 변환 준비 중...",
    detail: "변환 엔진을 불러오는 중입니다.",
    progress: 82,
  });
  const ff = await ensureMp4Transcoder();
  const inName = `in-${Date.now()}.webm`;
  const outName = `out-${Date.now()}.mp4`;
  setExportModalState({
    title: "MP4 변환 중...",
    detail: "webm 파일을 mp4로 변환하고 있어요.",
    progress: 90,
  });
  await ff.writeFile(inName, new Uint8Array(await blob.arrayBuffer()));
  const args = hasAudioTrack
    ? [
        "-i",
        inName,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "160k",
        "-movflags",
        "+faststart",
        outName,
      ]
    : [
        "-i",
        inName,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-an",
        "-movflags",
        "+faststart",
        outName,
      ];
  await ff.exec(args);
  setExportModalState({
    title: "MP4 변환 마무리 중...",
    detail: "출력 파일 정리 중입니다.",
    progress: 98,
  });
  const data = await ff.readFile(outName);
  try {
    await ff.deleteFile(inName);
  } catch (_) {}
  try {
    await ff.deleteFile(outName);
  } catch (_) {}
  return new Blob([data], { type: "video/mp4" });
}

/**
 * 캔버스·음원을 브라우저에서 MediaRecorder로 1:1 실시간 녹화 (서버/FFmpeg 불필요)
 */
async function downloadVideoFromCanvasRecording() {
  if (!project.scenes.length) {
    alert("「한 번에 숏폼 만들기」또는 사진을 넣은 뒤 시도하세요.");
    return;
  }
  if (typeof MediaRecorder === "undefined" || !canvas.captureStream) {
    esf.w("export: no MediaRecorder/captureStream");
    alert("이 환경에서는 캔버스 녹화를 쓸 수 없어요. Chrome 또는 Edge(데스크톱) 권장입니다.");
    return;
  }
  setLayoutEdit(false);
  const wasPlaying = playing;
  if (wasPlaying) {
    stopPlayback();
  }
  const saveCursor = cursorSec;
  const maxT = totalDuration();
  const wantAudio = !!(project.audioFile && audioEl?.src);
  const frameRate = 30;
  const videoStream = canvas.captureStream(frameRate);
  let combined;
  if (wantAudio) {
    try {
      audioEl.muted = false;
      if (typeof audioEl.captureStream === "function") {
        const as = audioEl.captureStream();
        const ats = as.getAudioTracks();
        if (ats.length) {
          combined = new MediaStream([...videoStream.getVideoTracks(), ...ats]);
        } else {
          esf.w("export: no audio track from captureStream, video only");
          combined = videoStream;
        }
      } else {
        combined = videoStream;
        esf.w("export: captureStream on audio N/A, video only");
      }
    } catch (e) {
      esf.w("export: audio stream (ignored), video only", e);
      combined = videoStream;
    }
  } else {
    combined = videoStream;
  }
  const hasAudioTrack = combined.getAudioTracks().length > 0;
  const mime = pickLocalRecorderMime(hasAudioTrack);
  if (!mime) {
    esf.w("export: no supported mime", { hasAudioTrack });
    alert("이 브라우저는 지원하는 녹화 코덱이 없어요. Chrome/Edge 권장.");
    return;
  }
  const opts = { mimeType: mime, videoBitsPerSecond: 6_000_000 };
  if (hasAudioTrack) {
    opts.audioBitsPerSecond = 192_000;
  }
  let rec;
  try {
    rec = new MediaRecorder(combined, opts);
  } catch (e) {
    esf.e("export: MediaRecorder create failed, retry without options", e);
    try {
      rec = new MediaRecorder(combined);
    } catch (e2) {
      esf.e("export: MediaRecorder failed", e2);
      alert("녹화를 시작할 수 없어요. 다른 브라우저를 써 주세요.");
      return;
    }
  }
  const chunks = [];
  rec.addEventListener("dataavailable", (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  });
  esf.i("export:start", { maxT, mime, hasAudioTrack, fileExt: fileExtFromVideoMime(mime) });
  els.status.textContent = "미리보기를 녹화해 저장 중… (끝날 때까지 잠시 기다리세요)";
  els.btnRender.disabled = true;
  setExportModalState({
    title: "영상 녹화 중...",
    detail: "장면을 순서대로 캡처하고 있습니다.",
    progress: 0,
  });
  showExportModal();
  let exportRaf = 0;
  const cleanAfter = () => {
    if (exportRaf) {
      cancelAnimationFrame(exportRaf);
    }
    audioEl.pause();
    audioEl.volume = 1;
    cursorSec = saveCursor;
    if (!playing) {
      drawFrame(selectedIndex >= 0 ? sceneAtTimeFromIndex(selectedIndex) : saveCursor);
    }
    els.btnRender.disabled = false;
    hideExportModal();
  };
  try {
    drawFrame(0);
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((resolve, reject) => {
      let done = false;
      const endOnce = (err) => {
        if (done) return;
        done = true;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };
      rec.addEventListener("error", (ev) => {
        const err = ev.error || new Error("MediaRecorder error");
        esf.e("export: MediaRecorder error", err);
        endOnce(err);
      });
      rec.addEventListener("stop", () => {
        void (async () => {
          try {
            const b = new Blob(chunks, { type: rec.mimeType || mime });
            if (b.size < 256) {
              esf.w("export:very small file", { size: b.size, chunks: chunks.length });
            }
            let outBlob = b;
            if (!String(b.type || "").toLowerCase().includes("mp4")) {
              try {
                els.status.textContent = "webm -> mp4 변환 중... (처음은 조금 오래 걸려요)";
                esf.i("mp4:convert start", { inputBytes: b.size, hasAudioTrack });
                outBlob = await convertWebmBlobToMp4(b, hasAudioTrack);
                esf.i("mp4:convert done", { outputBytes: outBlob.size });
              } catch (convErr) {
                esf.w("mp4:convert failed, fallback webm", convErr);
                els.status.textContent = `MP4 변환 실패로 WebM 저장: ${String(convErr?.message || convErr)}`;
                outBlob = b;
              }
            }
            const ext = fileExtFromVideoMime(outBlob.type || b.type || mime);
            const outName = `shortform-${Date.now()}.mp4`;
            const u = URL.createObjectURL(outBlob);
            const a = document.createElement("a");
            a.href = u;
            a.download = outName;
            a.click();
            URL.revokeObjectURL(u);
            esf.i("export:done", { bytes: outBlob.size, type: outBlob.type, name: outName });
            els.status.textContent = `다운로드: ${outName} (${ext.toUpperCase()} 원본) · Netlify 정적에서도 OK`;
            setTimeout(() => {
              hideExportModal();
            }, 120);
            setExportModalState({
              title: "다운로드 완료",
              detail: `${outName} 파일 저장을 시작했습니다.`,
              progress: 100,
            });
            endOnce();
          } catch (e) {
            endOnce(e);
          }
        })();
      });
      rec.start(200);
      const t0 = performance.now();
      if (hasAudioTrack) {
        audioEl.currentTime = 0;
        applyAudioFadeAtTime(0, maxT);
        const p = audioEl.play();
        if (p && typeof p.catch === "function") {
          p.catch((e) => esf.w("export: audio play (may be ok)", e));
        }
      }
      const step = () => {
        const elapsed = (performance.now() - t0) / 1000;
        const t = Math.min(elapsed, maxT);
        if (hasAudioTrack) {
          applyAudioFadeAtTime(t, maxT);
        }
        const p = maxT > 0 ? (t / maxT) * 80 : 0;
        setExportModalState({
          title: "영상 녹화 중...",
          detail: `${Math.min(t, maxT).toFixed(1)}s / ${maxT.toFixed(1)}s`,
          progress: p,
        });
        drawFrame(t);
        if (t >= maxT) {
          exportRaf = 0;
          setTimeout(() => {
            try {
              audioEl.pause();
              if (rec.state === "recording") {
                if (typeof rec.requestData === "function") {
                  rec.requestData();
                }
                rec.stop();
              }
            } catch (e) {
              esf.e("export: stop failed", e);
              endOnce(e);
            }
          }, 32);
          return;
        }
        exportRaf = requestAnimationFrame(step);
      };
      exportRaf = requestAnimationFrame(step);
    });
  } catch (err) {
    esf.e("export:failed", err);
    alert(String(err?.message || err));
    els.status.textContent = "녹화 중 오류가 났어요. 콘솔 [easyshortform]를 확인하세요.";
  } finally {
    cleanAfter();
  }
}

els.btnRender.addEventListener("click", () => {
  void downloadVideoFromCanvasRecording();
});

["dragenter", "dragover"].forEach((ev) => {
  els.dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    els.dropZone.classList.add("drag");
  });
});
["dragleave", "drop"].forEach((ev) => {
  els.dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    els.dropZone.classList.remove("drag");
  });
});
els.dropZone.addEventListener("drop", (e) => {
  const files = Array.from(e.dataTransfer?.files || []).filter(
    (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
  );
  if (files.length) void mergeFilesFromInput(files);
});

(async function boot() {
  populateUiSelects();
  populateSceneMediaScaleSelect();
  initStickerPalette();
  selectScene(-1);
  els.btnStickerPlace.disabled = true;
  els.btnClearStickers.disabled = true;
  if (els.stickerPalette) {
    els.stickerPalette.style.opacity = "0.35";
    els.stickerPalette.style.pointerEvents = "none";
  }
  if (els.audioFadeOutSec) {
    els.audioFadeOutSec.value = String(project.audioFadeOutSec || 2);
  }
  if (els.mediaBaseScale) {
    els.mediaBaseScale.value = String(project.mediaBaseScale || 100);
  }

if (els.mediaBaseScale) {
  els.mediaBaseScale.addEventListener("change", (e) => {
    const v = clampMediaBaseScale(parseInt(e.target.value, 10));
    project.mediaBaseScale = v;
    e.target.value = String(v);
    if (!playing) {
      drawFrame(selectedIndex >= 0 ? sceneAtTimeFromIndex(selectedIndex) : 0);
    }
    els.status.textContent = `전체 기본 미디어 크기: ${v}% (개별 장면은 오른쪽에서 따로 지정 가능)`;
  });
}
  try {
    await ensureFontsLoaded();
  } catch (e) {
    esf.w("boot:ensureFonts (non-fatal)", e);
  }
  esf.i("boot:done", {
    hasCanvas: !!canvas,
    hasCtx: !!ctx,
    version: "app", // 배포해 확인: 이 줄이 콘솔에 보면 app.js 끝까지 도달
  });
  drawFrame(0);
})();
