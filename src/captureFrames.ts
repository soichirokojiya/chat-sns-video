import { chromium } from "playwright";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
const SCENARIO_PATH = join(ROOT, "src", "scenario.json");
const FRAMES_DIR = join(ROOT, "output", "frames");
const HTML_PATH = join(ROOT, "public", "chat.html");

interface Scene {
  type: "hook" | "message" | "caption" | "ending" | "switchContext";
  text?: string;
  speaker?: string;
  time?: string;
  style?: string;
  lines?: string[];
  to?: string;
  dmWith?: string;
  durationMs: number;
}

interface Scenario {
  format: { width: number; height: number; fps: number };
  scenes: Scene[];
  [key: string]: unknown;
}

async function main() {
  const scenario: Scenario = JSON.parse(readFileSync(SCENARIO_PATH, "utf-8"));
  const { width, height, fps } = scenario.format;

  // Clean and create output dir
  if (existsSync(FRAMES_DIR)) {
    const { rmSync } = await import("fs");
    rmSync(FRAMES_DIR, { recursive: true });
  }
  mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });

  // Navigate to chat.html
  const fileUrl = `file://${HTML_PATH}`;
  await page.goto(fileUrl);

  // Mark as Playwright-controlled and init
  await page.evaluate(() => {
    (window as any).__PLAYWRIGHT_CONTROLLED__ = true;
  });
  await page.evaluate(
    (data) => (window as any).initScenario(data),
    scenario as any
  );

  let frameIndex = 0;

  async function captureFrame() {
    const padded = String(frameIndex).padStart(6, "0");
    await page.screenshot({
      path: join(FRAMES_DIR, `frame_${padded}.png`),
      type: "png",
    });
    frameIndex++;
  }

  const msPerFrame = 1000 / fps;

  for (const scene of scenario.scenes) {
    // Show the scene
    await page.evaluate(
      (s) => (window as any).showScene(s),
      scene as any
    );

    // Wait for CSS transition
    await page.waitForTimeout(500);

    // Capture frames for the duration
    const frameCount = Math.round(scene.durationMs / msPerFrame);
    for (let f = 0; f < frameCount; f++) {
      await captureFrame();
    }

    // Clear overlays after hook/caption
    if (scene.type === "hook" || scene.type === "caption") {
      await page.evaluate(() => (window as any).clearOverlays());
      // Capture a few transition frames
      await page.waitForTimeout(300);
      for (let f = 0; f < Math.round(500 / msPerFrame); f++) {
        await captureFrame();
      }
    }
  }

  await browser.close();
  console.log(`Captured ${frameIndex} frames to ${FRAMES_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
