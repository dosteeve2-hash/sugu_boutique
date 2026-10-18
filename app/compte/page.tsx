import CompteClient from '@/components/CompteClient'
import { courrielConfigure } from '@/lib/server/mailer'

export const dynamic = 'force-dynamic'

export default function PageCompte() {
  return <CompteClient courrielActif={courrielConfigure()} />
}
