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

// La charge d'une dépense (idCharge) est l'id d'un utilisateur, ou ID_JOINT (0) pour "Joint"

// Nombre de dépenses à la charge d'un utilisateur
function nbDepensesCharge(idUtilisateur){
    return (data.entrees || []).reduce((total, categorie) =>
        total + (categorie.liste || []).filter(dep => dep.idCharge === Number(idUtilisateur)).length
    , 0)
}

// Anciens fichiers : les charges étaient dans une liste séparée "listeCharge"
// (ex : 1 = Joint, 2 = Sophie, 3 = Félix). On convertit chaque dépense pour que
// idCharge désigne directement l'utilisateur (ou Joint), puis on supprime listeCharge.
// Renvoie la liste des libellés de charge qui n'ont pu être associés à personne.
function migrerChargesVersUtilisateurs(){
    if (!Array.isArray(data.listeCharge)) return []

    // Comparaison des noms sans majuscules ni accents
    const simplifier = texte => String(texte).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
    const proprietaires = listeProprietaires()
    const nonTrouves = new Set()

    // Correspondance : ancien id de charge -> nouvel id (utilisateur ou Joint)
    const correspondance = new Map()
    data.listeCharge.forEach(charge => {
        if (charge.id === '') return
        const trouve = proprietaires.find(p => simplifier(p.nom) === simplifier(charge.libelle))
        if (trouve) correspondance.set(charge.id, trouve.id)
    })

    ;(data.entrees || []).forEach(categorie => {
        (categorie.liste || []).forEach(dep => {
            if (correspondance.has(dep.idCharge)){
                dep.idCharge = correspondance.get(dep.idCharge)
            }
            else{
                const ancienne = data.listeCharge.find(c => c.id === dep.idCharge)
                nonTrouves.add(ancienne ? ancienne.libelle : `n°${dep.idCharge}`)
                dep.idCharge = null
            }
        })
    })

    delete data.listeCharge
    return [...nonTrouves]
}

// Vérifie les valeurs saisies pour une dépense
// Renvoie un message d'erreur, ou null si tout est correct
function validerDepense(valeurs){
    if (valeurs.libelle === '') return 'Le libellé de la dépense est obligatoire.'
    if (!Number.isFinite(valeurs.montant)) return 'Le montant de la dépense est obligatoire.'
    if (!listeProprietaires().some(p => p.id === valeurs.idCharge)) return 'Choisissez à qui la dépense est à charge.'
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
