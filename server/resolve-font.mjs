import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundledDir = path.join(__dirname, "fonts");

/** Google Fonts 패밀리 이름 → 번들 TTF */
const MAP = {
  Jua: "Jua-Regular.ttf",
  Gaegu: "Gaegu-Regular.ttf",
  Dongle: "Dongle-Regular.ttf",
  "Poor Story": "PoorStory-Regular.ttf",
  "Yeon Sung": "YeonSung-Regular.ttf",
  "Hi Melody": "HiMelody-Regular.ttf",
  "Single Day": "SingleDay-Regular.ttf",
  "Nanum Pen Script": "NanumPenScript-Regular.ttf",
  "Black Han Sans": "BlackHanSans-Regular.ttf",
  "Do Hyeon": "DoHyeon-Regular.ttf",
  Sunflower: "Sunflower-Medium.ttf",
  "Bagel Fat One": "BagelFatOne-Regular.ttf",
  "Gamja Flower": "GamjaFlower-Regular.ttf",
  "Kirang Haerang": "KirangHaerang-Regular.ttf",
  Diphylleia: "Diphylleia-Regular.ttf",
  Orbit: "Orbit-Regular.ttf",
  "Gowun Dodum": "GowunDodum-Regular.ttf",
  "Gowun Batang": "GowunBatang-Regular.ttf",
  "Nanum Brush Script": "NanumBrushScript-Regular.ttf",
  "Mochiy Pop One": "MochiyPopOne-Regular.ttf",
};

export function resolveMainFontFile(family) {
  if (!family || typeof family !== "string") return null;
  const key = family.trim();
  let file = MAP[key];
  if (!file) {
    const noSpace = key.replace(/\s+/g, "");
    const hit = Object.keys(MAP).find((k) => k.replace(/\s+/g, "") === noSpace);
    if (hit) file = MAP[hit];
  }
  if (file) {
    const full = path.join(bundledDir, file);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

export function resolveFallbackKoreanFont() {
  const env = process.env.FFMPEG_FONTFILE;
  if (env && fs.existsSync(env)) return env;
  if (fs.existsSync("C:/Windows/Fonts/malgun.ttf")) {
    return "C:\\\\Windows\\\\Fonts\\\\malgun.ttf";
  }
  return null;
}

export function resolveEmojiFontFile() {
  const env = process.env.FFMPEG_EMOJI_FONTFILE;
  if (env && fs.existsSync(env)) return env;
  if (fs.existsSync("C:/Windows/Fonts/seguiemj.ttf")) {
    return "C:\\\\Windows\\\\Fonts\\\\seguiemj.ttf";
  }
  return null;
}
