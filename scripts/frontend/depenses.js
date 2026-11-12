// Déclaration de la variable contenant le div des dépenses
const parentClick = document.querySelector('.zoneDepenses')

// Fonction appelée lorsqu'un click survient dans le div des dépenses
parentClick.addEventListener("click", (event) => {
    // Déclaration de la variable qui va contenir le bouton cliqué
    const button = event.target.closest('.boutonAffMasq, .suppDep, .addDep, .modifDep, .validModifDep, .annulModifDep, .modifCat, .suppCat, .validModifCat, .annulModifCat')
    // Si ça retourne null, la fonction s'arrête
    if (!button) return;

    const bloc = button.closest('.categorieDepense')
    const cat = Number(bloc.dataset.idcategorie)

    // Boutons du titre de la catégorie (renommer, supprimer)
    if (button.classList.contains('modifCat')) passerCategorieEnModification(bloc)
    if (button.classList.contains('validModifCat')) validerRenommageCategorie(bloc)
    if (button.classList.contains('annulModifCat')) afficherTitreCategorie(bloc)
    if (button.classList.contains('suppCat')) supprimerCategorieDepuisBloc(bloc)

    // Tests pour savoir quel bouton est cliqué, et traitement
    if (button.classList.contains('boutonAffMasq')){
        // On déclare la variable contenant le div avec la classe dépense à laquelle le bouton appartient
        
        if (bloc.dataset.ouverte !== 'oui'){
            afficherContenu(cat)
            bloc.dataset.ouverte = 'oui'
        }
        else{
            masquerContenu(cat)
            bloc.dataset.ouverte = 'non'
        }
        afficherTitreCategorie(bloc)
    }

    if (button.classList.contains('suppDep')){
        const entree = button.closest('tr')
        if (suppDepData(entree.dataset.identree, cat)){
            entree.remove()
            majRepartition()
        }
    }

    if (button.classList.contains('addDep')){
        ajouterDepenseDepuisLigne(cat, button.closest("tr.input"))
    }

    // Passage d'une dépense en mode modification
    if (button.classList.contains('modifDep')){
        const idEntree = Number(button.closest('tr').dataset.identree)
        // On réaffiche la catégorie pour annuler une éventuelle autre modification en cours
        afficherContenu(cat)
        passerEnModification(cat, idEntree)
    }

    if (button.classList.contains('validModifDep')){
        validerModificationDepuisLigne(cat, button.closest('tr.edition'))
    }

    if (button.classList.contains('annulModifDep')){
        afficherContenu(cat)
    }
})

// Clavier : Entrée pour ajouter/valider, Échap pour annuler une modification
parentClick.addEventListener("keydown", (event) => {
    // Renommage d'une catégorie
    if (event.target.matches('.inputModifCategorie')){
        const bloc = event.target.closest('.categorieDepense')
        if (event.key === 'Enter') validerRenommageCategorie(bloc)
        if (event.key === 'Escape') afficherTitreCategorie(bloc)
        return
    }

    const ligne = event.target.closest('tr.input, tr.edition')
    if (!ligne) return
    const cat = Number(ligne.closest('.categorieDepense').dataset.idcategorie)

    if (event.key === 'Enter'){
        if (ligne.classList.contains('input')) ajouterDepenseDepuisLigne(cat, ligne)
        else validerModificationDepuisLigne(cat, ligne)
    }
    if (event.key === 'Escape' && ligne.classList.contains('edition')){
        afficherContenu(cat)
    }
})

// Lit les valeurs saisies dans une ligne (ajout ou modification)
function lireSaisieDepense(ligne){
    const montant = ligne.querySelector('input.tdDepMon').value
    return {
        libelle: ligne.querySelector('input.tdDepLib').value.trim(),
        montant: montant === '' ? NaN : Number(montant),
        idComptePayeDepuis: Number(ligne.querySelector('select.tdDepCompte').value),
        idCharge: Number(ligne.querySelector('select.tdDepCharge').value),
        // Enveloppe seulement si la case est cochée
        idEnveloppe: ligne.querySelector('input.tdDepAvecEnv').checked
            ? Number(ligne.querySelector('select.tdDepEnveloppe').value)
            : null,
        ponctuelle: ligne.querySelector('input.tdDepPonctuelle').checked
    }
}

