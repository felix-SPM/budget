const selectProprietaireCompte = document.getElementById('selectProprietaireCompte')
const prefixeSymboleCompte = document.getElementById('prefixeSymboleCompte')
const inputSymboleCompte = document.getElementById('inputSymboleCompte')
const inputNewCompte = document.getElementById('inputNewCompte')

// Intitulé d'un compte tel qu'affiché dans les dépenses : "propriétaire - libellé"
// (libellé seul si le propriétaire est inconnu, chaîne vide si le compte n'existe pas)
function intituleCompte(compte){
    if (!compte) return ''
    return 'idProprietaire' in compte
        ? `${nomProprietaire(compte.idProprietaire)} - ${compte.libelle}`
        : compte.libelle
}

// Intitulé d'un compte à partir de son id
function intituleCompteParId(idCompte){
    return intituleCompte((data.listeComptes || []).find(c => c.id === idCompte))
}

// Initialisation du formulaire au chargement de la page (avant tout fichier chargé)
document.addEventListener('DOMContentLoaded', majListeComptes)

// Ajout d'un compte depuis le formulaire
function ajoutCompteDepuisSaisie(){
    const resultat = ajouterCompte(
        inputNewCompte.value,
        Number(selectProprietaireCompte.value),
        inputSymboleCompte.value
    )

    // Si une chaîne est renvoyée, c'est un message d'erreur
    if (typeof resultat === 'string'){
        alert(resultat)
        return
    }

    inputNewCompte.value = ''
    inputSymboleCompte.value = ''
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

// Changement de propriétaire : mise à jour de la lettre imposée du symbole
selectProprietaireCompte.addEventListener('change', majPrefixeSymbole)

// Saisie du symbole : majuscules, lettres et chiffres uniquement
inputSymboleCompte.addEventListener('input', ()=>{
    inputSymboleCompte.value = nettoyerSuffixeSymbole(inputSymboleCompte.value)
})

function majPrefixeSymbole(){
    const lettre = selectProprietaireCompte.value === '' ? '?' : lettreProprietaire(Number(selectProprietaireCompte.value))
    prefixeSymboleCompte.textContent = `${lettre}.`
}

// Remplit le menu déroulant des propriétaires (utilisateurs + "Joint" s'il y en a plusieurs)
function majFormulaireCompte(){
    const choixPrecedent = selectProprietaireCompte.value
    const users = utilisateursValides()

    let options = users.map(u => `<option value="${echapperHTML(u.id)}">${echapperHTML(u.nom)}</option>`)
    if (jointDisponible()) options.push(`<option value="${ID_JOINT}">Joint</option>`)
    selectProprietaireCompte.innerHTML = options.join('')

    // On conserve le choix précédent s'il existe encore
    if ([...selectProprietaireCompte.options].some(o => o.value === choixPrecedent)){
        selectProprietaireCompte.value = choixPrecedent
    }

    // Sans utilisateur, impossible de créer un compte
    const actif = users.length > 0
    document.querySelectorAll('.ajoutCompte input, .ajoutCompte select, .ajoutCompte button')
        .forEach(el => el.disabled = !actif)
    inputNewCompte.placeholder = actif ? 'Intitulé du compte' : 'Créez d\'abord un utilisateur'

    majPrefixeSymbole()
}

// Clic dans la liste des comptes (suppression)
document.querySelector('.listeComptes').addEventListener('click', (event)=>{
    const button = event.target.closest('.suppCompte')
    if (!button) return

    const idCompte = button.closest('tr').dataset.idcompte

    // On empêche la suppression d'un compte encore utilisé par des dépenses
    const nb = nbDepensesCompte(idCompte)
    if (nb > 0){
        alert(`Impossible de supprimer ce compte : il est utilisé par ${nb} dépense(s).`)
        return
    }

    if (suppressionCompte(idCompte)){
        majListeComptes()
        rafraichirCategoriesOuvertes()
    }
})

// Fonction de mise à jour de la liste des comptes
function majListeComptes(){
    const zone = document.querySelector('div.listeComptes')
    zone.innerHTML = ''

    if ('listeComptes' in data){
        const tabComptes = document.createElement('table')
        data.listeComptes.forEach(compte => {
            // On ignore les entrées sans ID
            if (compte.id === '') return

            const proprietaire = 'idProprietaire' in compte ? nomProprietaire(compte.idProprietaire) : '?'
            const trCompte = document.createElement('tr')
            trCompte.dataset.idcompte = compte.id
            trCompte.innerHTML = `
                <td class="symboleCompte">${echapperHTML(compte.symbole)}</td>
                <td class="ligneCompte">${echapperHTML(compte.libelle)}</td>
                <td class="proprietaireCompte">${echapperHTML(proprietaire)}</td>
                <td>
                    <button class="btnSupp suppCompte" aria-label="Supprimer le compte"><i data-lucide="circle-x"></i></button>
                </td>
            `
            tabComptes.appendChild(trCompte)
        })
        zone.appendChild(tabComptes)
    }

    majFormulaireCompte()
    lucide.createIcons()
}
