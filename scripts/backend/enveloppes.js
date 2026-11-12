// Enveloppes : data.enveloppes = [ { id, nom, idCompte, mouvements: [ { id, date, libelle, montant } ] } ]
// - une enveloppe est une somme mise de côté sur un compte (idCompte) pour un usage précis
// - mouvement : date au format "AAAA-MM-JJ", montant positif (provision) ou négatif (dépense)
// - le solde d'une enveloppe est la somme de ses mouvements

// Recherche d'une enveloppe par son id (undefined si absente)
function trouverEnveloppe(idEnveloppe){
    return data.enveloppes.find(e => e.id === Number(idEnveloppe))
}

// Solde d'une enveloppe
function soldeEnveloppe(enveloppe){
    return enveloppe.mouvements.reduce((total, m) => total + m.montant, 0)
}

// Enveloppes d'un compte, par ordre alphabétique
function enveloppesDuCompte(idCompte){
    return data.enveloppes
        .filter(e => e.idCompte === idCompte)
        .sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr', { sensitivity: 'base' }))
}

// Nombre d'enveloppes rattachées à un compte
function nbEnveloppesCompte(idCompte){
    return data.enveloppes.filter(e => e.idCompte === Number(idCompte)).length
}

// Mouvements d'une enveloppe triés par date (puis par ordre de saisie)
function mouvementsTries(enveloppe){
    return [...enveloppe.mouvements].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
}

// ---------- Enveloppes ----------

// Vérifie le nom (déjà nettoyé des espaces) et le compte d'une enveloppe
// idIgnore : enveloppe à ne pas comparer (celle qu'on modifie)
function validerEnveloppe(nom, idCompte, idIgnore = null){
    if (nom === '') return "Le nom de l'enveloppe est obligatoire."
    if (!data.listeComptes.some(c => c.id === idCompte)) return "Choisissez le compte sur lequel se trouve l'enveloppe."
    const existe = data.enveloppes.some(e =>
        e.id !== idIgnore && String(e.nom).toLowerCase() === nom.toLowerCase()
    )
    if (existe) return `Une enveloppe "${nom}" existe déjà.`
    return null
}

// Crée une enveloppe vide. Renvoie l'enveloppe, ou un message d'erreur (chaîne)
function ajouterEnveloppe(nom, idCompte){
    nom = String(nom).trim()
    const erreur = validerEnveloppe(nom, idCompte)
    if (erreur) return erreur

    const ids = data.enveloppes.map(e => e.id)
    const enveloppe = { id: ids.length > 0 ? Math.max(...ids) + 1 : 1, nom: nom, idCompte: idCompte, mouvements: [] }
    data.enveloppes.push(enveloppe)
    return enveloppe
}

// Renomme une enveloppe et/ou change son compte. Renvoie true, ou un message d'erreur
function modifierEnveloppe(idEnveloppe, nom, idCompte){
    const enveloppe = trouverEnveloppe(idEnveloppe)
    if (!enveloppe) return 'Enveloppe introuvable.'
    nom = String(nom).trim()
    const erreur = validerEnveloppe(nom, idCompte, enveloppe.id)
    if (erreur) return erreur
    // Les dépenses associées doivent être payées par le compte de l'enveloppe
    const incompatibles = depensesDeLEnveloppe(enveloppe.id).filter(d => d.idComptePayeDepuis !== idCompte).length
    if (incompatibles > 0){
        return `Impossible de changer de compte : ${incompatibles} dépense(s) associée(s) à cette enveloppe sont payées par un autre compte. Modifiez-les d'abord.`
    }
    enveloppe.nom = nom
    enveloppe.idCompte = idCompte
    return true
}

// Dépenses associées à une enveloppe
function depensesDeLEnveloppe(idEnveloppe){
    return toutesLesDepenses().filter(d => d.idEnveloppe === Number(idEnveloppe))
}

// Supprime une enveloppe et tous ses mouvements ; les dépenses qui lui étaient
// associées ne le sont plus (idEnveloppe = null). Renvoie true si c'est fait
function supprimerEnveloppe(idEnveloppe){
    const index = data.enveloppes.findIndex(e => e.id === Number(idEnveloppe))
    if (index === -1) return false
    depensesDeLEnveloppe(idEnveloppe).forEach(d => d.idEnveloppe = null)
    data.enveloppes.splice(index, 1)
    return true
}

// ---------- Mouvements ----------

// Vérifie les valeurs d'un mouvement { date, libelle, montant }
function validerMouvement(valeurs){
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valeurs.date) || isNaN(Date.parse(valeurs.date))) return 'La date du mouvement est obligatoire.'
    if (valeurs.libelle === '') return 'Le libellé du mouvement est obligatoire.'
    if (!Number.isFinite(valeurs.montant)) return 'Le montant du mouvement est obligatoire (négatif pour une dépense).'
    return null
}

// Ajoute un mouvement dans une enveloppe. Renvoie true, ou un message d'erreur
function ajouterMouvement(idEnveloppe, valeurs){
    const enveloppe = trouverEnveloppe(idEnveloppe)
    if (!enveloppe) return 'Enveloppe introuvable.'
    const erreur = validerMouvement(valeurs)
    if (erreur) return erreur

    const ids = enveloppe.mouvements.map(m => m.id)
    enveloppe.mouvements.push({
        id: ids.length > 0 ? Math.max(...ids) + 1 : 1,
        date: valeurs.date,
        libelle: valeurs.libelle,
        montant: valeurs.montant
    })
    return true
}

// Modifie un mouvement existant. Renvoie true, ou un message d'erreur
function modifierMouvement(idEnveloppe, idMouvement, valeurs){
    const enveloppe = trouverEnveloppe(idEnveloppe)
    if (!enveloppe) return 'Enveloppe introuvable.'
    const mouvement = enveloppe.mouvements.find(m => m.id === Number(idMouvement))
    if (!mouvement) return 'Mouvement introuvable.'
    const erreur = validerMouvement(valeurs)
    if (erreur) return erreur

    mouvement.date = valeurs.date
    mouvement.libelle = valeurs.libelle
    mouvement.montant = valeurs.montant
    return true
}

// Supprime un mouvement. Renvoie true si c'est fait
function supprimerMouvement(idEnveloppe, idMouvement){
    const enveloppe = trouverEnveloppe(idEnveloppe)
    if (!enveloppe) return false
    const index = enveloppe.mouvements.findIndex(m => m.id === Number(idMouvement))
    if (index === -1) return false
    enveloppe.mouvements.splice(index, 1)
    return true
}
