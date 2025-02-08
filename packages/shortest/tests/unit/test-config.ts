import { describe, test, expect, beforeEach } from "vitest";
import { parseConfig } from "@/utils/config";
import { AmazonBedrockProviderConfig } from "@/types";

describe("Config parsing", () => {
  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.SHORTEST_AWS_REGION;
  });

  test("validates correct config with legacy anthropicKey", () => {
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      anthropicKey: "test-key",
    };
    expect(() => parseConfig(config)).not.toThrow();
  });

  test("validates correct config with AI configuration", () => {
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      ai: {
        provider: "anthropic",
        apiKey: "test-key",
      },
    };
    expect(() => parseConfig(config)).not.toThrow();
  });

  test("throws on invalid baseUrl", () => {
    const config = {
      headless: true,
      baseUrl: "not-a-url",
      testPattern: ".*",
      anthropicKey: "test",
    };
    expect(() => parseConfig(config)).toThrowError("must be a valid URL");
  });

  test("throws on invalid testPattern", () => {
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: null,
      anthropicKey: "test",
    };
    expect(() => parseConfig(config)).toThrowError(
      "Expected string, received null",
    );
  });

  test("throws when Mailosaur config is incomplete", () => {
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      anthropicKey: "test",
      mailosaur: { apiKey: "key" }, // missing serverId
    };
    expect(() => parseConfig(config)).toThrowError("Required");
  });

  test("accepts config when anthropicKey is in env", () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
    };
    expect(() => parseConfig(config)).not.toThrow();
  });

  test("throws when neither anthropicKey nor AI configuration is provided", () => {
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
    };
    expect(() => parseConfig(config)).toThrowError(
      "No AI configuration provided. Please provide the 'ai' configuration.",
    );
  });

  test("throws when both anthropicKey and ai configurations are provided", () => {
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      anthropicKey: "test-key",
      ai: {
        provider: "anthropic",
        apiKey: "test-key",
      },
    };
    expect(() => parseConfig(config)).toThrowError(
      "Both 'ai' and legacy 'anthropicKey' are provided. Please remove the deprecated 'anthropicKey'.",
    );
  });

  test("transforms legacy anthropicKey into new AI object", () => {
    const apiKey = "testKey";
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      anthropicKey: apiKey,
    };

    const expectedConfig = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      ai: {
        provider: "anthropic",
        apiKey,
        model: "claude-3-5-sonnet", // defaults to claude-3-5-sonnet automatically
      },
    };

    expect(parseConfig(config)).toEqual(expectedConfig);
  });

  test("should take ommited provider props from env", () => {
    process.env.SHORTEST_AWS_REGION = "test-env";
    const config = {
      headless: true,
      baseUrl: "https://example.com",
      testPattern: ".*",
      ai: {
        provider: "amazon-bedrock",
        // region ommited
        accessKeyId: "test-key",
        secretAccessKey: "test-key",
      },
    };
    const parsedConfig = parseConfig(config);

    expect((parsedConfig.ai as AmazonBedrockProviderConfig).region).toBe(
      "test-env",
    );
  });
});
