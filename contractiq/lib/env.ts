import 'server-only'

// Server-enforced limits (engineering-doc §5, §8.6). Defaults match lib/constants.ts.
export const LIMITS = {
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024,
  maxPages: Number(process.env.MAX_PAGES ?? 20),
  maxContractTokens: Number(process.env.MAX_CONTRACT_TOKENS ?? 15000),
  maxCustomTerms: Number(process.env.MAX_CUSTOM_TERMS ?? 5),
  signedUrlTtl: Number(process.env.SIGNED_URL_TTL_SECONDS ?? 3600),
}

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'contracts'
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o'
