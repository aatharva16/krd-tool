import 'dotenv/config'
import OpenAI from 'openai'

const apiKey = process.env.OPENROUTER_API_KEY
if (!apiKey || apiKey.startsWith('sk-or-v1-...')) {
  throw new Error('OPENROUTER_API_KEY is required — check your .env file')
}

export const MODEL = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4-5'

export const client = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:5173',
    'X-Title': 'KRD Tool',
  },
})
