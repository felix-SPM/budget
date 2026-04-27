// Déclaration de la variable contenant le div des dépenses
const parentClick = document.querySelector('.zoneDepenses')

// Fonction appelée lorsqu'un click survient dans le div des dépenses
parentClick.addEventListener("click", (event) => {
    // Déclaration de la variable qui va contenir le bouton cliqué
    const button = event.target.closest('.boutonAffMasq, .suppDep, .addDep')
    // Si ça retourne null, la fonction s'arrête
    if (!button) return;

    // Tests pour savoir quel bouton est cliqué, et traitement
    if (button.classList.contains('boutonAffMasq')){
        // On déclare la variable contenant le div avec la classe dépense à laquelle le bouton appartient
        const cat = button.closest('.categorieDepense');
        if (button.dataset.action==="afficher"){
            afficherContenu(Number(cat.dataset.idcategorie))
            button.dataset.action="masquer"
            button.innerHTML='<i data-lucide="square-minus"></i>'
        }
        else{
            masquerContenu(Number(cat.dataset.idcategorie))
            button.dataset.action="afficher"
            button.innerHTML='<i data-lucide="square-plus"></i>'
        }
        lucide.createIcons()
    }

    const entree = button.closest('tr')
    if (button.classList.contains('suppDep')){
        if (suppDepData(entree.dataset.identree, button.closest('div.categorieDepense').dataset.idcategorie)){
            entree.remove()
        }

    }

    if (button.classList.contains('addDep')){
        console.log("Ajouter dépense")
    }
})

// La fonction reçoit en entrée le nom de la catégorie
// Elle doit afficher dans la zone correspondante en HTML
// toutes les entrées inscrites dans data
function afficherContenu(idCategorie){

    // Récupération des entrées de la catégorie
    const ent = data.entrees.find(e => e.id === idCategorie)

    // Récupération du div dans lequel insérer le contenu
    const zone = document.querySelector('[data-idcategorie="'+idCategorie+'"] .contenu')

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
        <tr>`

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
            <td class="tdDepLib">${entrees.libelle}</td>
            <td class="tdDepMon">${entrees.montant.toFixed(2)} €</td>
            <td class="tdDepCha">${rechLibelle(data.listeCharge, entrees.idCharge)}</td>
            <td class="tdDepCom">${rechLibelle(data.listeComptes, entrees.idComptePayeDepuis)}</td>
            <td class="tdDepBut"><button class="suppDep"><i data-lucide="circle-x"></i></button></td>
        `
        //Ajout de la ligné créée
        tabCorps.appendChild(ligne)
    })
    
    afficherInputEntree(idCategorie, tabCorps)
    tab.appendChild(tabCorps)
    zone.appendChild(tab)
    lucide.createIcons()
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
                ${cat.nom}
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

function afficherInputEntree(categorie, zone){

    //Création de la ligne qui accueillera les INPUT
    const ligne = document.createElement('tr')
    // Association de la ligne à une classe input
    ligne.classList.add("input")

    //Parcours de toutes les charges et création des option correspondantes pour le menu déroulant
    const optionsCharges = data.listeCharge.map(entree => {
        return `<option value="${entree.id}">${entree.libelle}</option>`;
    }).join('');

    //Parcours de tous les comptes et création des option correspondantes pour le menu déroulant
    const optionsComptes = data.listeComptes.map(entree => {
        return `<option value="${entree.id}">${entree.libelle}</option>`;
    }).join('');

    // Remplissage
    ligne.innerHTML = `
        <td><input class="tdDepLib" type="text" name="libelle" /></td>
        <td><input class="tdDepMon" type="number" name="montant" /></td>
        <td>
            <select name="choixCharge">
                ${optionsCharges}
            </select>
        </td>
        <td>
            <select name="choixCompte">
                ${optionsComptes}
            </select>
        </td>
            <button class="addDep">
                <i data-lucide="circle-plus"></i>
            </button>
        <td>
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

function rechLibelle(liste, valeur){
    const objetTrouve = liste.find(obj => obj["id"] === valeur);
  return objetTrouve ? objetTrouve["libelle"] : null;
}
