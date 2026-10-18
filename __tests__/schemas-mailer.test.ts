import { describe, expect, it, vi } from 'vitest'
import { connexionSchema, inscriptionSchema, opSchema, remboursementSchema, venteSchema } from '@/lib/sync/schemas'
import { courrielConfigure, envoyerCourriel } from '@/lib/server/mailer'

describe('validation (client et serveur partagent les schémas)', () => {
  it('inscription : nom, e-mail et mot de passe valides', () => {
    const ok = inscriptionSchema.safeParse({ nomBoutique: 'Boutique Aminata', email: ' Aminata@Exemple.COM ', motDePasse: 'motdepasse1' })
    expect(ok.success).toBe(true)
    if (ok.success) expect(ok.data.email).toBe('aminata@exemple.com')
  })
  it('inscription : refuse un mot de passe court et un e-mail invalide', () => {
    expect(inscriptionSchema.safeParse({ nomBoutique: 'B', email: 'x', motDePasse: '123' }).success).toBe(false)
    expect(connexionSchema.safeParse({ email: 'a@b.co', motDePasse: '' }).success).toBe(false)
  })
  it('remboursement : entier positif seulement', () => {
    expect(remboursementSchema.safeParse({ clientId: 1, montant: 500, mode: 'Espèces' }).success).toBe(true)
    expect(remboursementSchema.safeParse({ clientId: 1, montant: 0, mode: 'Espèces' }).success).toBe(false)
    expect(remboursementSchema.safeParse({ clientId: 1, montant: 5.5, mode: 'Espèces' }).success).toBe(false)
    expect(remboursementSchema.safeParse({ clientId: 1, montant: 500, mode: 'Crédit' }).success).toBe(false)
  })
  it('vente à crédit exige un client', () => {
    const base = { id: 1, clientId: null, client: 'x', lignes: [], total: 10, modePaiement: 'Crédit', statut: 'Crédit', date: '2026-10-18' }
    expect(venteSchema.safeParse(base).success).toBe(false)
    expect(venteSchema.safeParse({ ...base, clientId: 4 }).success).toBe(true)
  })
  it('opération : identifiants et dates stricts', () => {
    const base = { opId: 'abcdefgh-1', entite: 'produits', boutiqueId: 'bt_1_x', id: '1', type: 'upsert', at: '2026-10-18T10:00:00.000Z' }
    expect(opSchema.safeParse(base).success).toBe(true)
    expect(opSchema.safeParse({ ...base, id: "1'; drop table x;--" }).success).toBe(false)
    expect(opSchema.safeParse({ ...base, entite: 'user' }).success).toBe(false)
    expect(opSchema.safeParse({ ...base, at: 'hier' }).success).toBe(false)
  })
})

describe('courriel de réinitialisation', () => {
  it('sans clé de service : aucun envoi, aucune requête réseau', async () => {
    delete process.env.RESEND_API_KEY
    delete process.env.MAIL_FROM
    const appel = vi.fn()
    expect(courrielConfigure()).toBe(false)
    expect(await envoyerCourriel({ a: 'x@y.co', sujet: 's', texte: 't' }, appel as unknown as typeof fetch)).toBe(false)
    expect(appel).not.toHaveBeenCalled()
  })
  it('avec une clé : appelle le service d’envoi', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.MAIL_FROM = 'SUGU <no-reply@example.com>'
    const appel = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    expect(await envoyerCourriel({ a: 'x@y.co', sujet: 's', texte: 't' }, appel as unknown as typeof fetch)).toBe(true)
    expect(appel).toHaveBeenCalledOnce()
    delete process.env.RESEND_API_KEY
    delete process.env.MAIL_FROM
  })
})
