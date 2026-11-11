// Un compte : { id, libelle, idProprietaire }
// idProprietaire = id d'un utilisateur, ou ID_JOINT pour un compte commun

// Identifiant réservé au propriétaire "Joint" (compte commun à tous les utilisateurs)
const ID_JOINT = 0

// Liste des utilisateurs
function utilisateursValides(){
    return data.user
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

// Vérifie le libellé (déjà nettoyé des espaces) et le propriétaire d'un compte
// idIgnore : compte à ne pas comparer (celui qu'on modifie)
// Renvoie un message d'erreur, ou null si tout est correct
function validerCompte(libelle, idProprietaire, idIgnore = null){
    if (libelle === '') return 'Le libellé du compte est obligatoire.'
    if (!listeProprietaires().some(p => p.id === idProprietaire)) return 'Le propriétaire du compte est invalide.'
    // Un même propriétaire ne peut pas avoir deux comptes du même nom
    // (ils seraient impossibles à distinguer dans les dépenses : "Félix - Courant")
    const doublon = data.listeComptes.some(c =>
        c.id !== idIgnore
        && c.idProprietaire === idProprietaire
        && String(c.libelle).toLowerCase() === libelle.toLowerCase()
    )
    if (doublon) return `${nomProprietaire(idProprietaire)} a déjà un compte "${libelle}".`
    return null
}

// Fonction pour ajouter un compte
// Renvoie le compte créé, ou un message d'erreur (chaîne) si la saisie est invalide
function ajouterCompte(libelle, idProprietaire){
    libelle = String(libelle).trim()
    const erreur = validerCompte(libelle, idProprietaire)
    if (erreur) return erreur

    // Recherche d'un ID disponible
    const ids = data.listeComptes.map(c => c.id)
    const idNew = ids.length > 0 ? Math.max(...ids) + 1 : 1

    const newCompte = { id: idNew, libelle: libelle, idProprietaire: idProprietaire }
    data.listeComptes.push(newCompte)
    return newCompte
}

// Modifie le libellé et/ou le propriétaire d'un compte (son id ne change pas,
// les dépenses qui pointent dessus restent donc liées)
// Renvoie true si la modification est faite, sinon un message d'erreur (chaîne)
function modifierCompte(idCompte, libelle, idProprietaire){
    idCompte = Number(idCompte)
    const compte = data.listeComptes.find(c => c.id === idCompte)
    if (!compte) return 'Compte introuvable.'

    libelle = String(libelle).trim()
    const erreur = validerCompte(libelle, idProprietaire, idCompte)
    if (erreur) return erreur

    compte.libelle = libelle
    compte.idProprietaire = idProprietaire
    return true
}

// Nombre de comptes appartenant à un utilisateur
function nbComptesUtilisateur(idUtilisateur){
    return data.listeComptes.filter(c => c.idProprietaire === Number(idUtilisateur)).length
}

// Compte le nombre de dépenses payées depuis un compte
function nbDepensesCompte(idCompte){
    return toutesLesDepenses().filter(dep => dep.idComptePayeDepuis === Number(idCompte)).length
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
