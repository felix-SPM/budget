// Fonction qui supprime une dépense avec idEntree dans la liste d'une catégorie idCategorie
function suppDepData(idEntree, idCategorie){

    // Récupération de l'entrée correspondant à l'id de la catégorie
    const categorie = data.entrees.find(e => e.id===Number(idCategorie))
    if (!categorie) return false
    // Recherche dans la liste des entrées l'index de celle portant le numéro d'id
    const indexEntree = categorie.liste.findIndex(i => i.id === Number(idEntree))
    // Si l'entrée n'existe pas, on s'arrête (splice(-1) supprimerait la dernière entrée)
    if (indexEntree === -1) return false
    // Suppression de l'entrée par son numéro d'index
    const supp = categorie.liste.splice(indexEntree,1)

    // Si l'élement avec le bon id a été supprimé, TRUE est renvoyé
    return supp.length > 0 && supp[0].id === Number(idEntree)
}

// Vérifie les valeurs saisies pour une dépense
// Renvoie un message d'erreur, ou null si tout est correct
function validerDepense(valeurs){
    if (valeurs.libelle === '') return 'Le libellé de la dépense est obligatoire.'
    if (!Number.isFinite(valeurs.montant)) return 'Le montant de la dépense est obligatoire.'
    return null
}

// Ajoute une dépense dans une catégorie
// valeurs = { libelle, montant, idComptePayeDepuis, idCharge }
// Renvoie true si l'ajout est fait, sinon un message d'erreur (chaîne)
function ajoutDepData(idCategorie, valeurs){

    const categorie = data.entrees.find(e => e.id === Number(idCategorie));
    if (!categorie) return 'Catégorie introuvable.';

    const erreur = validerDepense(valeurs)
    if (erreur) return erreur

    const nouvelId =
        categorie.liste.length > 0
            ? Math.max(...categorie.liste.map(e => e.id)) + 1
            : 1;

    categorie.liste.push({
        id: nouvelId,
        libelle: valeurs.libelle,
        montant: valeurs.montant,
        idComptePayeDepuis: valeurs.idComptePayeDepuis,
        idCharge: valeurs.idCharge
    });
    return true
}

// Modifie une dépense existante (l'id de la dépense ne change pas)
// Renvoie true si la modification est faite, sinon un message d'erreur (chaîne)
function modifDepData(idCategorie, idEntree, valeurs){

    const categorie = data.entrees.find(e => e.id === Number(idCategorie));
    if (!categorie) return 'Catégorie introuvable.';

    const depense = categorie.liste.find(d => d.id === Number(idEntree))
    if (!depense) return 'Dépense introuvable.'

    const erreur = validerDepense(valeurs)
    if (erreur) return erreur

    depense.libelle = valeurs.libelle
    depense.montant = valeurs.montant
    depense.idComptePayeDepuis = valeurs.idComptePayeDepuis
    depense.idCharge = valeurs.idCharge
    return true
}
