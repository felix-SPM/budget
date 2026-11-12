const selectProprietaireCompte = document.getElementById('selectProprietaireCompte')
const inputNewCompte = document.getElementById('inputNewCompte')

// Intitulé d'un compte tel qu'affiché dans les dépenses : "propriétaire - libellé"
// (chaîne vide si le compte n'existe pas)
function intituleCompte(compte){
    if (!compte) return ''
    return `${nomProprietaire(compte.idProprietaire)} - ${compte.libelle}`
}

// Intitulé d'un compte à partir de son id
function intituleCompteParId(idCompte){
    return intituleCompte(data.listeComptes.find(c => c.id === idCompte))
}

// Initialisation du formulaire au chargement de la page (avant tout fichier chargé)
document.addEventListener('DOMContentLoaded', majListeComptes)

// Ajout d'un compte depuis le formulaire
function ajoutCompteDepuisSaisie(){
    const resultat = ajouterCompte(inputNewCompte.value, Number(selectProprietaireCompte.value))

    // Si une chaîne est renvoyée, c'est un message d'erreur
    if (typeof resultat === 'string'){
        alert(resultat)
        return
    }

    inputNewCompte.value = ''
    majListeComptes()
    rafraichirCategoriesOuvertes()
}

// Clic sur le bouton d'ajout
document.querySelector('.ajoutCompte').addEventListener('click', (event)=>{
    if (!event.target.closest('.btnAddCompte')) return
    ajoutCompteDepuisSaisie()
})

// Touche Entrée dans un des champs de saisie
document.querySelector('.ajoutCompte').addEventListener('keydown', (event)=>{
    if (event.key === 'Enter' && event.target.matches('input')) ajoutCompteDepuisSaisie()
})

// Options du menu déroulant des propriétaires (utilisateurs + "Joint" s'il y en a plusieurs)
// idSelectionne : propriétaire présélectionné (modification d'un compte)
function optionsProprietaires(idSelectionne = null){
    return listeProprietaires()
        .map(p => `<option value="${echapperHTML(p.id)}"${p.id === idSelectionne ? ' selected' : ''}>${echapperHTML(p.nom)}</option>`)
        .join('')
}

// Remplit le menu déroulant des propriétaires du formulaire d'ajout
function majFormulaireCompte(){
    const choixPrecedent = selectProprietaireCompte.value
    const users = utilisateursValides()

    selectProprietaireCompte.innerHTML = optionsProprietaires()

    // On conserve le choix précédent s'il existe encore
    if ([...selectProprietaireCompte.options].some(o => o.value === choixPrecedent)){
        selectProprietaireCompte.value = choixPrecedent
    }

    // Sans utilisateur, impossible de créer un compte
    const actif = users.length > 0
    document.querySelectorAll('.ajoutCompte input, .ajoutCompte select, .ajoutCompte button')
        .forEach(el => el.disabled = !actif)
    inputNewCompte.placeholder = actif ? 'Intitulé du compte' : 'Créez d\'abord un utilisateur'
}

// Clic dans la liste des comptes (modification, suppression)
document.querySelector('.listeComptes').addEventListener('click', (event)=>{
    const button = event.target.closest('.suppCompte, .modifCompte, .validModifCompte, .annulModifCompte, .principalCompte')
    if (!button) return

    const ligne = button.closest('tr')
    const idCompte = ligne.dataset.idcompte

    if (button.classList.contains('suppCompte')) supprimerCompteDepuisListe(idCompte)

    // Étoile : désigne le compte principal (courant) de son propriétaire
    if (button.classList.contains('principalCompte')){
        if (definirComptePrincipal(idCompte)) majListeComptes()
    }

    if (button.classList.contains('modifCompte')){
        // On réaffiche la liste pour annuler une éventuelle autre modification en cours
        majListeComptes()
        passerCompteEnModification(idCompte)
    }

    if (button.classList.contains('validModifCompte')) validerModificationCompte(ligne)

    if (button.classList.contains('annulModifCompte')) majListeComptes()
})

