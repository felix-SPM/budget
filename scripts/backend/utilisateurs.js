// Vérifie un nom d'utilisateur (déjà nettoyé des espaces)
// idIgnore : utilisateur à ne pas comparer (celui qu'on renomme)
// Renvoie un message d'erreur, ou null si le nom est correct
function validerNomUtilisateur(nom, idIgnore = null){
    if (nom === '') return "Le nom de l'utilisateur est obligatoire."
    if (nom.toLowerCase() === 'joint') return 'Le nom "Joint" est réservé aux comptes et dépenses communs.'
    const existe = utilisateursValides().some(u =>
        u.id !== idIgnore && String(u.nom).toLowerCase() === nom.toLowerCase()
    )
    if (existe) return `Un utilisateur "${nom}" existe déjà.`
    return null
}

// fonction pour ajouter un utilisateur
// Renvoie true si l'ajout est fait, sinon un message d'erreur (chaîne)
function ajouterUtilisateur(nom){
    nom = String(nom).trim()
    const erreur = validerNomUtilisateur(nom)
    if (erreur) return erreur

    // si la propriété user n'existe pas, on la crée
    if (!('user' in data)) data.user = []

    // Recherche d'un ID disponible (on ignore les éventuels ID vides)
    const ids = data.user.map(u => Number(u.id)).filter(id => id > 0)
    const idNew = ids.length > 0 ? Math.max(...ids) + 1 : 1

    // Ajout d'un membre dans data user
    data.user.push({ id: idNew, nom: nom })
    return true
}

// fonction pour renommer un utilisateur
// (comptes et dépenses pointent sur son id : rien d'autre à mettre à jour)
// Renvoie true si la modification est faite, sinon un message d'erreur (chaîne)
function modifierUtilisateur(idUser, nouveauNom){
    idUser = Number(idUser)
    nouveauNom = String(nouveauNom).trim()

    const user = utilisateursValides().find(u => u.id === idUser)
    if (!user) return 'Utilisateur introuvable.'

    const erreur = validerNomUtilisateur(nouveauNom, idUser)
    if (erreur) return erreur

    user.nom = nouveauNom
    return true
}

// fonction qui supprime un utilisateur
function suppressionUtilisateur(idSupp){

    // Cherche d'index dans le tableau de user de l'élement qui possède l'id = idSupp
    const indexSupp = data.user.findIndex(user => user.id === Number(idSupp));

    if (!(indexSupp===-1)){
        // Suppression de l'entrée par son numéro d'index
        const supp = data.user.splice(indexSupp,1)
        // Si l'élement avec le bon id a été supprimé, TRUE est renvoyé
        return supp.length > 0 && supp[0].id === Number(idSupp)
    }
    else{
        return false
    }
}
