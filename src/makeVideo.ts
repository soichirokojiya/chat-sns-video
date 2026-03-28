import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, join } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const SCENARIO_PATH = join(ROOT, "src", "scenario.json");
const FRAMES_DIR = join(ROOT, "output", "frames");
const OUTPUT_PATH = join(ROOT, "output", "final.mp4");

const scenario = JSON.parse(readFileSync(SCENARIO_PATH, "utf-8"));
const fps = scenario.format.fps;

const cmd = [
  "ffmpeg",
  "-y",
  `-framerate ${fps}`,
  `-i "${join(FRAMES_DIR, "frame_%06d.png")}"`,
  "-c:v libx264",
  "-pix_fmt yuv420p",
  "-preset medium",
  "-crf 18",
  // Ensure dimensions are divisible by 2
  '-vf "pad=ceil(iw/2)*2:ceil(ih/2)*2"',
  `"${OUTPUT_PATH}"`,
].join(" ");

console.log("Running ffmpeg...");
console.log(cmd);

try {
  execSync(cmd, { stdio: "inherit" });
  console.log(`\nVideo saved to ${OUTPUT_PATH}`);
} catch {
  console.error("ffmpeg failed. Is ffmpeg installed?");
  console.error("Install with: brew install ffmpeg");
  process.exit(1);
}