// Case "enveloppe" : active ou désactive la liste des enveloppes de la même ligne
// Changement de compte : la liste ne propose que les enveloppes du compte choisi
parentClick.addEventListener("change", (event) => {
    // Case "ponctuelle" d'une dépense affichée : enregistrée immédiatement
    if (event.target.matches('input.basculePonctuelle')){
        const ligne = event.target.closest('tr')
        const cat = Number(ligne.closest('.categorieDepense').dataset.idcategorie)
        if (!definirDepensePonctuelle(cat, ligne.dataset.identree, event.target.checked)){
            event.target.checked = !event.target.checked
        }
    }
    if (event.target.matches('input.tdDepAvecEnv')){
        event.target.closest('td').querySelector('select.tdDepEnveloppe').disabled = !event.target.checked
    }
    if (event.target.matches('select.tdDepCompte')){
        const ligne = event.target.closest('tr')
        ligne.querySelector('td.tdDepEnv').innerHTML = contenuCelluleEnveloppe(Number(event.target.value), null)
    }
})

// Contenu de la cellule "Enveloppe" d'une ligne de saisie :
// case à cocher + liste des enveloppes du compte idCompte (idEnveloppe présélectionnée)
// S'il n'y a aucune enveloppe sur ce compte, la case est désactivée et un message l'indique
function contenuCelluleEnveloppe(idCompte, idEnveloppe){
    const enveloppes = enveloppesDuCompte(idCompte)
    if (enveloppes.length === 0){
        return `
            <input class="tdDepAvecEnv" type="checkbox" disabled aria-label="Associer à une enveloppe">
            <select class="tdDepEnveloppe" name="choixEnveloppe" disabled aria-label="Enveloppe">
                <option value="">Pas d'enveloppe sur ce compte</option>
            </select>`
    }
    const avecEnveloppe = enveloppes.some(e => e.id === idEnveloppe)
    return `
        <input class="tdDepAvecEnv" type="checkbox" ${avecEnveloppe ? 'checked' : ''} aria-label="Associer à une enveloppe" title="Associer à une enveloppe">
        <select class="tdDepEnveloppe" name="choixEnveloppe" ${avecEnveloppe ? '' : 'disabled'} aria-label="Enveloppe">
            ${enveloppes.map(e => `<option value="${e.id}"${e.id === idEnveloppe ? ' selected' : ''}>${echapperHTML(e.nom)}</option>`).join('')}
        </select>`
}

// Nom de l'enveloppe associée à une dépense ("" si aucune)
function nomEnveloppeDepense(depense){
    const enveloppe = depense.idEnveloppe === null ? null : trouverEnveloppe(depense.idEnveloppe)
    return enveloppe ? enveloppe.nom : ''
}

function ajouterDepenseDepuisLigne(cat, ligne){
    const resultat = ajoutDepData(cat, lireSaisieDepense(ligne))
    if (resultat === true){
        afficherContenu(cat)
        majRepartition()
        // On replace le curseur dans le libellé pour enchaîner les saisies
        document.querySelector(`[data-idcategorie="${cat}"] tr.input input.tdDepLib`).focus()
    }
    else alert(resultat)
}

function validerModificationDepuisLigne(cat, ligne){
    const resultat = modifDepData(cat, ligne.dataset.identree, lireSaisieDepense(ligne))
    if (resultat === true){
        afficherContenu(cat)
        majRepartition()
    }
    else alert(resultat)
}

