/**
 * Initializes the Anthropic Claude client with the API key from environment variables.
 * Lazy initialization prevents build-time errors when env vars aren't available
 */
import Anthropic from '@anthropic-ai/sdk';

let claudeClientInstance: Anthropic | null = null;

/**
 * Get Claude client instance (lazy initialization)
 * This prevents errors during build time when env vars might not be available
 */
function getClaudeClient(): Anthropic {
  if (!claudeClientInstance) {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY environment variable. Please set it in your Vercel environment variables.');
    }

    claudeClientInstance = new Anthropic({
      apiKey: anthropicApiKey,
    });
  }

  return claudeClientInstance;
}

/**
 * Claude client using Anthropic SDK
 * Lazy initialization ensures env vars are checked at runtime, not build time
 */
export const claudeClient = new Proxy({} as Anthropic, {
  get(_target, prop) {
    const client = getClaudeClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export default claudeClient;
