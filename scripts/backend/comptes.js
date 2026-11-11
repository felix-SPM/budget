// Identifiant réservé au propriétaire "Joint" (compte commun à tous les utilisateurs)
const ID_JOINT = 0

// Liste des utilisateurs valides (on ignore les entrées sans ID)
function utilisateursValides(){
    return (data.user || []).filter(u => u.id !== '' && u.id !== null && u.id !== undefined)
}

// "Joint" n'est proposé que s'il y a plus d'un utilisateur
function jointDisponible(){
    return utilisateursValides().length > 1
}

// Liste des choix possibles pour un propriétaire de compte ou une charge de dépense :
// chaque utilisateur, puis "Joint" s'il y a plusieurs utilisateurs
function listeProprietaires(){
    const liste = utilisateursValides().map(u => ({ id: u.id, nom: u.nom }))
    if (jointDisponible()) liste.push({ id: ID_JOINT, nom: 'Joint' })
    return liste
}

// Nom affiché du propriétaire d'un compte (ou de la charge d'une dépense)
function nomProprietaire(idProprietaire){
    if (idProprietaire === ID_JOINT) return 'Joint'
    const user = utilisateursValides().find(u => u.id === idProprietaire)
    return user ? user.nom : '?'
}

// Première lettre (majuscule, sans accent) du propriétaire : "Joint" -> J, "Félix" -> F
function lettreProprietaire(idProprietaire){
    const nom = nomProprietaire(idProprietaire)
    if (nom === '?' || nom === '') return ''
    return nom[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
}

// Nombre de lettres imposé pour la partie saisie du symbole
const LONGUEUR_SUFFIXE_SYMBOLE = 3

// Nettoie la partie saisie du symbole : lettres majuscules sans accent uniquement, 3 au maximum
function nettoyerSuffixeSymbole(suffixe){
    return String(suffixe)
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, LONGUEUR_SUFFIXE_SYMBOLE)
}

// Fonction pour ajouter un compte
// Renvoie le compte créé, ou un message d'erreur (chaîne) si la saisie est invalide
function ajouterCompte(libelle, idProprietaire, suffixeSymbole){
    if (!('listeComptes' in data)) data.listeComptes = []

    libelle = String(libelle).trim()
    const suffixe = nettoyerSuffixeSymbole(suffixeSymbole)
    const lettre = lettreProprietaire(idProprietaire)

    if (libelle === '') return 'Le libellé du compte est obligatoire.'
    if (lettre === '') return 'Le propriétaire du compte est invalide.'
    if (idProprietaire === ID_JOINT && !jointDisponible()) return 'Un compte joint nécessite au moins deux utilisateurs.'
    if (suffixe.length !== LONGUEUR_SUFFIXE_SYMBOLE) return `La partie du symbole après le point doit contenir exactement ${LONGUEUR_SUFFIXE_SYMBOLE} lettres.`

    const symbole = `${lettre}.${suffixe}`
    // Seul le symbole doit être unique (plusieurs comptes peuvent avoir le même libellé)
    if (data.listeComptes.some(c => c.symbole === symbole)) return `Le symbole "${symbole}" est déjà utilisé.`

    // Recherche d'un ID disponible (on ignore les éventuels ID vides)
    const ids = data.listeComptes.map(c => Number(c.id)).filter(id => id > 0)
    const idNew = ids.length > 0 ? Math.max(...ids) + 1 : 1

    const newCompte = { id: idNew, symbole: symbole, libelle: libelle, idProprietaire: idProprietaire }
    data.listeComptes.push(newCompte)
    return newCompte
}

// Pour les anciens fichiers sans propriétaire : on le déduit de la première lettre du symbole
// "J" -> Joint (s'il y a plusieurs utilisateurs), sinon l'utilisateur dont le nom commence par cette lettre
function completerProprietairesComptes(){
    (data.listeComptes || []).forEach(compte => {
        if (compte.id === '' || 'idProprietaire' in compte) return
        const lettre = String(compte.symbole || '')[0]
        if (!lettre) return
        if (lettre === 'J' && jointDisponible()){
            compte.idProprietaire = ID_JOINT
            return
        }
        const candidats = utilisateursValides().filter(u => lettreProprietaire(u.id) === lettre)
        if (candidats.length === 1) compte.idProprietaire = candidats[0].id
    })
}

// Nombre de comptes appartenant à un utilisateur
function nbComptesUtilisateur(idUtilisateur){
    return (data.listeComptes || []).filter(c => c.idProprietaire === Number(idUtilisateur)).length
}

// Compte le nombre de dépenses payées depuis un compte
function nbDepensesCompte(idCompte){
    if (!('entrees' in data)) return 0
    return data.entrees.reduce((total, categorie) =>
        total + (categorie.liste || []).filter(dep => dep.idComptePayeDepuis === Number(idCompte)).length
    , 0)
}

// Fonction qui supprime un compte
function suppressionCompte(idSupp){
    // Recherche de l'index du compte qui possède l'id = idSupp
    const indexSupp = data.listeComptes.findIndex(compte => compte.id === Number(idSupp))
    if (indexSupp === -1) return false

    // Suppression de l'entrée par son numéro d'index
    const supp = data.listeComptes.splice(indexSupp, 1)
    // Si l'élément avec le bon id a été supprimé, TRUE est renvoyé
    return supp.length > 0 && supp[0].id === Number(idSupp)
}
