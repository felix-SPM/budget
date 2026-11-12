// Clôture du budget : data.cloture = null (budget modifiable)
//                    ou { date, libelle, mouvements: [ { idEnveloppe, idMouvement } ] } (budget verrouillé)
// À la clôture, chaque enveloppe reçoit un mouvement "provision" égal à la somme des dépenses
// qui lui sont associées. Les mouvements créés sont mémorisés pour pouvoir les retirer
// si le budget est déverrouillé (et éviter de les compter deux fois à la clôture suivante).

// Le budget est-il verrouillé ?
function budgetVerrouille(){
    return data.cloture !== null
}

// Provisions à passer : [ { idEnveloppe, montant } ], une par enveloppe ayant des dépenses associées
function provisionsAPasser(){
    const totaux = new Map()
    toutesLesDepenses()
        .filter(d => d.idEnveloppe !== null)
        .forEach(d => totaux.set(d.idEnveloppe, (totaux.get(d.idEnveloppe) || 0) + d.montant))
    return [...totaux]
        .map(([idEnveloppe, montant]) => ({ idEnveloppe, montant: Math.round(montant * 100) / 100 }))
        .filter(p => Math.abs(p.montant) >= 0.005)
}

// Clôture le budget : ajoute les provisions dans les enveloppes et verrouille
// Renvoie true si c'est fait, sinon un message d'erreur (chaîne)
function cloturerBudget(date, libelle){
    if (budgetVerrouille()) return 'Le budget est déjà clôturé.'
    libelle = String(libelle).trim()
    // Vérification de la date et du libellé avant toute modification
    const erreur = validerMouvement({ date, libelle, montant: 0 })
    if (erreur) return erreur

    const mouvements = []
    for (const p of provisionsAPasser()){
        const resultat = ajouterMouvement(p.idEnveloppe, { date, libelle, montant: p.montant })
        if (resultat !== true){
            // En cas de problème, on annule les provisions déjà passées
            mouvements.forEach(m => supprimerMouvement(m.idEnveloppe, m.idMouvement))
            return resultat
        }
        const enveloppe = trouverEnveloppe(p.idEnveloppe)
        mouvements.push({ idEnveloppe: p.idEnveloppe, idMouvement: Math.max(...enveloppe.mouvements.map(m => m.id)) })
    }

    data.cloture = { date, libelle, mouvements }
    return true
}

// Déverrouille le budget : retire les provisions ajoutées à la clôture
function deverrouillerBudget(){
    if (!budgetVerrouille()) return
    data.cloture.mouvements.forEach(m => supprimerMouvement(m.idEnveloppe, m.idMouvement))
    data.cloture = null
}

// Données du mois suivant (copie, les données actuelles ne changent pas) :
// - les enveloppes gardent les provisions de la clôture
// - les dépenses ponctuelles sont supprimées
// - le budget est de nouveau modifiable et aucun virement n'est coché
function donneesMoisSuivant(){
    const suivant = JSON.parse(JSON.stringify(data))
    suivant.categories.forEach(c => c.depenses = c.depenses.filter(d => !d.ponctuelle))
    suivant.cloture = null
    suivant.virementsFaits = []
    return suivant
}
