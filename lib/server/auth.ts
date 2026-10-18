import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { obtenirPool } from '@/lib/server/db'
import { envoyerCourriel } from '@/lib/server/mailer'

function origines(): string[] {
  const liste = new Set<string>()
  if (process.env.BETTER_AUTH_URL) liste.add(process.env.BETTER_AUTH_URL)
  if (process.env.VERCEL_URL) liste.add(`https://${process.env.VERCEL_URL}`)
  if (process.env.VERCEL_BRANCH_URL) liste.add(`https://${process.env.VERCEL_BRANCH_URL}`)
  liste.add('http://localhost:3000')
  liste.add('http://localhost:3100')
  return [...liste]
}

export const auth = betterAuth({
  database: obtenirPool(),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: origines(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      await envoyerCourriel({
        a: user.email,
        sujet: 'SUGU : changer votre mot de passe',
        texte: `Bonjour,\n\nPour choisir un nouveau mot de passe SUGU, ouvrez ce lien (valable 1 heure) :\n${url}\n\nSi vous n'avez rien demandé, ignorez ce message.`,
      })
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 60, updateAge: 60 * 60 * 24 },
  rateLimit: {
    enabled: true,
    storage: 'database',
    window: 60,
    max: 60,
    customRules: {
      '/sign-in/email': { window: 60, max: 8 },
      '/sign-up/email': { window: 3600, max: 10 },
      '/request-password-reset': { window: 3600, max: 5 },
      '/forget-password': { window: 3600, max: 5 },
      '/reset-password': { window: 3600, max: 10 },
    },
  },
  advanced: { useSecureCookies: process.env.NODE_ENV === 'production' },
  plugins: [nextCookies()],
})
