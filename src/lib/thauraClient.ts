/**
 * Thaura API Client
 * Thaura is Anthropic API-compatible, so we use the same structure
 * Lazy initialization prevents build-time errors when env vars aren't available
 */
import Anthropic from '@anthropic-ai/sdk';

let thauraClientInstance: Anthropic | null = null;

/**
 * Get Thaura client instance (lazy initialization)
 * This prevents errors during build time when env vars might not be available
 */
function getThauraClient(): Anthropic {
  if (!thauraClientInstance) {
    const thauraApiKey = process.env.ANTHROPIC_API_KEY || process.env.TH_AURA_API_KEY;
    const thauraBaseUrl = process.env.ANTHROPIC_BASE_URL || 'https://backend.thaura.ai';

    if (!thauraApiKey) {
      throw new Error('Missing ANTHROPIC_API_KEY (Thaura API key) environment variable. Please set it in your Vercel environment variables.');
    }

    thauraClientInstance = new Anthropic({
      apiKey: thauraApiKey,
      baseURL: thauraBaseUrl,
    });
  }

  return thauraClientInstance;
}

/**
 * Thaura client using Anthropic SDK with custom base URL
 * Lazy initialization ensures env vars are checked at runtime, not build time
 */
export const thauraClient = new Proxy({} as Anthropic, {
  get(_target, prop) {
    const client = getThauraClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export default thauraClient;