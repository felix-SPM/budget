const zoneEnveloppes = document.querySelector('.zoneEnveloppes')
const selectCompteEnveloppe = document.getElementById('selectCompteEnveloppe')
const inputNewEnveloppe = document.getElementById('inputNewEnveloppe')

// État de l'affichage (conservé quand la section est redessinée)
const enveloppesOuvertes = new Set()     // ids des enveloppes dépliées
let enveloppeEnModification = null       // id de l'enveloppe en cours de renommage
let mouvementEnModification = null       // { idEnveloppe, idMouvement } en cours de modification

// Affichage initial (avant tout fichier chargé)
document.addEventListener('DOMContentLoaded', majEnveloppes)

// Date du jour au format "AAAA-MM-JJ"
function dateDuJour(){
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// "2026-04-01" -> "01/04/2026"
function formatDate(date){
    const [a, m, j] = date.split('-')
    return `${j}/${m}/${a}`
}

// Options du menu des comptes (intitulé "propriétaire - compte")
function optionsComptes(idSelectionne = null){
    return data.listeComptes
        .map(c => `<option value="${c.id}"${c.id === idSelectionne ? ' selected' : ''}>${echapperHTML(intituleCompte(c))}</option>`)
        .join('')
}

// ---------- Création d'une enveloppe ----------

function ajoutEnveloppeDepuisSaisie(){
    const resultat = ajouterEnveloppe(inputNewEnveloppe.value, Number(selectCompteEnveloppe.value))
    if (typeof resultat === 'string'){
        alert(resultat)
        return
    }
    inputNewEnveloppe.value = ''
    enveloppesOuvertes.add(resultat.id)
    majEnveloppes()
    // La nouvelle enveloppe devient disponible dans les dépenses
    rafraichirCategoriesOuvertes()
}

document.querySelector('.ajoutEnveloppe').addEventListener('click', (event)=>{
    if (event.target.closest('.btnAddEnveloppe')) ajoutEnveloppeDepuisSaisie()
})
inputNewEnveloppe.addEventListener('keydown', (event)=>{
    if (event.key === 'Enter') ajoutEnveloppeDepuisSaisie()
})

// ---------- Clics dans la liste des enveloppes ----------

zoneEnveloppes.addEventListener('click', (event)=>{
    const button = event.target.closest('button')
    if (!button) return
    const bloc = button.closest('.enveloppe')
    const idEnveloppe = Number(bloc.dataset.idenveloppe)
    const ligne = button.closest('tr')
    const action = button.dataset.action

    if (action === 'deplier'){
        if (enveloppesOuvertes.has(idEnveloppe)) enveloppesOuvertes.delete(idEnveloppe)
        else enveloppesOuvertes.add(idEnveloppe)
        majEnveloppes()
    }
    if (action === 'modifierEnveloppe'){
        enveloppeEnModification = idEnveloppe
        majEnveloppes()
    }
    if (action === 'validerEnveloppe') validerModificationEnveloppe(bloc)
    if (action === 'annulerEnveloppe'){
        enveloppeEnModification = null
        majEnveloppes()
    }
    if (action === 'supprimerEnveloppe') supprimerEnveloppeAvecConfirmation(idEnveloppe)

    if (action === 'ajouterMouvement') ajouterMouvementDepuisLigne(idEnveloppe, ligne)
    if (action === 'modifierMouvement'){
        mouvementEnModification = { idEnveloppe, idMouvement: Number(ligne.dataset.idmouvement) }
        majEnveloppes()
    }
    if (action === 'validerMouvement') validerModificationMouvement(idEnveloppe, ligne)
    if (action === 'annulerMouvement'){
        mouvementEnModification = null
        majEnveloppes()
    }
    if (action === 'supprimerMouvement'){
        if (supprimerMouvement(idEnveloppe, ligne.dataset.idmouvement)) majEnveloppes()
    }
})

// Clavier : Entrée pour ajouter/valider, Échap pour annuler
zoneEnveloppes.addEventListener('keydown', (event)=>{
    if (!event.target.matches('input, select')) return
    const bloc = event.target.closest('.enveloppe')
    const idEnveloppe = Number(bloc.dataset.idenveloppe)
    const ligne = event.target.closest('tr')

    if (event.target.closest('.titreEnveloppe')){
        if (event.key === 'Enter') validerModificationEnveloppe(bloc)
        if (event.key === 'Escape'){ enveloppeEnModification = null; majEnveloppes() }
        return
    }
    if (!ligne) return
    if (ligne.classList.contains('saisieMouvement')){
        if (event.key === 'Enter') ajouterMouvementDepuisLigne(idEnveloppe, ligne)
    }
    if (ligne.classList.contains('edition')){
        if (event.key === 'Enter') validerModificationMouvement(idEnveloppe, ligne)
        if (event.key === 'Escape'){ mouvementEnModification = null; majEnveloppes() }
    }
})

// ---------- Actions ----------

function validerModificationEnveloppe(bloc){
    const resultat = modifierEnveloppe(
        bloc.dataset.idenveloppe,
        bloc.querySelector('.inputModifEnveloppe').value,
        Number(bloc.querySelector('.selectModifCompteEnveloppe').value)
    )
    if (resultat !== true){
        alert(resultat)
        return
    }
    enveloppeEnModification = null
    majEnveloppes()
    // Le nom de l'enveloppe apparaît dans les dépenses
    rafraichirCategoriesOuvertes()
}

function supprimerEnveloppeAvecConfirmation(idEnveloppe){
    const enveloppe = trouverEnveloppe(idEnveloppe)
    const nb = enveloppe.mouvements.length
    const nbDep = depensesDeLEnveloppe(idEnveloppe).length
    let message = nb > 0
        ? `L'enveloppe "${enveloppe.nom}" contient ${nb} mouvement(s) (solde ${formatMontant(soldeEnveloppe(enveloppe))}), qui seront supprimés aussi.`
        : `Supprimer l'enveloppe "${enveloppe.nom}" ?`
    if (nbDep > 0) message += `\n${nbDep} dépense(s) ne seront plus associées à une enveloppe.`
    if (nb > 0 || nbDep > 0) message += '\nSupprimer quand même ?'
    if (!confirm(message)) return
    if (supprimerEnveloppe(idEnveloppe)){
        enveloppesOuvertes.delete(idEnveloppe)
        majEnveloppes()
        rafraichirCategoriesOuvertes()
    }
}

// Lit les valeurs saisies dans une ligne de mouvement (ajout ou modification)
function lireSaisieMouvement(ligne){
    const montant = ligne.querySelector('.inputMontantMouvement').value
    return {
        date: ligne.querySelector('.inputDateMouvement').value,
        libelle: ligne.querySelector('.inputLibelleMouvement').value.trim(),
        montant: montant === '' ? NaN : Number(montant)
    }
}

function ajouterMouvementDepuisLigne(idEnveloppe, ligne){
    const resultat = ajouterMouvement(idEnveloppe, lireSaisieMouvement(ligne))
    if (resultat !== true){
        alert(resultat)
        return
    }
    majEnveloppes()
    // On replace le curseur dans le libellé pour enchaîner les saisies
    const champ = zoneEnveloppes.querySelector(`.enveloppe[data-idenveloppe="${idEnveloppe}"] .saisieMouvement .inputLibelleMouvement`)
    if (champ) champ.focus()
}

function validerModificationMouvement(idEnveloppe, ligne){
    const resultat = modifierMouvement(idEnveloppe, ligne.dataset.idmouvement, lireSaisieMouvement(ligne))
    if (resultat !== true){
        alert(resultat)
        return
    }
    mouvementEnModification = null
    majEnveloppes()
}

// ---------- Affichage ----------

// Cellules de saisie d'un mouvement (pré-remplies pour une modification)
function cellulesSaisieMouvement(mouvement = {}){
    return `
        <td><input class="inputDateMouvement" type="date" value="${echapperHTML(mouvement.date || dateDuJour())}" aria-label="Date"></td>
        <td><input class="inputLibelleMouvement" type="text" value="${echapperHTML(mouvement.libelle || '')}" placeholder="Libellé" aria-label="Libellé"></td>
        <td><input class="inputMontantMouvement" type="number" step="0.01" value="${mouvement.montant !== undefined ? echapperHTML(mouvement.montant) : ''}" placeholder="± montant" title="Positif pour une provision, négatif pour une dépense" aria-label="Montant"></td>
    `
}

// Bouton icône
const bouton = (action, icone, libelle) =>
    `<button class="btnSupp" data-action="${action}" aria-label="${libelle}" title="${libelle}"><i data-lucide="${icone}"></i></button>`

// Titre d'une enveloppe (normal ou en modification)
function titreEnveloppe(enveloppe){
    if (enveloppeEnModification === enveloppe.id){
        return `
            <input class="inputModifEnveloppe" type="text" value="${echapperHTML(enveloppe.nom)}" aria-label="Nom de l'enveloppe">
            <select class="selectModifCompteEnveloppe" aria-label="Compte de l'enveloppe">${optionsComptes(enveloppe.idCompte)}</select>
            ${bouton('validerEnveloppe', 'circle-check', 'Valider')}
            ${bouton('annulerEnveloppe', 'undo-2', 'Annuler')}
        `
    }
    const ouverte = enveloppesOuvertes.has(enveloppe.id)
    const solde = soldeEnveloppe(enveloppe)
    return `
        <span class="nomEnveloppe">${echapperHTML(enveloppe.nom)}</span>
        <span class="soldeEnveloppe${solde < -0.005 ? ' negatif' : ''}">${formatMontant(solde)}</span>
        ${bouton('deplier', ouverte ? 'square-minus' : 'square-plus', ouverte ? 'Replier' : 'Déplier')}
        ${bouton('modifierEnveloppe', 'pencil', "Renommer / changer de compte")}
        ${bouton('supprimerEnveloppe', 'circle-x', "Supprimer l'enveloppe")}
    `
}

// Tableau des mouvements d'une enveloppe dépliée
function tableauMouvements(enveloppe){
    const lignes = mouvementsTries(enveloppe).map(m => {
        const enEdition = mouvementEnModification
            && mouvementEnModification.idEnveloppe === enveloppe.id
            && mouvementEnModification.idMouvement === m.id
        if (enEdition){
            return `
                <tr class="edition" data-idmouvement="${m.id}">
                    ${cellulesSaisieMouvement(m)}
                    <td>${bouton('validerMouvement', 'circle-check', 'Valider')}${bouton('annulerMouvement', 'undo-2', 'Annuler')}</td>
                </tr>`
        }
        return `
            <tr data-idmouvement="${m.id}">
                <td>${formatDate(m.date)}</td>
                <td>${echapperHTML(m.libelle)}</td>
                <td class="montant${m.montant < 0 ? ' negatif' : ''}">${formatMontant(m.montant)}</td>
                <td>${bouton('modifierMouvement', 'pencil', 'Modifier')}${bouton('supprimerMouvement', 'circle-x', 'Supprimer')}</td>
            </tr>`
    }).join('')

    return `
        <table class="tableMouvements">
            <thead><tr><th>Date</th><th>Libellé</th><th>Montant</th><th>Actions</th></tr></thead>
            <tbody>
                ${lignes}
                <tr class="saisieMouvement">
                    ${cellulesSaisieMouvement()}
                    <td>${bouton('ajouterMouvement', 'circle-plus', 'Ajouter le mouvement')}</td>
                </tr>
            </tbody>
        </table>`
}

// Redessine toute la section : enveloppes regroupées par compte
function majEnveloppes(){
    // Formulaire de création : choix du compte
    const choixPrecedent = selectCompteEnveloppe.value
    selectCompteEnveloppe.innerHTML = optionsComptes()
    if ([...selectCompteEnveloppe.options].some(o => o.value === choixPrecedent)) selectCompteEnveloppe.value = choixPrecedent
    const actif = data.listeComptes.length > 0
    document.querySelectorAll('.ajoutEnveloppe input, .ajoutEnveloppe select, .ajoutEnveloppe button')
        .forEach(el => el.disabled = !actif)
    inputNewEnveloppe.placeholder = actif ? 'Nouvelle enveloppe' : "Créez d'abord un compte"

    if (data.enveloppes.length === 0){
        zoneEnveloppes.innerHTML = '<p class="messageVide">Aucune enveloppe pour le moment.</p>'
        return
    }

    // Un groupe par compte ayant des enveloppes (dans l'ordre de la liste des comptes)
    zoneEnveloppes.innerHTML = data.listeComptes
        .filter(c => nbEnveloppesCompte(c.id) > 0)
        .map(compte => {
            const enveloppes = enveloppesDuCompte(compte.id)
            const total = enveloppes.reduce((t, e) => t + soldeEnveloppe(e), 0)
            return `
                <h3 class="titreCompteEnveloppes">
                    Dans ${echapperHTML(intituleCompte(compte))}
                    <span class="soldeEnveloppe">${formatMontant(total)}</span>
                </h3>
                ${enveloppes.map(e => `
                    <div class="enveloppe" data-idenveloppe="${e.id}">
                        <h4 class="titreEnveloppe">${titreEnveloppe(e)}</h4>
                        ${enveloppesOuvertes.has(e.id) ? tableauMouvements(e) : ''}
                    </div>`).join('')}
            `
        }).join('')

    lucide.createIcons()

    // Curseur dans le champ en cours de modification
    const champ = zoneEnveloppes.querySelector('.inputModifEnveloppe, tr.edition .inputLibelleMouvement')
    if (champ){
        champ.focus()
        if (champ.select) champ.select()
    }
}