// Remplace l'affichage d'une dépense par des champs pré-remplis
function passerEnModification(cat, idEntree){
    const depense = trouverCategorie(cat).depenses.find(d => d.id === idEntree)
    const ligne = document.querySelector(`[data-idcategorie="${cat}"] tr[data-identree="${idEntree}"]`)
    if (!depense || !ligne) return

    ligne.classList.add('edition')
    ligne.innerHTML = `
        ${cellulesSaisieDepense(depense)}
        <td class="tdDepBut">
            <button class="validModifDep" aria-label="Valider la modification"><i data-lucide="circle-check"></i></button>
            <button class="annulModifDep" aria-label="Annuler la modification"><i data-lucide="undo-2"></i></button>
        </td>
    `
    lucide.createIcons()
    ligne.querySelector('input.tdDepLib').focus()
}

// La fonction reçoit en entrée le nom de la catégorie
// Elle doit afficher dans la zone correspondante en HTML
// toutes les entrées inscrites dans data
function afficherContenu(idCategorie){

    // Récupération de la catégorie (et de ses dépenses)
    const categorie = trouverCategorie(idCategorie)

    // Récupération du div dans lequel insérer le contenu
    const zone = document.querySelector('[data-idcategorie="'+idCategorie+'"] .contenu')
    zone.innerHTML=''
    //Création du tableau
    const tab = document.createElement('table')
    // Création du titre du tableau
    const ligneTitre = document.createElement('thead')
    // Création du contenu
    ligneTitre.innerHTML =`
        <tr>
            <th>Libellé</th>
            <th>Montant</th>
            <th>Charge</th>
            <th>Compte</th>
            <th>Enveloppe</th>
            <th>Ponctuelle</th>
            <th>Actions</th>
        </tr>`

    //insertion dans le tableau de la ligne de titre
    tab.appendChild(ligneTitre)

    //Création du corps du tableau
    const tabCorps = document.createElement('tbody')

    categorie.depenses.forEach(depense => {
        //création d'une ligne
        const ligne = document.createElement('tr')
        // Association d'un paramètre data à l'ID de la dépense
        ligne.dataset.identree=depense.id
        //Remplissage
        ligne.innerHTML = `
            <td class="tdDepLib">${echapperHTML(depense.libelle)}</td>
            <td class="tdDepMon">${Number(depense.montant).toFixed(2)} €</td>
            <td class="tdDepCha">${echapperHTML(nomProprietaire(depense.idCharge))}</td>
            <td class="tdDepCom">${echapperHTML(intituleCompteParId(depense.idComptePayeDepuis))}</td>
            <td class="tdDepEnv">${echapperHTML(nomEnveloppeDepense(depense))}</td>
            <td class="tdDepPonct">
                <input class="basculePonctuelle" type="checkbox" ${depense.ponctuelle ? 'checked' : ''}
                       aria-label="Dépense ponctuelle" title="Dépense ponctuelle">
            </td>
            <td class="tdDepBut">
                <button class="modifDep" aria-label="Modifier la dépense"><i data-lucide="pencil"></i></button>
                <button class="suppDep" aria-label="Supprimer la dépense"><i data-lucide="circle-x"></i></button>
            </td>
        `
        //Ajout de la ligné créée
        tabCorps.appendChild(ligne)
    })
    
    afficherInputEntree(idCategorie, tabCorps)
    tab.appendChild(tabCorps)
    zone.appendChild(tab)
    lucide.createIcons()
}

// Réaffiche les catégories actuellement dépliées
// (utile quand la liste des comptes change, pour mettre à jour les menus déroulants)
function rafraichirCategoriesOuvertes(){
    document.querySelectorAll('.categorieDepense[data-ouverte="oui"]').forEach(bloc => {
        afficherContenu(Number(bloc.dataset.idcategorie))
    })
}

function masquerContenu(idCategorie){
    // Récupération du div dans lequel supprimer le contenu
    const zone = document.querySelector('[data-idcategorie="'+idCategorie+'"] .contenu')

    // Suppression de ce qui s'y trouve
    zone.innerHTML=""
}

function creerDivCategories(){
    //Récupération de l'objet DOM correspondant aux dépenses
    const zone = document.querySelector("div.zoneDepenses")
    // Suppression au cas où
    zone.innerHTML=''

    // Un bloc par catégorie
    categoriesTriees().forEach(cat => creerBlocCategorie(cat))
}

