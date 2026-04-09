export async function register() {
  // Only validate on server startup (Node.js runtime), not Edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('@/lib/utils/env-validation')
    validateEnv()
  }
}

export const onRequestError = undefined
