// Déclaration de la variable contenant le div des dépenses
const parentClick = document.querySelector('.zoneDepenses')

// Fonction appelée lorsqu'un click survient dans le div des dépenses
parentClick.addEventListener("click", (event) => {
    // Déclaration de la variable qui va contenir le bouton cliqué
    const button = event.target.closest('.boutonAffMasq, .suppDep, .addDep, .modifDep, .validModifDep, .annulModifDep')
    // Si ça retourne null, la fonction s'arrête
    if (!button) return;

    const cat = Number(button.closest('.categorieDepense').dataset.idcategorie)
    // Tests pour savoir quel bouton est cliqué, et traitement
    if (button.classList.contains('boutonAffMasq')){
        // On déclare la variable contenant le div avec la classe dépense à laquelle le bouton appartient
        
        if (button.dataset.action==="afficher"){
            afficherContenu(cat)
            button.dataset.action="masquer"
            button.innerHTML='<i data-lucide="square-minus"></i>'
        }
        else{
            masquerContenu(cat)
            button.dataset.action="afficher"
            button.innerHTML='<i data-lucide="square-plus"></i>'
        }
        lucide.createIcons()
    }

    if (button.classList.contains('suppDep')){
        const entree = button.closest('tr')
        if (suppDepData(entree.dataset.identree, cat)){
            entree.remove()
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
        idCharge: Number(ligne.querySelector('select.tdDepCharge').value)
    }
}

function ajouterDepenseDepuisLigne(cat, ligne){
    const resultat = ajoutDepData(cat, lireSaisieDepense(ligne))
    if (resultat === true){
        afficherContenu(cat)
        // On replace le curseur dans le libellé pour enchaîner les saisies
        document.querySelector(`[data-idcategorie="${cat}"] tr.input input.tdDepLib`).focus()
    }
    else alert(resultat)
}

function validerModificationDepuisLigne(cat, ligne){
    const resultat = modifDepData(cat, ligne.dataset.identree, lireSaisieDepense(ligne))
    if (resultat === true) afficherContenu(cat)
    else alert(resultat)
}

// Remplace l'affichage d'une dépense par des champs pré-remplis
function passerEnModification(cat, idEntree){
    const depense = data.entrees.find(e => e.id === cat).liste.find(d => d.id === idEntree)
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

    // Récupération des entrées de la catégorie
    const ent = data.entrees.find(e => e.id === idCategorie)

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
            <th>Actions</th>
        </tr>`

    //insertion dans le tableau de la ligne de titre
    tab.appendChild(ligneTitre)

    //Création du corps du tableau
    const tabCorps = document.createElement('tbody')
    // Ajout de l'ID associé
    //tabCorps.id = "tabEntrees"+idAAfficher

    ent.liste.forEach(entrees => {
        //création d'une ligne
        const ligne = document.createElement('tr')
        // Association d'un paramètre data à l'ID de l'entrée
        ligne.dataset.identree=entrees.id
        //Remplissage
        ligne.innerHTML = `
            <td class="tdDepLib">${echapperHTML(entrees.libelle)}</td>
            <td class="tdDepMon">${Number(entrees.montant).toFixed(2)} €</td>
            <td class="tdDepCha">${echapperHTML(nomProprietaire(entrees.idCharge))}</td>
            <td class="tdDepCom">${echapperHTML(intituleCompteParId(entrees.idComptePayeDepuis))}</td>
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
    document.querySelectorAll('.boutonAffMasq[data-action="masquer"]').forEach(bouton => {
        afficherContenu(Number(bouton.closest('.categorieDepense').dataset.idcategorie))
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

    // Parcours de toutes les catégories
    data.categories.forEach(cat => {
        // Création d'un div par catégorie
        const bloc = document.createElement('div')
        // Insertion de l'id de la catégorie en data
        bloc.dataset.idcategorie = cat.id
        // Association à la classe categorieDepense
        bloc.classList.add("categorieDepense")
        // Création du titre et des boutons
        bloc.innerHTML = `
            <h2>
                ${echapperHTML(cat.nom)}
                <button class="boutonAffMasq" data-action="afficher">
                    <i data-lucide="square-plus"></i>
                </button>
            </h2>
            <div class="contenu">
            </div>
        `
        // Intégration du bloc dans la zone de dépenses
        zone.appendChild(bloc)
    })
    //Création des icones
    lucide.createIcons()
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

function reduireZone(idCategorie){
    //Récuperation de l'objet "catégorie" avec l'id
    const cat = data.categories.find(c => c.id === idCategorie);

    //Récupération de l'objet DOM correspondant
    const zone = document.getElementById("tabEntrees"+cat.nom)
}
