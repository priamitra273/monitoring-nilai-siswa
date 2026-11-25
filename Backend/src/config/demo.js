export const isDemoMode = () =>
  process.env.VERCEL === '1' || process.env.DEMO_MODE === 'true'
