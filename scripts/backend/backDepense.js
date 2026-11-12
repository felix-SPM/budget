// Dépense : { id, libelle, montant, idComptePayeDepuis, idCharge, idEnveloppe }
// - stockée dans la liste "depenses" de sa catégorie (id unique dans la catégorie)
// - idComptePayeDepuis : id du compte qui paie
// - idCharge : id de l'utilisateur à qui la dépense est à charge, ou ID_JOINT (0) pour "Joint"
// - idEnveloppe : enveloppe à créditer de ce montant une fois le budget validé, ou null ;
//   l'enveloppe doit se trouver sur le compte qui paie la dépense

// Fonction qui supprime une dépense avec idEntree dans la catégorie idCategorie
function suppDepData(idEntree, idCategorie){
    const categorie = trouverCategorie(idCategorie)
    if (!categorie) return false
    // Recherche de l'index de la dépense portant le numéro d'id
    const index = categorie.depenses.findIndex(d => d.id === Number(idEntree))
    // Si la dépense n'existe pas, on s'arrête (splice(-1) supprimerait la dernière)
    if (index === -1) return false
    categorie.depenses.splice(index, 1)
    return true
}

// Nombre de dépenses à la charge d'un utilisateur
function nbDepensesCharge(idUtilisateur){
    return toutesLesDepenses().filter(dep => dep.idCharge === Number(idUtilisateur)).length
}

// Vérifie les valeurs saisies pour une dépense
// Renvoie un message d'erreur, ou null si tout est correct
function validerDepense(valeurs){
    if (valeurs.libelle === '') return 'Le libellé de la dépense est obligatoire.'
    if (!Number.isFinite(valeurs.montant)) return 'Le montant de la dépense est obligatoire.'
    if (!listeProprietaires().some(p => p.id === valeurs.idCharge)) return 'Choisissez à qui la dépense est à charge.'
    if (!data.listeComptes.some(c => c.id === valeurs.idComptePayeDepuis)) return 'Choisissez le compte qui paie la dépense.'
    if (valeurs.idEnveloppe !== null){
        const enveloppe = trouverEnveloppe(valeurs.idEnveloppe)
        if (!enveloppe) return "Choisissez l'enveloppe associée à la dépense."
        if (enveloppe.idCompte !== valeurs.idComptePayeDepuis) return `L'enveloppe "${enveloppe.nom}" n'est pas sur le compte qui paie la dépense.`
    }
    return null
}

// Ajoute une dépense dans une catégorie
// valeurs = { libelle, montant, idComptePayeDepuis, idCharge, idEnveloppe }
// Renvoie true si l'ajout est fait, sinon un message d'erreur (chaîne)
function ajoutDepData(idCategorie, valeurs){
    const categorie = trouverCategorie(idCategorie)
    if (!categorie) return 'Catégorie introuvable.'

    const erreur = validerDepense(valeurs)
    if (erreur) return erreur

    const ids = categorie.depenses.map(d => d.id)
    const nouvelId = ids.length > 0 ? Math.max(...ids) + 1 : 1

    categorie.depenses.push({
        id: nouvelId,
        libelle: valeurs.libelle,
        montant: valeurs.montant,
        idComptePayeDepuis: valeurs.idComptePayeDepuis,
        idCharge: valeurs.idCharge,
        idEnveloppe: valeurs.idEnveloppe
    })
    return true
}

// Modifie une dépense existante (l'id de la dépense ne change pas)
// Renvoie true si la modification est faite, sinon un message d'erreur (chaîne)
function modifDepData(idCategorie, idEntree, valeurs){
    const categorie = trouverCategorie(idCategorie)
    if (!categorie) return 'Catégorie introuvable.'

    const depense = categorie.depenses.find(d => d.id === Number(idEntree))
    if (!depense) return 'Dépense introuvable.'

    const erreur = validerDepense(valeurs)
    if (erreur) return erreur

    depense.libelle = valeurs.libelle
    depense.montant = valeurs.montant
    depense.idComptePayeDepuis = valeurs.idComptePayeDepuis
    depense.idCharge = valeurs.idCharge
    depense.idEnveloppe = valeurs.idEnveloppe
    return true
}
