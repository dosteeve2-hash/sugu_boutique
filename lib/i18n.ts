export type Langue = 'fr' | 'en' | 'jula' | 'more'

export const LANGUES: { code: Langue; label: string; drapeau: string }[] = [
  { code: 'fr', label: 'Français', drapeau: '🇧🇫' },
  { code: 'en', label: 'English', drapeau: '🇬🇧' },
  { code: 'jula', label: 'Julakan', drapeau: '🌍' },
  { code: 'more', label: 'Mooré', drapeau: '🌍' },
]

export type Traduction = {
  tagline: string
  dashboard: string
  produits: string
  ventes: string
  achats: string
  clients: string
  fournisseurs: string
  stock: string
  rapports: string
  ajouter: string
  ajouterProduit: string
  ajouterVente: string
  ajouterAchat: string
  ajouterClient: string
  ajouterFournisseur: string
  nom: string
  prix: string
  quantite: string
  telephone: string
  ville: string
  categorie: string
  modifier: string
  supprimer: string
  annuler: string
  enregistrer: string
  rechercher: string
  aucunDonnee: string
  commencer: string
  enLigne: string
  horsLigne: string
  langue: string
}

export const traductions: Record<Langue, Traduction> = {
  fr: {
    tagline: 'Mon Marché',
    dashboard: 'Tableau de Bord',
    produits: 'Produits',
    ventes: 'Ventes',
    achats: 'Achats',
    clients: 'Clients',
    fournisseurs: 'Fournisseurs',
    stock: 'Stock',
    rapports: 'Rapports',
    ajouter: 'Ajouter',
    ajouterProduit: 'Ajouter un Produit',
    ajouterVente: 'Nouvelle Vente',
    ajouterAchat: 'Nouvel Achat',
    ajouterClient: 'Ajouter un Client',
    ajouterFournisseur: 'Ajouter un Fournisseur',
    nom: 'Nom',
    prix: 'Prix',
    quantite: 'Quantité',
    telephone: 'Téléphone',
    ville: 'Ville',
    categorie: 'Catégorie',
    modifier: 'Modifier',
    supprimer: 'Supprimer',
    annuler: 'Annuler',
    enregistrer: 'Enregistrer',
    rechercher: 'Rechercher...',
    aucunDonnee: 'Aucune donnée pour le moment',
    commencer: 'Commencer',
    enLigne: 'En ligne',
    horsLigne: 'Hors ligne — données sauvegardées',
    langue: 'Langue',
  },
  en: {
    tagline: 'My Market',
    dashboard: 'Dashboard',
    produits: 'Products',
    ventes: 'Sales',
    achats: 'Purchases',
    clients: 'Customers',
    fournisseurs: 'Suppliers',
    stock: 'Stock',
    rapports: 'Reports',
    ajouter: 'Add',
    ajouterProduit: 'Add a Product',
    ajouterVente: 'New Sale',
    ajouterAchat: 'New Purchase',
    ajouterClient: 'Add a Customer',
    ajouterFournisseur: 'Add a Supplier',
    nom: 'Name',
    prix: 'Price',
    quantite: 'Quantity',
    telephone: 'Phone',
    ville: 'City',
    categorie: 'Category',
    modifier: 'Edit',
    supprimer: 'Delete',
    annuler: 'Cancel',
    enregistrer: 'Save',
    rechercher: 'Search...',
    aucunDonnee: 'No data yet',
    commencer: 'Get started',
    enLigne: 'Online',
    horsLigne: 'Offline — data saved locally',
    langue: 'Language',
  },
  jula: {
    tagline: 'N ka Sugu',
    dashboard: 'Waati Kɔnɔ',
    produits: 'Nɔgɔw',
    ventes: 'Fɛɛnw',
    achats: 'Sanni',
    clients: 'Jatiguew',
    fournisseurs: 'Baarakɛlaw',
    stock: 'Jɛnsɛnni',
    rapports: 'Kunnafoniw',
    ajouter: 'Fara a kan',
    ajouterProduit: 'Nɔgɔ dɔ fara a kan',
    ajouterVente: 'Fɛɛn kura',
    ajouterAchat: 'San kura',
    ajouterClient: 'Jatigu dɔ fara a kan',
    ajouterFournisseur: 'Baarakɛla dɔ fara a kan',
    nom: 'Tɔgɔ',
    prix: 'Wari',
    quantite: 'Hakɛ',
    telephone: 'Telefɔni',
    ville: 'Dugu',
    categorie: 'Kulu',
    modifier: 'Yɛlɛma',
    supprimer: 'Bɔ a la',
    annuler: 'Dabila',
    enregistrer: 'Mara',
    rechercher: 'Ɲini...',
    aucunDonnee: 'Fɛn si tɛ yan fɔlɔ',
    commencer: 'Daminɛ',
    enLigne: 'A be ɛntɛrinɛti kan',
    horsLigne: 'A tɛ ɛntɛrinɛti kan — kunnafoniw maraw',
    langue: 'Kan',
  },
  more: {
    tagline: 'Mam Raaga',
    dashboard: 'Koglsablga',
    produits: 'Bilgu',
    ventes: 'Yooda',
    achats: 'Rɔɔg',
    clients: 'Ned-tʋmba',
    fournisseurs: 'Tʋma-neba',
    stock: 'Bilgu-saagẽ',
    rapports: 'Sɛb-taasa',
    ajouter: 'Tũudẽ',
    ajouterProduit: 'Tũud bilg a yembr',
    ajouterVente: 'Yood paalg',
    ajouterAchat: 'Rɔɔgd paalg',
    ajouterClient: 'Tũud ned-tʋmd a yembr',
    ajouterFournisseur: 'Tũud tʋma-neda a yembr',
    nom: 'Yʋʋr',
    prix: 'Ligdi',
    quantite: 'Yɩɩn',
    telephone: 'Telefondo',
    ville: 'Tẽng',
    categorie: 'Buud',
    modifier: 'Toeem',
    supprimer: 'Yiisi',
    annuler: 'Bas',
    enregistrer: 'Gãd',
    rechercher: 'Baoodo...',
    aucunDonnee: 'Võor wã pa be ye',
    commencer: 'Fulle',
    enLigne: 'Interneti pʋgẽ',
    horsLigne: 'Interneti pa be ye — võor gãda',
    langue: 'Gomd',
  },
}
