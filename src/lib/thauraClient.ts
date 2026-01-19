/**
 * Thaura API Client
 * Thaura is Anthropic API-compatible, so we use the same structure
 */
import Anthropic from '@anthropic-ai/sdk';

const thauraApiKey = process.env.ANTHROPIC_API_KEY || process.env.TH_AURA_API_KEY;
const thauraBaseUrl = process.env.ANTHROPIC_BASE_URL || 'https://backend.thaura.ai';

if (!thauraApiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY (Thaura API key) environment variable');
}

/**
 * Thaura client using Anthropic SDK with custom base URL
 */
export const thauraClient = new Anthropic({
  apiKey: thauraApiKey,
  baseURL: thauraBaseUrl,
});

export default thauraClient;