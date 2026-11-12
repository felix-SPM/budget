// Section "Clôture" en bas de la page, et verrouillage de l'interface quand le budget est clôturé

const zoneCloture = document.querySelector('.zoneCloture')

// Éléments qui modifient le budget : masqués (CSS) et bloqués quand le budget est verrouillé.
// Restent utilisables : déplier/replier, charger/enregistrer un fichier, cocher les virements faits.
const SELECTEUR_EDITION = [
    '.btnAddUser', '.modifUser', '.suppUser', '.validModifUser', '.annulModifUser',
    '.btnAddCompte', '.modifCompte', '.suppCompte', '.validModifCompte', '.annulModifCompte', '.principalCompte',
    '.modifRevenu', '.validModifRevenu', '.annulModifRevenu',
    '.btnAddCategorie', '.modifCat', '.suppCat', '.validModifCat', '.annulModifCat',
    '.addDep', '.modifDep', '.suppDep', '.validModifDep', '.annulModifDep', '.basculePonctuelle',
    '.btnAddEnveloppe', '[data-action="modifierEnveloppe"]', '[data-action="supprimerEnveloppe"]',
    '[data-action="validerEnveloppe"]', '[data-action="annulerEnveloppe"]',
    '[data-action="ajouterMouvement"]', '[data-action="modifierMouvement"]', '[data-action="supprimerMouvement"]',
    '[data-action="validerMouvement"]', '[data-action="annulerMouvement"]',
    '.ajoutUtilisateurs', '.ajoutCompte', '.ajoutCategorie', '.ajoutEnveloppe',
    'tr.input', 'tr.saisieMouvement', 'tr.edition'
].join(', ')

// Sécurité : quand le budget est verrouillé, tout clic ou toute frappe sur un élément
// d'édition est ignoré (en plus de leur masquage par le CSS)
;['click', 'keydown', 'change'].forEach(type => {
    document.addEventListener(type, (event) => {
        if (!budgetVerrouille() || !(event.target instanceof Element)) return
        if (event.target.closest(SELECTEUR_EDITION)){
            event.preventDefault()
            event.stopPropagation()
        }
    }, true)
})

// Affichage initial (avant tout fichier chargé)
document.addEventListener('DOMContentLoaded', majCloture)

// Libellé proposé : "Provision <mois suivant>" (le budget se prépare pour le mois à venir)
function libelleProvisionParDefaut(){
    const d = new Date()
    const moisSuivant = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    return 'Provision ' + moisSuivant.toLocaleDateString('fr-FR', { month: 'long' })
}

// Nom de fichier "AAAAMMJJ - SoFixBudget<suffixe>.json" pour une date donnée
function nomFichierSauvegarde(date, suffixe = ''){
    const a = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const j = String(date.getDate()).padStart(2, '0')
    return `${a}${m}${j} - SoFixBudget${suffixe}.json`
}

// Clics dans la section Clôture
zoneCloture.addEventListener('click', (event)=>{
    const button = event.target.closest('button')
    if (!button) return

    if (button.dataset.action === 'cloturer') cloturerDepuisFormulaire()

    if (button.dataset.action === 'deverrouiller'){
        if (!confirm('Déverrouiller le budget ?\nLes provisions ajoutées aux enveloppes lors de la clôture seront retirées.')) return
        deverrouillerBudget()
        rafraichirToutApresCloture()
    }

    if (button.dataset.action === 'moisSuivant'){
        const d = new Date()
        const premierDuMoisSuivant = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        telechargerJSON(donneesMoisSuivant(), nomFichierSauvegarde(premierDuMoisSuivant))
    }
})

function cloturerDepuisFormulaire(){
    const date = zoneCloture.querySelector('.dateCloture').value
    const libelle = zoneCloture.querySelector('.libelleCloture').value
    const provisions = provisionsAPasser()
    const total = provisions.reduce((t, p) => t + p.montant, 0)
    const message = `Clôturer le budget ?\n\n`
        + `${provisions.length} provision(s) "${libelle.trim()}" seront ajoutées aux enveloppes (total ${formatMontant(total)}).\n`
        + `Le budget sera ensuite verrouillé et une sauvegarde complète sera téléchargée.`
    if (!confirm(message)) return

    const resultat = cloturerBudget(date, libelle)
    if (resultat !== true){
        alert(resultat)
        return
    }
    rafraichirToutApresCloture()
    // Sauvegarde complète du budget clôturé (il se rouvrira verrouillé)
    telechargerJSON(data, nomFichierSauvegarde(new Date(), ' - clôturé'))
}

// Redessine toutes les sections (enveloppes modifiées, édition masquée ou réaffichée)
function rafraichirToutApresCloture(){
    // Abandon des modifications d'enveloppe en cours (les autres sections sont recréées par initFront)
    enveloppeEnModification = null
    mouvementEnModification = null
    initFront()
    majEnveloppes()
}

// Contenu de la section Clôture selon l'état du budget, et classe "verrouille" sur la page
function majCloture(){
    const verrouille = budgetVerrouille()
    document.body.classList.toggle('verrouille', verrouille)

    if (verrouille){
        const c = data.cloture
        const total = c.mouvements.reduce((t, m) => {
            const env = trouverEnveloppe(m.idEnveloppe)
            const mvt = env && env.mouvements.find(x => x.id === m.idMouvement)
            return t + (mvt ? mvt.montant : 0)
        }, 0)
        zoneCloture.innerHTML = `
            <p class="etatCloture"><i data-lucide="lock"></i>
                Budget clôturé le ${formatDate(c.date)} : ${c.mouvements.length} provision(s) « ${echapperHTML(c.libelle)} »
                ajoutée(s) aux enveloppes (total ${formatMontant(total)}). Les modifications sont verrouillées.
            </p>
            <div class="boutonsCloture">
                <button class="btn-file" data-action="deverrouiller">Déverrouiller le budget <i data-lucide="lock-open"></i></button>
                <button class="btn-file" data-action="moisSuivant">Générer le fichier pour le mois prochain <i data-lucide="calendar-plus"></i></button>
            </div>`
    }
    else {
        const provisions = provisionsAPasser()
        const total = provisions.reduce((t, p) => t + p.montant, 0)
        zoneCloture.innerHTML = `
            <p class="explication">
                La clôture ajoute aux enveloppes les dépenses qui leur sont associées
                (${provisions.length} provision(s), total ${formatMontant(total)}),
                verrouille le budget et télécharge une sauvegarde complète.
            </p>
            <div class="formulaireCloture">
                <label>Date des provisions <input class="dateCloture" type="date" value="${dateDuJour()}"></label>
                <label>Libellé <input class="libelleCloture" type="text" value="${echapperHTML(libelleProvisionParDefaut())}"></label>
            </div>
            <div class="boutonsCloture">
                <button class="btn-file" data-action="cloturer">Clôturer le budget <i data-lucide="lock"></i></button>
            </div>`
    }
    lucide.createIcons()
}
