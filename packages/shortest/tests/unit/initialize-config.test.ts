import fs from "fs/promises";
import path from "path";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

describe("initializeConfig", () => {
  const tempDir = path.join(process.cwd(), "temp-test-config");

  beforeEach(async () => {
    vi.resetModules();
    delete process.env.ANTHROPIC_API_KEY;
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test("loads TypeScript config file", async () => {
    await fs.writeFile(
      path.join(tempDir, "shortest.config.ts"),
      `
      export default {
        headless: true,
        baseUrl: "https://example.com",
        testPattern: ".*",
        ai: {
          provider: "anthropic",
          apiKey: "test-key",
        }
    }
      `,
    );

    const { initializeConfig } = await import("@/index");
    const config = await initializeConfig(tempDir);
    expect(config).toEqual({
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      ai: {
        provider: "anthropic",
        apiKey: "test-key",
        model: "claude-3-5-sonnet-20241022",
      },
    });
  });

  test("loads JavaScript config file", async () => {
    await fs.writeFile(
      path.join(tempDir, "shortest.config.js"),
      `
      export default {
        headless: true,
        baseUrl: 'https://example.com',
        testPattern: '.*',
        ai: {
          provider: "anthropic",
          apiKey: "test-key",
          model: "claude-3-5-sonnet-20241022"
        }
      }
      `,
    );

    const { initializeConfig } = await import("@/index");
    const config = await initializeConfig(tempDir);
    expect(config).toEqual({
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      ai: {
        provider: "anthropic",
        apiKey: "test-key",
        model: "claude-3-5-sonnet-20241022",
      },
    });
  });

  test("throws when multiple config files exist", async () => {
    await fs.writeFile(
      path.join(tempDir, "shortest.config.ts"),
      `
      export default {
        headless: true,
        baseUrl: "https://example.com",
        testPattern: ".*",
        anthropicKey: "test-key",
      }
      `,
    );

    await fs.writeFile(
      path.join(tempDir, "shortest.config.js"),
      `
      export default {
        headless: true,
        baseUrl: "https://example.com",
        testPattern: ".*",
        anthropicKey: "test-key",
      }
      `,
    );

    const { initializeConfig } = await import("@/index");
    await expect(initializeConfig(tempDir)).rejects.toThrow(
      "Multiple config files found",
    );
  });

  test("throws when no config file exists", async () => {
    const { initializeConfig } = await import("@/index");
    await expect(initializeConfig(tempDir)).rejects.toMatchObject({
      name: "ConfigError",
      type: "no-config",
      message: "No config file found. Please create one.",
    });
  });
});
