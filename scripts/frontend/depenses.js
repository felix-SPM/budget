// Déclaration de la variable contenant le div des dépenses
const parentClick = document.querySelector('.zoneDepenses')

// Fonction appelée lorsqu'un click survient dans le div des dépenses
parentClick.addEventListener("click", (event) => {
    // Déclaration de la variable qui va contenir le bouton cliqué ayant la class boutonAffMasq
    const button = event.target.closest('.boutonAffMasq')
    // Si on ne trouve pas, on sort
    if (!button) return;

    // On déclare la variable contenant le div avec la classe dépense à laquelle le bouton appartient
    const depense = button.closest('.depense');

    if (button.value==="masq"){
        afficherContenu(depense.id)
        button.value="affi"
        button.innerHTML='<i data-lucide="square-minus"></i>'
    }
    else{
        masquerContenu(depense.id)
        button.value="masq"
        button.innerHTML='<i data-lucide="square-plus"></i>'
    }
    lucide.createIcons()
})

// La fonction reçoit en entrée le nom de la catégorie
// Elle doit afficher dans la zone correspondante en HTML
// toutes les entrées inscrites dans data
function afficherContenu(idAAfficher){

    //Récupération de la catégorie à afficher
    const cat = data.categories.find(e =>e.nom === idAAfficher)
    
    // Récupération des entrées de la catégorie
    const ent = data.entrees.find(e => e.id === cat.id)
   
    // Récupération du div dans lequel insérer le contenu
    const zone = document.querySelector("#"+idAAfficher+" .contenu")

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
            <th></th>
        <tr>`

    //insertion dans le tableau de la ligne de titre
    tab.appendChild(ligneTitre)

    //Création du corps du tableau
    const tabCorps = document.createElement('tbody')
    // Ajout de l'ID associé
    tabCorps.id = "tabEntrees"+idAAfficher

    ent.liste.forEach(entrees => {
        //création d'une ligne
        const ligne = document.createElement('tr')
        //Remplissage
        ligne.innerHTML = `
            <td>${entrees.libelle}</td>
            <td>${entrees.montant.toFixed(2)} €</td>
            <td>${rechLibelle(data.listeCharge, entrees.idCharge)}</td>
            <td>${rechLibelle(data.listeComptes, entrees.idComptePayeDepuis)}</td>
            <td><button class="addDep"><i data-lucide="circle-x"></i></button></td>
        `
        //Ajout de la ligné créée
        tabCorps.appendChild(ligne)
    })
    
    afficherInputEntree(cat, tabCorps)
    tab.appendChild(tabCorps)
    zone.appendChild(tab)
    lucide.createIcons()
}

function masquerContenu(idAMasquer){
    // Récupération du div dans lequel supprimer le contenu
    const zone = document.querySelector("#"+idAMasquer+" .contenu")

    // Suppression de ce qui s'y trouve
    zone.innerHTML=""
}

function creerZonesDepenses()
{
    //Récupération de l'objet DOM correspondant aux dépenses
    const zone = document.querySelector("div.zoneDepenses")
    // Suppression au cas où
    zone.innerHTML=''

    // Parcours de toutes les catégories
    data.categories.forEach(entrees => {
        // Création d'un div
        const bloc = document.createElement('div')
        // Remplissage
        bloc.id = entrees.nom
        // Ajout d'une class depense
        bloc.classList.add("depense")
        
        bloc.innerHTML = `
            <h2>
                ${entrees.nom}
                <!--<input class="boutonAffMasq" id="bouton${entrees.nom}" type="button" value="Afficher"/>-->
                <button class="boutonAffMasq" value="masq">
                    <i data-lucide="square-plus"></i>
                </button>
            </h2>
            <div class="contenu">
            </div>
        `
        zone.appendChild(bloc)
    })
    lucide.createIcons()
}

function afficherInputEntree(categorie, zone){


    //Création de la ligne qui accueillera les INPUT
    const ligne = document.createElement('tr')

    //Parcours de toutes les charges et création des option correspondantes pour le menu déroulant
    const optionsCharges = data.listeCharge.map(entree => {
        return `<option value="${entree.id}">${entree.libelle}</option>`;
    }).join('');

    //Parcours de tous les comptes et création des option correspondantes pour le menu déroulant
    const optionsComptes = data.listeComptes.map(entree => {
        return `<option value="${entree.id}">${entree.libelle}</option>`;
    }).join('');

    ligne.innerHTML = `
        <td><input type="text" id="libelle${categorie.nom}" name="libelle${categorie.nom}" /></td>
        <td><input type="number" id="montant${categorie.nom}" name="montant${categorie.nom}" /></td>
        <td>
            <select name="choixCharge${categorie.nom}">
                ${optionsCharges}
            </select>
        </td>
        <td>
            <select name="choixCompte${categorie.nom}">
                ${optionsComptes}
            </select>
        </td>
            <button class="suppDep">
                <i data-lucide="circle-plus"></i>
            </button>
        <td>
    `
    zone.appendChild(ligne)
}

function reduireZone(idCategorie){
    //Récuperation de l'objet "catégorie" avec l'id
    const cat = data.categories.find(c => c.id === idCategorie);

    //Récupération de l'objet DOM correspondant
    const zone = document.getElementById("tabEntrees"+cat.nom)
}

//creerZonesDepenses()

function rechLibelle(liste, valeur){
    const objetTrouve = liste.find(obj => obj["id"] === valeur);
  return objetTrouve ? objetTrouve["libelle"] : null;
}
