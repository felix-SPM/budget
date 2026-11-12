// Un compte : { id, libelle, idProprietaire, principal }
// - idProprietaire = id d'un utilisateur, ou ID_JOINT pour un compte commun
// - principal = true pour LE compte courant du propriétaire (un seul par propriétaire) :
//   le compte principal Joint reçoit tous les revenus, celui d'un utilisateur reçoit
//   le virement depuis le compte joint et alimente ses autres comptes (voir repartition.js)

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

    // Le premier compte d'un propriétaire devient son compte principal
    const newCompte = { id: idNew, libelle: libelle, idProprietaire: idProprietaire, principal: false }
    data.listeComptes.push(newCompte)
    assurerComptesPrincipaux()
    return newCompte
}

// Compte principal d'un propriétaire (undefined s'il n'a aucun compte)
function comptePrincipal(idProprietaire){
    return data.listeComptes.find(c => c.idProprietaire === idProprietaire && c.principal)
}

// Désigne un compte comme compte principal de son propriétaire
function definirComptePrincipal(idCompte){
    const compte = data.listeComptes.find(c => c.id === Number(idCompte))
    if (!compte) return false
    data.listeComptes
        .filter(c => c.idProprietaire === compte.idProprietaire)
        .forEach(c => c.principal = (c === compte))
    return true
}

// Garantit que chaque propriétaire ayant au moins un compte en a exactement un principal :
// on garde le premier marqué principal, sinon on désigne son premier compte
function assurerComptesPrincipaux(){
    const proprietaires = new Set(data.listeComptes.map(c => c.idProprietaire))
    proprietaires.forEach(idProprietaire => {
        const comptes = data.listeComptes.filter(c => c.idProprietaire === idProprietaire)
        const principal = comptes.find(c => c.principal) || comptes[0]
        comptes.forEach(c => c.principal = (c === principal))
    })
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

    // Changement de propriétaire : le compte ne peut pas rester principal chez le nouveau
    // propriétaire s'il en a déjà un (assurerComptesPrincipaux tranche)
    if (compte.idProprietaire !== idProprietaire) compte.principal = false

    compte.libelle = libelle
    compte.idProprietaire = idProprietaire
    assurerComptesPrincipaux()
    return true
}

// Comptes triés par ordre alphabétique : d'abord sur le nom du propriétaire
// ("Joint" compris), puis sur le libellé du compte (sans tenir compte des majuscules ni des accents)
function comptesTries(){
    const comparer = (a, b) => String(a).localeCompare(String(b), 'fr', { sensitivity: 'base' })
    return [...data.listeComptes].sort((a, b) =>
        comparer(nomProprietaire(a.idProprietaire), nomProprietaire(b.idProprietaire))
        || comparer(a.libelle, b.libelle)
    )
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
    data.listeComptes.splice(indexSupp, 1)
    // Les virements cochés vers ou depuis ce compte n'ont plus lieu d'être
    data.virementsFaits = data.virementsFaits.filter(v => v.idDe !== Number(idSupp) && v.idVers !== Number(idSupp))
    // Si c'était le compte principal, un autre compte du propriétaire le devient
    assurerComptesPrincipaux()
    return true
}
