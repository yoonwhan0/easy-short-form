import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import {
  resolveEmojiFontFile,
  resolveFallbackKoreanFont,
  resolveMainFontFile,
} from "./resolve-font.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3847;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], ...opts });
    let err = "";
    p.stderr.on("data", (d) => {
      err += d.toString();
    });
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}\n${err.slice(-4000)}`));
    });
  });
}

function slashFontPath(p) {
  return String(p).replace(/\\/g, "/");
}

function escapeDrawtext(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/\n/g, " ");
}

function sceneEffectFilters(effect) {
  switch (effect) {
    case "stars":
      return "noise=alls=10:allf=t+u,vignette=angle=PI/5";
    case "hearts":
      return "eq=brightness=0.03:saturation=1.35";
    case "dream":
      return "hue=s=0.9,eq=contrast=0.94:gamma=1.05";
    case "sparkle":
      return "noise=alls=14:allf=t+u";
    case "neon":
      return "eq=saturation=1.5:brightness=0.02,unsharp=3:3:0.45:0.45";
    case "sunset":
      return "eq=saturation=1.3:brightness=0.04:contrast=0.96";
    case "mono":
      return "hue=s=0";
    case "snow":
      return "noise=alls=12:allf=t+u";
    case "rain":
      return "noise=alls=7:allf=t";
    case "comic":
      return "noise=alls=24:allf=t+u";
    case "vintage":
      return "eq=gamma=1.12:saturation=0.88";
    case "ocean":
      return "eq=saturation=1.15:brightness=-0.02";
    default:
      return "";
  }
}

/**
 * @param {{ W: number, H: number, sc: any, ts: any, mainFont: string | null, emojiFontPath: string | null }} o
 */
function buildSceneFilter(o) {
  const { W, H, sc, ts, mainFont, emojiFontPath } = o;
  const baseScale = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
  const parts = [baseScale];

  const fx = sceneEffectFilters(sc.effect || "none");
  if (fx) parts.push(fx);

  const mainSize = Number(ts.fontSize) || 56;
  const stickers = Array.isArray(sc.stickers) ? sc.stickers : [];
  const emojiOpt = emojiFontPath
    ? `:fontfile='${slashFontPath(emojiFontPath)}'`
    : "";

  for (const st of stickers) {
    const emoji = String(st.emoji || "").trim();
    if (!emoji) continue;
    const fsStick = Math.max(
      24,
      Math.round(mainSize * (Number(st.scale) || 1) * 1.2),
    );
    const cx = Number(st.x) || W / 2;
    const cy = Number(st.y) || H / 2;
    parts.push(
      `drawtext=text='${escapeDrawtext(emoji)}':fontsize=${fsStick}:fontcolor=white:x=${cx}-text_w/2:y=${cy}-text_h/2${emojiOpt}`,
    );
  }

  const text = sc.text ? String(sc.text) : "";
  if (text) {
    const color = (ts.color || "#ffffff").replace("#", "0x");
    const align = ts.align || "center";
    let xExpr = "(w-text_w)/2";
    if (align === "left") xExpr = "48";
    else if (align === "right") xExpr = "w-text_w-48";
    else if (align !== "center" && ts.x != null) xExpr = String(ts.x);
    const yExpr = ts.y != null ? String(ts.y) : "h*0.78";
    const mf = mainFont ? `:fontfile='${slashFontPath(mainFont)}'` : "";
    parts.push(
      `drawtext=text='${escapeDrawtext(text)}':fontsize=${mainSize}:fontcolor=${color}:x=${xExpr}:y=${yExpr}${mf}`,
    );
  }

  return parts.join(",");
}

/**
 * POST /api/render
 * multipart: scene_0, scene_1, ... , optional audio
 * field project: JSON string { width, height, scenes: [{ type, duration, text, textStyle }] }
 */
app.post("/api/render", upload.any(), async (req, res) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "esf-"));
  try {
    const projectRaw = req.body?.project;
    if (!projectRaw) {
      res.status(400).json({ error: "project 필드(JSON 문자열)가 필요합니다." });
      return;
    }
    const project = typeof projectRaw === "string" ? JSON.parse(projectRaw) : projectRaw;
    const W = project.width || 1080;
    const H = project.height || 1920;
    const scenes = project.scenes || [];
    if (!scenes.length) {
      res.status(400).json({ error: "scenes가 비었습니다." });
      return;
    }

    const files = {};
    for (const f of req.files || []) {
      files[f.fieldname] = f;
    }

    const emojiFontPath = resolveEmojiFontFile();
    const segmentPaths = [];

    for (let i = 0; i < scenes.length; i++) {
      const sc = scenes[i];
      const f = files[`scene_${i}`];
      if (!f?.buffer) {
        res.status(400).json({ error: `scene_${i} 파일이 없습니다.` });
        return;
      }

      const orig = f.originalname || "";
      const extGuess =
        sc.type === "video"
          ? ".mp4"
          : path.extname(orig) || (orig.toLowerCase().endsWith(".png") ? ".png" : ".jpg");
      const inPath = path.join(tmp, `in_${i}${extGuess.startsWith(".") ? extGuess : ".jpg"}`);
      fs.writeFileSync(inPath, f.buffer);

      const dur = Math.max(0.3, Number(sc.duration) || 2);
      const segOut = path.join(tmp, `seg_${i}.mp4`);

      const ts = sc.textStyle || {};
      const mainFont =
        resolveMainFontFile(ts.fontFamily || "Jua") || resolveFallbackKoreanFont();
      const vf = buildSceneFilter({
        W,
        H,
        sc,
        ts,
        mainFont,
        emojiFontPath,
      });

      if (sc.type === "video") {
        await run("ffmpeg", [
          "-y",
          "-i",
          inPath,
          "-t",
          String(dur),
          "-vf",
          vf,
          "-an",
          "-r",
          "30",
          "-pix_fmt",
          "yuv420p",
          segOut,
        ]);
      } else {
        await run("ffmpeg", [
          "-y",
          "-loop",
          "1",
          "-i",
          inPath,
          "-t",
          String(dur),
          "-vf",
          vf,
          "-r",
          "30",
          "-pix_fmt",
          "yuv420p",
          segOut,
        ]);
      }
      segmentPaths.push(segOut);
    }

    const listPath = path.join(tmp, "concat.txt");
    fs.writeFileSync(
      listPath,
      segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n"),
    );

    const merged = path.join(tmp, "merged.mp4");
    await run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", merged]);

    const audioFile = files["audio"];
    const finalOut = path.join(tmp, "final.mp4");
    if (audioFile?.buffer?.length) {
      const audioPath = path.join(tmp, "audio.bin");
      fs.writeFileSync(audioPath, audioFile.buffer);
      await run("ffmpeg", [
        "-y",
        "-i",
        merged,
        "-i",
        audioPath,
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        finalOut,
      ]);
    } else {
      fs.copyFileSync(merged, finalOut);
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'attachment; filename="shortform.mp4"');
    const stream = fs.createReadStream(finalOut);
    stream.on("error", () => {
      try {
        fs.rmSync(tmp, { recursive: true, force: true });
      } catch (_) {}
    });
    stream.pipe(res);
    res.on("finish", () => {
      try {
        fs.rmSync(tmp, { recursive: true, force: true });
      } catch (_) {}
    });
  } catch (e) {
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch (_) {}
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`easyshortform http://localhost:${PORT}`);
});
