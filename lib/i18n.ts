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
  caisse: string
  accueil: string
  panier: string
  paiement: string
  recu: string
  etape: string
  rechercherProduit: string
  panierVide: string
  panierVideMessage: string
  total: string
  montantRecu: string
  renduMonnaie: string
  validerPayer: string
  especes: string
  imprimerPartager: string
  nouvelleVente: string
  dateHeure: string
  modePaiementLabel: string
  retour: string
  suivant: string
  clientPassage: string
  unite: string
  articles: string
  recuMerci: string
  aucunProduitCaisse: string
  ajouterProduitsAbord: string
  ajouterBoutique: string
  modifierBoutique: string
  nomBoutique: string
  typeBoutique: string
  couleurBoutique: string
  bienvenueSugu: string
  bienvenueSuguMessage: string
  creerPremiereBoutique: string
  essayerSugu: string
  mesBoutiques: string
  confirmerSuppressionBoutique: string
  parametres: string
  aPropos: string
  version: string
  bonjour: string
  commentSestPasseeVente: string
  satisfBien: string
  satisfCorrect: string
  satisfProbleme: string
  satisfaction: string
  satisfactionSemaine: string
  gererBoutiques: string
  aucuneBoutique: string
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
    caisse: 'Caisse',
    accueil: 'Accueil',
    panier: 'Panier',
    paiement: 'Paiement',
    recu: 'Reçu',
    etape: 'Étape',
    rechercherProduit: 'Rechercher un produit...',
    panierVide: 'Panier vide',
    panierVideMessage: "Touchez un produit pour l'ajouter au panier.",
    total: 'Total',
    montantRecu: 'Montant reçu',
    renduMonnaie: 'Monnaie à rendre',
    validerPayer: 'Valider & Payer',
    especes: 'Espèces',
    imprimerPartager: 'Imprimer / Partager',
    nouvelleVente: 'Nouvelle vente',
    dateHeure: 'Date & heure',
    modePaiementLabel: 'Mode de paiement',
    retour: 'Retour',
    suivant: 'Suivant',
    clientPassage: 'Client de passage',
    unite: 'Unité',
    articles: 'article(s)',
    recuMerci: 'Merci pour votre achat !',
    aucunProduitCaisse: 'Aucun produit trouvé',
    ajouterProduitsAbord: "Ajoutez d'abord des produits pour utiliser la caisse.",
    ajouterBoutique: 'Ajouter une boutique',
    modifierBoutique: 'Modifier la boutique',
    nomBoutique: 'Nom de la boutique',
    typeBoutique: "Type d'activité",
    couleurBoutique: 'Couleur',
    bienvenueSugu: 'Bienvenue sur SUGU',
    bienvenueSuguMessage: 'Créez votre première boutique pour commencer à gérer vos ventes, produits et clients.',
    creerPremiereBoutique: 'Créer ma première boutique',
    essayerSugu: 'Essayer SUGU',
    mesBoutiques: 'Mes Boutiques',
    confirmerSuppressionBoutique: 'Supprimer cette boutique et toutes ses données ?',
    parametres: 'Paramètres',
    aPropos: 'À propos',
    version: 'Version',
    bonjour: 'Bonjour',
    commentSestPasseeVente: 'Comment s\'est passée cette vente ?',
    satisfBien: 'Bien',
    satisfCorrect: 'Correct',
    satisfProbleme: 'Problème',
    satisfaction: 'Satisfaction',
    satisfactionSemaine: 'satisfaction cette semaine',
    gererBoutiques: 'Gérer mes boutiques',
    aucuneBoutique: 'Aucune boutique — créez-en une pour commencer.',
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
    caisse: 'Register',
    accueil: 'Home',
    panier: 'Cart',
    paiement: 'Payment',
    recu: 'Receipt',
    etape: 'Step',
    rechercherProduit: 'Search a product...',
    panierVide: 'Cart is empty',
    panierVideMessage: 'Tap a product to add it to the cart.',
    total: 'Total',
    montantRecu: 'Amount received',
    renduMonnaie: 'Change due',
    validerPayer: 'Confirm & Pay',
    especes: 'Cash',
    imprimerPartager: 'Print / Share',
    nouvelleVente: 'New sale',
    dateHeure: 'Date & time',
    modePaiementLabel: 'Payment method',
    retour: 'Back',
    suivant: 'Next',
    clientPassage: 'Walk-in customer',
    unite: 'Unit',
    articles: 'item(s)',
    recuMerci: 'Thank you for your purchase!',
    aucunProduitCaisse: 'No product found',
    ajouterProduitsAbord: 'Add products first to use the register.',
    ajouterBoutique: 'Add a shop',
    modifierBoutique: 'Edit shop',
    nomBoutique: 'Shop name',
    typeBoutique: 'Business type',
    couleurBoutique: 'Color',
    bienvenueSugu: 'Welcome to SUGU',
    bienvenueSuguMessage: 'Create your first shop to start managing your sales, products and customers.',
    creerPremiereBoutique: 'Create my first shop',
    essayerSugu: 'Try SUGU',
    mesBoutiques: 'My Shops',
    confirmerSuppressionBoutique: 'Delete this shop and all its data?',
    parametres: 'Settings',
    aPropos: 'About',
    version: 'Version',
    bonjour: 'Hello',
    commentSestPasseeVente: 'How did this sale go?',
    satisfBien: 'Good',
    satisfCorrect: 'Okay',
    satisfProbleme: 'Issue',
    satisfaction: 'Satisfaction',
    satisfactionSemaine: 'satisfaction this week',
    gererBoutiques: 'Manage my shops',
    aucuneBoutique: 'No shop yet — create one to get started.',
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
    caisse: 'Wari-so',
    accueil: 'So kɔnɔ',
    panier: 'Sɛnɛkɛminanw',
    paiement: 'Wari sara',
    recu: 'Sɛbɛn',
    etape: 'Yɔrɔ',
    rechercherProduit: 'Nɔgɔ ɲini...',
    panierVide: 'Panye lankolon',
    panierVideMessage: 'Nɔgɔ dɔ digi walasa ka a fara panye kan.',
    total: 'A bɛɛ lajɛlen',
    montantRecu: 'Wari sɔrɔlen',
    renduMonnaie: 'Wari segin',
    validerPayer: 'Dafa ni sara',
    especes: 'Wari kɛrɛnkɛrɛnnen',
    imprimerPartager: 'Bɔ sɛbɛn na / Ci',
    nouvelleVente: 'Fɛɛn kura',
    dateHeure: 'Don ni waati',
    modePaiementLabel: 'Sara sira',
    retour: 'Segin kɔ',
    suivant: 'Taa ɲɛ',
    clientPassage: 'Tɛmɛnbaa jatigu',
    unite: 'Sudon',
    articles: 'nɔgɔ(w)',
    recuMerci: 'I ni ce sanni na!',
    aucunProduitCaisse: 'Nɔgɔ si ma sɔrɔ',
    ajouterProduitsAbord: 'Aw ka nɔgɔw fara a kan fɔlɔ walasa ka wari-so kɛ.',
    ajouterBoutique: 'Sugu dɔ fara a kan',
    modifierBoutique: 'Sugu yɛlɛma',
    nomBoutique: 'Sugu tɔgɔ',
    typeBoutique: 'Baara suguya',
    couleurBoutique: 'Kulɛri',
    bienvenueSugu: 'I bisimila SUGU la',
    bienvenueSuguMessage: 'I ka sugu fɔlɔ dilan walasa ka i ka fɛɛnw, nɔgɔw ni jatiguew mara.',
    creerPremiereBoutique: 'N ka sugu fɔlɔ dilan',
    essayerSugu: 'Essayer SUGU',
    mesBoutiques: 'N ka Suguw',
    confirmerSuppressionBoutique: 'I b\'a fɛ ka sugu in ni a kunnafoniw bɛɛ bɔ wa ?',
    parametres: 'Labɛnw',
    aPropos: 'A kan kunnafoni',
    version: 'Bɔnɛ',
    bonjour: 'I ni sɔgɔma',
    commentSestPasseeVente: 'Fɛɛn in kɛra cogo di ?',
    satisfBien: 'A ka ɲi',
    satisfCorrect: 'A bɛnnen don',
    satisfProbleme: 'Gɛlɛya bɛ a la',
    satisfaction: 'Diyanyeko',
    satisfactionSemaine: 'diyanyeko dɔgɔkun in na',
    gererBoutiques: 'N ka suguw mara',
    aucuneBoutique: 'Sugu si tɛ — dɔ dilan walasa ka daminɛ.',
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
    caisse: 'Ligd-gãadgo',
    accueil: 'Zakẽ',
    panier: 'Rɔgd-bũmb',
    paiement: 'Yaoodo',
    recu: 'Sɛb-kɩta',
    etape: 'Taab-kẽedo',
    rechercherProduit: 'Baood bilg a yembr...',
    panierVide: 'Rɔgd-bũmb yaa zaalem',
    panierVideMessage: 'Sɩɩs bilg a yembr n paas rɔgd-bũmb pʋgẽ.',
    total: 'Fãa',
    montantRecu: 'Ligdi sɩɩlga',
    renduMonnaie: 'Ligdi lebs-b',
    validerPayer: 'Sak la yao',
    especes: 'Ligdi mengo',
    imprimerPartager: 'Yiisi sɛb-kɩta / Tʋʋg',
    nouvelleVente: 'Yood paalg',
    dateHeure: 'Daar la wakat',
    modePaiementLabel: 'Yaoodo manesem',
    retour: 'Lebg poorẽ',
    suivant: 'Tɩ taoore',
    clientPassage: 'Ned-tʋmd sẽn kẽesd',
    unite: 'Buud',
    articles: 'bũmb(u)',
    recuMerci: 'Barka ne yãmb dã!',
    aucunProduitCaisse: 'Bilg ba a yembr ka mikame',
    ajouterProduitsAbord: 'Paas-y bilgu deng n tõog n tũ ligd-gãadgo.',
    ajouterBoutique: 'Paas raaga a yembr',
    modifierBoutique: 'Toeem raaga',
    nomBoutique: 'Raaga yʋʋr',
    typeBoutique: 'Tʋʋm buudu',
    couleurBoutique: 'Melgre',
    bienvenueSugu: 'Yaa sõma ne yãmb SUGU pʋgẽ',
    bienvenueSuguMessage: 'Naan-y y raaga a yembr n paas n tõog n mao ne y yoodo, bilgu la ned-tʋmba.',
    creerPremiereBoutique: 'Naan mam raaga a yembr',
    essayerSugu: 'Essayer SUGU',
    mesBoutiques: 'Mam raadã',
    confirmerSuppressionBoutique: 'Yiisi raaga kãnga ne a võorã fãa ?',
    parametres: 'Naaneg-toaaga',
    aPropos: 'A yell-gomde',
    version: 'Versiõ',
    bonjour: 'Ne y yibeoogo',
    commentSestPasseeVente: 'Yood kãnga maana wãn to ?',
    satisfBien: 'Sõma',
    satisfCorrect: 'Zemsa',
    satisfProbleme: 'Zu-loees',
    satisfaction: 'Sũ-noogo',
    satisfactionSemaine: 'sũ-noog yʋʋmd-kãseng kãnga pʋgẽ',
    gererBoutiques: 'Maan m raadã',
    aucuneBoutique: 'Raaga ka be ye — naan-y a yembr n sɩɩs.',
  },
}
