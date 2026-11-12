// Revenus : data.revenus = [ { idProprietaire, montant } ]
// idProprietaire = id d'un utilisateur, ou ID_JOINT pour les revenus communs.
// Un propriétaire sans entrée n'a pas encore de revenu saisi.

// Montant du revenu d'un propriétaire (null si non saisi)
function montantRevenu(idProprietaire){
    const revenu = data.revenus.find(r => r.idProprietaire === idProprietaire)
    return revenu ? revenu.montant : null
}

// Enregistre le revenu d'un propriétaire (création ou mise à jour)
// Renvoie true si c'est fait, sinon un message d'erreur (chaîne)
function modifierRevenu(idProprietaire, montant){
    if (!listeProprietaires().some(p => p.id === idProprietaire)) return 'Propriétaire du revenu invalide.'
    if (!Number.isFinite(montant)) return 'Le montant du revenu est obligatoire.'
    if (montant < 0) return 'Le montant du revenu ne peut pas être négatif.'

    const revenu = data.revenus.find(r => r.idProprietaire === idProprietaire)
    if (revenu) revenu.montant = montant
    else data.revenus.push({ idProprietaire: idProprietaire, montant: montant })
    return true
}

// Supprime le revenu d'un propriétaire (utilisé à la suppression d'un utilisateur)
function supprimerRevenu(idProprietaire){
    data.revenus = data.revenus.filter(r => r.idProprietaire !== idProprietaire)
}

// Prorata des revenus individuels (hors revenus communs), en pourcentage NON arrondi
// (l'arrondi ne se fait qu'à l'affichage, pour ne pas fausser les calculs)
// Renvoie [ { id, nom, part } ], ou null s'il y a moins de deux utilisateurs
// ou si un utilisateur n'a pas de revenu saisi
function calculProrata(){
    const users = utilisateursValides()
    if (users.length < 2) return null

    const montants = users.map(u => montantRevenu(u.id))
    if (montants.some(m => m === null)) return null

    const total = montants.reduce((somme, m) => somme + m, 0)
    if (total <= 0) return null

    return users.map((u, i) => ({
        id: u.id,
        nom: u.nom,
        part: montants[i] / total * 100
    }))
}