// Crée le bloc d'une catégorie (replié) à la fin de la zone des dépenses
function creerBlocCategorie(cat){
    const bloc = document.createElement('div')
    // Insertion de l'id de la catégorie en data
    bloc.dataset.idcategorie = cat.id
    // Catégorie repliée au départ
    bloc.dataset.ouverte = 'non'
    bloc.classList.add("categorieDepense")
    bloc.innerHTML = `
        <h2 class="titreCategorie"></h2>
        <div class="contenu">
        </div>
    `
    document.querySelector("div.zoneDepenses").appendChild(bloc)
    // Création du titre et des boutons
    afficherTitreCategorie(bloc)
    return bloc
}

// Création d'une catégorie depuis le champ de saisie
const inputNewCategorie = document.getElementById('inputNewCategorie')

function ajoutCategorieDepuisSaisie(){
    const resultat = ajouterCategorie(inputNewCategorie.value)
    if (typeof resultat === 'string'){
        alert(resultat)
        return
    }
    inputNewCategorie.value = ''
    // On ajoute uniquement le nouveau bloc (les autres gardent leur état ouvert/fermé)
    creerBlocCategorie(resultat)
    ordonnerBlocsCategories()
}

document.querySelector('.ajoutCategorie').addEventListener('click', (event)=>{
    if (!event.target.closest('.btnAddCategorie')) return
    ajoutCategorieDepuisSaisie()
})

inputNewCategorie.addEventListener('keydown', (event)=>{
    if (event.key === 'Enter') ajoutCategorieDepuisSaisie()
})

// (Ré)affiche le titre d'une catégorie : nom, bouton déplier/replier, renommer, supprimer
function afficherTitreCategorie(bloc){
    const cat = trouverCategorie(bloc.dataset.idcategorie)
    if (!cat) return
    const ouverte = bloc.dataset.ouverte === 'oui'

    bloc.querySelector('.titreCategorie').innerHTML = `
        <span class="nomCategorie">${echapperHTML(cat.nom)}</span>
        <button class="boutonAffMasq" aria-label="${ouverte ? 'Replier' : 'Déplier'} la catégorie">
            <i data-lucide="${ouverte ? 'square-minus' : 'square-plus'}"></i>
        </button>
        <button class="btnSupp modifCat" aria-label="Renommer la catégorie"><i data-lucide="pencil"></i></button>
        <button class="btnSupp suppCat" aria-label="Supprimer la catégorie"><i data-lucide="circle-x"></i></button>
    `
    lucide.createIcons()
}

// Remplace le nom de la catégorie par un champ pré-rempli
function passerCategorieEnModification(bloc){
    // Une seule catégorie renommée à la fois
    document.querySelectorAll('.categorieDepense').forEach(autre => {
        if (autre !== bloc && autre.querySelector('.inputModifCategorie')) afficherTitreCategorie(autre)
    })

    const cat = trouverCategorie(bloc.dataset.idcategorie)
    if (!cat) return

    bloc.querySelector('.titreCategorie').innerHTML = `
        <input class="inputModifCategorie" type="text" value="${echapperHTML(cat.nom)}" aria-label="Nom de la catégorie">
        <button class="btnSupp validModifCat" aria-label="Valider le renommage"><i data-lucide="circle-check"></i></button>
        <button class="btnSupp annulModifCat" aria-label="Annuler le renommage"><i data-lucide="undo-2"></i></button>
    `
    lucide.createIcons()
    const input = bloc.querySelector('.inputModifCategorie')
    input.focus()
    input.select()
}

function validerRenommageCategorie(bloc){
    const resultat = renommerCategorie(bloc.dataset.idcategorie, bloc.querySelector('.inputModifCategorie').value)
    if (resultat !== true){
        alert(resultat)
        return
    }
    afficherTitreCategorie(bloc)
    // Le nouveau nom peut changer la position de la catégorie
    ordonnerBlocsCategories()
}

