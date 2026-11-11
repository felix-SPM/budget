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
// Si l'initiale change, le symbole de ses comptes est mis à jour (ex : F.LIV -> P.LIV)
// Renvoie true si la modification est faite, sinon un message d'erreur (chaîne)
function modifierUtilisateur(idUser, nouveauNom){
    idUser = Number(idUser)
    nouveauNom = String(nouveauNom).trim()

    const user = utilisateursValides().find(u => u.id === idUser)
    if (!user) return 'Utilisateur introuvable.'

    const erreur = validerNomUtilisateur(nouveauNom, idUser)
    if (erreur) return erreur

    // Calcul des nouveaux symboles des comptes de l'utilisateur
    const ancienneLettre = lettreProprietaire(idUser)
    const ancienNom = user.nom
    user.nom = nouveauNom
    const nouvelleLettre = lettreProprietaire(idUser)
    user.nom = ancienNom

    const comptesUser = (data.listeComptes || []).filter(c => c.idProprietaire === idUser)
    const nouveauxSymboles = new Map()
    if (nouvelleLettre !== ancienneLettre){
        comptesUser.forEach(c => {
            const suffixe = String(c.symbole).split('.').slice(1).join('.')
            nouveauxSymboles.set(c, `${nouvelleLettre}.${suffixe}`)
        })
        // On refuse si un nouveau symbole est déjà pris par un autre compte
        const autresSymboles = (data.listeComptes || [])
            .filter(c => !comptesUser.includes(c))
            .map(c => c.symbole)
        const conflits = [...nouveauxSymboles.values()].filter(s => autresSymboles.includes(s))
        if (conflits.length > 0){
            return `Impossible de renommer : le(s) symbole(s) ${conflits.join(', ')} existe(nt) déjà pour un autre compte.`
        }
    }

    // Application des modifications
    user.nom = nouveauNom
    nouveauxSymboles.forEach((symbole, compte) => compte.symbole = symbole)
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
