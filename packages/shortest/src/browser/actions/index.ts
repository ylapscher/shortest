import { Page } from "playwright";
import { ToolError } from "../core";

export const keyboardShortcuts: Record<string, string | string[]> = {
  "ctrl+l": ["Control", "l"],
  "ctrl+a": ["Control", "a"],
  "ctrl+c": ["Control", "c"],
  "ctrl+v": ["Control", "v"],
  "alt+tab": ["Alt", "Tab"],
  return: ["Enter"],
  enter: ["Enter"],
  esc: ["Escape"],
  tab: ["Tab"],
  delete: ["Delete"],
  backspace: ["Backspace"],
  space: [" "],
  arrowup: ["ArrowUp"],
  arrowdown: ["ArrowDown"],
  arrowleft: ["ArrowLeft"],
  arrowright: ["ArrowRight"],
  page_down: ["PageDown"],
  page_up: ["PageUp"],
};

export const scaleRatio = {
  x: 1543 / 1170,
  y: 32 / 24,
};

export async function mouseMove(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
    throw new ToolError("Coordinates must be non-negative integers");
  }

  const scaledX = Math.round(x * scaleRatio.x);
  const scaledY = Math.round(y * scaleRatio.y);

  await page.mouse.move(scaledX, scaledY);

  // Update visual cursor
  await page.evaluate(
    ({ x, y }) => {
      const cursor = document.getElementById("ai-cursor");
      const trail = document.getElementById("ai-cursor-trail");
      if (cursor && trail) {
        window.cursorPosition = { x, y };
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;

        setTimeout(() => {
          trail.style.left = `${x}px`;
          trail.style.top = `${y}px`;
        }, 50);
      }
    },
    { x: scaledX, y: scaledY },
  );

  await page.waitForTimeout(50);
}

export async function click(page: Page, x: number, y: number): Promise<void> {
  const scaledX = Math.round(x * scaleRatio.x);
  const scaledY = Math.round(y * scaleRatio.y);

  await mouseMove(page, x, y);
  
  // Start navigation promise before clicking
  const navigationPromise = page.waitForNavigation({ 
    waitUntil: 'domcontentloaded',
    timeout: 5000 
  }).catch(() => {}); // Ignore timeout
  
  await page.mouse.click(scaledX, scaledY);
  await showClickAnimation(page, "left");
  
  // Wait for navigation if it started
  await navigationPromise;
}

export async function dragMouse(
  page: Page,
  x: number,
  y: number,
): Promise<void> {
  const scaledX = Math.round(x * scaleRatio.x);
  const scaledY = Math.round(y * scaleRatio.y);

  await page.mouse.down();
  await page.mouse.move(scaledX, scaledY);
  await page.mouse.up();
}

export async function showClickAnimation(
  page: Page,
  type: "left" | "right" | "double" = "left",
): Promise<void> {
  await page.evaluate((clickType) => {
    const cursor = document.getElementById("ai-cursor");
    if (cursor) {
      cursor.classList.add("clicking");

      switch (clickType) {
        case "double":
          cursor.style.transform = "translate(-50%, -50%) scale(0.7)";
          cursor.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
          break;
        case "right":
          cursor.style.borderColor = "blue";
          break;
        default:
          cursor.style.transform = "translate(-50%, -50%) scale(0.8)";
      }

      setTimeout(() => {
        cursor.classList.remove("clicking");
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        cursor.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        cursor.style.borderColor = "red";
      }, 200);
    }
  }, type);
}

export async function getCursorPosition(page: Page): Promise<[number, number]> {
  const position = await page.evaluate(() => {
    return window.cursorPosition || { x: 0, y: 0 };
  });
  return [position.x, position.y];
}