// Replace les blocs des catégories dans l'ordre alphabétique,
// sans les recréer (chaque bloc garde son état ouvert/fermé et sa saisie en cours)
function ordonnerBlocsCategories(){
    const zone = document.querySelector("div.zoneDepenses")
    categoriesTriees().forEach(cat => {
        const bloc = zone.querySelector(`.categorieDepense[data-idcategorie="${cat.id}"]`)
        if (bloc) zone.appendChild(bloc)
    })
}

function supprimerCategorieDepuisBloc(bloc){
    const idCategorie = Number(bloc.dataset.idcategorie)
    const cat = trouverCategorie(idCategorie)
    if (!cat) return

    // Confirmation, avec avertissement si des dépenses seront supprimées
    const nb = nbDepensesCategorie(idCategorie)
    const message = nb > 0
        ? `La catégorie "${cat.nom}" contient ${nb} dépense(s), qui seront supprimées aussi.\nSupprimer quand même ?`
        : `Supprimer la catégorie "${cat.nom}" ?`
    if (!confirm(message)) return

    if (supprimerCategorie(idCategorie)){
        bloc.remove()
        majRepartition()
    }
}

// Construit les 4 cellules de saisie d'une dépense (libellé, montant, charge, compte)
// "depense" sert à pré-remplir les champs (modification) ; vide pour un ajout
function cellulesSaisieDepense(depense = {}){

    // Attribut "selected" pour l'option correspondant à la valeur actuelle
    const selection = (id, valeur) => id === valeur ? ' selected' : ''

    // Charges possibles : chaque utilisateur, plus "Joint" s'il y en a plusieurs
    const optionsCharges = listeProprietaires().map(p => {
        return `<option value="${echapperHTML(p.id)}"${selection(p.id, depense.idCharge)}>${echapperHTML(p.nom)}</option>`;
    }).join('');

    //Parcours de tous les comptes et création des option correspondantes pour le menu déroulant
    // Intitulé : "propriétaire - libellé du compte" (même affichage que dans le tableau)
    const optionsComptes = data.listeComptes.map(entree => {
        return `<option value="${echapperHTML(entree.id)}"${selection(entree.id, depense.idComptePayeDepuis)}>${echapperHTML(intituleCompte(entree))}</option>`;
    }).join('');

    // Compte affiché dans la liste : celui de la dépense, sinon le premier de la liste
    const idCompte = depense.idComptePayeDepuis !== undefined
        ? depense.idComptePayeDepuis
        : (data.listeComptes.length > 0 ? data.listeComptes[0].id : null)
    const idEnveloppe = depense.idEnveloppe !== undefined ? depense.idEnveloppe : null

    const libelle = depense.libelle !== undefined ? echapperHTML(depense.libelle) : ''
    const montant = depense.montant !== undefined ? echapperHTML(depense.montant) : ''

    return `
        <td><input class="tdDepLib" type="text" name="libelle" value="${libelle}" /></td>
        <td><input class="tdDepMon" type="number" step="0.01" name="montant" value="${montant}" /></td>
        <td>
            <select class="tdDepCharge" name="choixCharge">
                ${optionsCharges}
            </select>
        </td>
        <td>
            <select class="tdDepCompte" name="choixCompte">
                ${optionsComptes}
            </select>
        </td>
        <td class="tdDepEnv">${contenuCelluleEnveloppe(idCompte, idEnveloppe)}</td>
        <td class="tdDepPonct">
            <input class="tdDepPonctuelle" type="checkbox" ${depense.ponctuelle ? 'checked' : ''}
                   aria-label="Dépense ponctuelle" title="Dépense ponctuelle">
        </td>
    `
}

function afficherInputEntree(categorie, zone){

    //Création de la ligne qui accueillera les INPUT
    const ligne = document.createElement('tr')
    // Association de la ligne à une classe input
    ligne.classList.add("input")

    // Remplissage
    ligne.innerHTML = `
        ${cellulesSaisieDepense()}
        <td>
            <button class="addDep">
                <i data-lucide="circle-plus"></i>
            </button>
        </td>
    `
    // Ajout de la ligne à la zone
    zone.appendChild(ligne)
}

