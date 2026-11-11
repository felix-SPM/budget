const zoneRevenus = document.querySelector('.zoneRevenus')
const zoneProrata = document.getElementById('prorata')

// Affichage initial (avant tout fichier chargé)
document.addEventListener('DOMContentLoaded', majRevenus)

// Clic dans la liste des revenus (modification)
zoneRevenus.addEventListener('click', (event)=>{
    const button = event.target.closest('.modifRevenu, .validModifRevenu, .annulModifRevenu')
    if (!button) return

    const ligne = button.closest('tr')

    if (button.classList.contains('modifRevenu')){
        // On réaffiche la liste pour annuler une éventuelle autre modification en cours
        majRevenus()
        passerRevenuEnModification(ligne.dataset.idproprietaire)
    }

    if (button.classList.contains('validModifRevenu')) validerModificationRevenu(ligne)

    if (button.classList.contains('annulModifRevenu')) majRevenus()
})

// Clavier dans la ligne en modification : Entrée pour valider, Échap pour annuler
zoneRevenus.addEventListener('keydown', (event)=>{
    const ligne = event.target.closest('tr.edition')
    if (!ligne) return
    if (event.key === 'Enter') validerModificationRevenu(ligne)
    if (event.key === 'Escape') majRevenus()
})

// Remplace le montant par un champ pré-rempli
function passerRevenuEnModification(idProprietaire){
    const ligne = zoneRevenus.querySelector(`tr[data-idproprietaire="${idProprietaire}"]`)
    if (!ligne) return

    const montant = montantRevenu(Number(idProprietaire))
    ligne.classList.add('edition')
    ligne.querySelector('.montantRevenu').innerHTML = `
        <input class="inputModifRevenu" type="number" step="0.01" min="0"
               value="${montant === null ? '' : echapperHTML(montant)}" aria-label="Montant du revenu"> €
    `
    ligne.querySelector('.actionsRevenu').innerHTML = `
        <button class="btnSupp validModifRevenu" aria-label="Valider la modification"><i data-lucide="circle-check"></i></button>
        <button class="btnSupp annulModifRevenu" aria-label="Annuler la modification"><i data-lucide="undo-2"></i></button>
    `
    lucide.createIcons()
    const input = ligne.querySelector('input')
    input.focus()
    input.select()
}

function validerModificationRevenu(ligne){
    const saisie = ligne.querySelector('.inputModifRevenu').value
    const resultat = modifierRevenu(Number(ligne.dataset.idproprietaire), saisie === '' ? NaN : Number(saisie))
    if (resultat !== true){
        alert(resultat)
        return
    }
    majRevenus()
}

// Affiche une ligne par utilisateur (+ Joint s'il y en a plusieurs) et le prorata
function majRevenus(){
    zoneRevenus.innerHTML = ''
    const proprietaires = listeProprietaires()

    if (proprietaires.length === 0){
        zoneRevenus.innerHTML = '<p class="messageVide">Ajoutez des utilisateurs pour saisir leurs revenus.</p>'
    }
    else {
        const tab = document.createElement('table')
        proprietaires.forEach(p => {
            const montant = montantRevenu(p.id)
            const tr = document.createElement('tr')
            tr.dataset.idproprietaire = p.id
            tr.innerHTML = `
                <td class="nomRevenu">${echapperHTML(p.nom)}</td>
                <td class="montantRevenu">${montant === null ? '<span class="nonSaisi">non saisi</span>' : formatMontant(montant)}</td>
                <td class="actionsRevenu">
                    <button class="btnSupp modifRevenu" aria-label="Modifier le revenu"><i data-lucide="pencil"></i></button>
                </td>
            `
            tab.appendChild(tr)
        })
        zoneRevenus.appendChild(tab)
    }

    majProrata()
    lucide.createIcons()
}

// Affiche la part de chaque utilisateur dans le total des revenus individuels
function majProrata(){
    const prorata = calculProrata()
    zoneProrata.innerHTML = prorata === null
        ? ''
        : '<h3>Prorata</h3>' + prorata
            .map(p => `<div>${echapperHTML(p.nom)} : ${p.part.toLocaleString('fr-FR')} %</div>`)
            .join('')
}