// Clavier dans la ligne en modification : Entrée pour valider, Échap pour annuler
document.querySelector('.listeComptes').addEventListener('keydown', (event)=>{
    const ligne = event.target.closest('tr.edition')
    if (!ligne) return
    if (event.key === 'Enter') validerModificationCompte(ligne)
    if (event.key === 'Escape') majListeComptes()
})

// Remplace le propriétaire et l'intitulé par des champs pré-remplis
function passerCompteEnModification(idCompte){
    const compte = data.listeComptes.find(c => c.id === Number(idCompte))
    const ligne = document.querySelector(`.listeComptes tr[data-idcompte="${idCompte}"]`)
    if (!compte || !ligne) return

    ligne.classList.add('edition')
    ligne.innerHTML = `
        <td></td>
        <td class="proprietaireCompte">
            <select class="selectModifProprietaire" aria-label="Propriétaire du compte">${optionsProprietaires(compte.idProprietaire)}</select>
        </td>
        <td class="ligneCompte">
            <input class="inputModifCompte" type="text" value="${echapperHTML(compte.libelle)}" aria-label="Intitulé du compte">
        </td>
        <td>
            <button class="btnSupp validModifCompte" aria-label="Valider la modification"><i data-lucide="circle-check"></i></button>
            <button class="btnSupp annulModifCompte" aria-label="Annuler la modification"><i data-lucide="undo-2"></i></button>
        </td>
    `
    lucide.createIcons()
    const input = ligne.querySelector('input')
    input.focus()
    input.select()
}

function validerModificationCompte(ligne){
    const resultat = modifierCompte(
        ligne.dataset.idcompte,
        ligne.querySelector('.inputModifCompte').value,
        Number(ligne.querySelector('.selectModifProprietaire').value)
    )
    if (resultat !== true){
        alert(resultat)
        return
    }
    majListeComptes()
    // Les intitulés "propriétaire - compte" des dépenses ouvertes changent aussi
    rafraichirCategoriesOuvertes()
}

function supprimerCompteDepuisListe(idCompte){
    // On empêche la suppression d'un compte encore utilisé par des dépenses
    const nb = nbDepensesCompte(idCompte)
    if (nb > 0){
        alert(`Impossible de supprimer ce compte : il est utilisé par ${nb} dépense(s).`)
        return
    }
    // Ainsi qu'un compte qui contient des enveloppes
    const nbEnv = nbEnveloppesCompte(idCompte)
    if (nbEnv > 0){
        alert(`Impossible de supprimer ce compte : il contient ${nbEnv} enveloppe(s).`)
        return
    }

    if (suppressionCompte(idCompte)){
        majListeComptes()
        rafraichirCategoriesOuvertes()
    }
}

// Fonction de mise à jour de la liste des comptes
function majListeComptes(){
    const zone = document.querySelector('div.listeComptes')
    zone.innerHTML = ''

    const tabComptes = document.createElement('table')
    data.listeComptes.forEach(compte => {
        const trCompte = document.createElement('tr')
        trCompte.dataset.idcompte = compte.id
        trCompte.innerHTML = `
            <td>
                <button class="btnSupp principalCompte${compte.principal ? ' estPrincipal' : ''}"
                        aria-label="${compte.principal ? 'Compte principal' : 'Définir comme compte principal'}"
                        title="${compte.principal ? 'Compte principal (courant)' : 'Définir comme compte principal'}">
                    <i data-lucide="star"></i>
                </button>
            </td>
            <td class="proprietaireCompte">${echapperHTML(nomProprietaire(compte.idProprietaire))}</td>
            <td class="ligneCompte">${echapperHTML(compte.libelle)}</td>
            <td>
                <button class="btnSupp modifCompte" aria-label="Modifier le compte"><i data-lucide="pencil"></i></button>
                <button class="btnSupp suppCompte" aria-label="Supprimer le compte"><i data-lucide="circle-x"></i></button>
            </td>
        `
        tabComptes.appendChild(trCompte)
    })
    zone.appendChild(tabComptes)

    majFormulaireCompte()
    lucide.createIcons()
    majRepartition()
    // Les enveloppes affichent l'intitulé des comptes
    majEnveloppes()
}
