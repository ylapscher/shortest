import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: false,
  baseUrl: "http://localhost:3000",
  testPattern: "app/**/*.test.ts",
  anthropicKey: process.env.ANTHROPIC_API_KEY!,
  ai: {
    provider: "anthropic",
  },
  mailosaur: {
    apiKey: process.env.MAILOSAUR_API_KEY!,
    serverId: process.env.MAILOSAUR_SERVER_ID!,
  },
} satisfies ShortestConfig;
