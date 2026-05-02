// Création et initialisation de la variable contenant les données
let data = {
    user:[
        {id:"", nom:""}
    ],
    listeComptes:[
        {id:"", symbole:"", libelle:""}
    ],
    listeCharge:[
        {id:"", symbole:"", libelle:""}
    ],
    categories:[
        {id:"", nom:""}
    ],
    entrees:[
        {id:"", liste:[
            {id:"", libelle:"", montant:"", idComptePayeDepuis:"", idCharge:""}
        ]}
    ]
}

// On attend l'évenement correspondant à un fichier sélectionné
document.getElementById('jsonFileInput').addEventListener('change', function (event) {
    // Création de la variable contenant le fichier
    const fichier = event.target.files[0];
    // Sorti si pas de fichier
    if (!fichier) return;
    // Création de la variable qui contiendra les données
    const lecteur = new FileReader();

    // Au chargement du fichier
    lecteur.onload = function (e) {
        try {
            // Récuperation des données
            data = JSON.parse(e.target.result);
            // Initialisation de l'affichage
            initFront()

        } catch (erreur) {
            console.error('Le fichier JSON est invalide :', erreur);
        }
    };

    lecteur.readAsText(fichier);
});

// Fonction qui supprime une dépense avec idEntree dans la liste d'une catégorie idCategorie
function suppDepData(idEntree, idCategorie){

    // Récupération de l'entrée correspondant à l'id de la catégorie
    const categorie = data.entrees.find(e => e.id===Number(idCategorie))
    // Recherche dans la liste des entrées l'index de celle portant le numéro d'id
    const indexEntree = categorie.liste.findIndex(i => i.id === Number(idEntree))
    // Suppression de l'entrée par son numéro d'index
    const supp = categorie.liste.splice(indexEntree,1)

    // Si l'élement avec le bon id a été supprimé, TRUE est renvoyé
    return supp.length > 0 && supp[0].id === Number(idEntree)
}

function ajoutDepData(idCategorie, input){

    const categorie = data.entrees.find(e => e.id === idCategorie);
    if (!categorie) return false;

    const nouvelId =
        categorie.liste.length > 0
            ? Math.max(...categorie.liste.map(e => e.id)) + 1
            : 1;

    const nouvelleEntree = {
        id: nouvelId,
        libelle: input.querySelector('input.tdDepLib').value.trim(),
        montant: Number(input.querySelector('input.tdDepMon').value),
        idComptePayeDepuis: Number(input.querySelector('select.tdDepCompte').value),
        idCharge: Number(input.querySelector('select.tdDepCharge').value)
    };

    const longueurAvant = categorie.liste.length;
    const nouvelleLongueur = categorie.liste.push(nouvelleEntree);

    return nouvelleLongueur === longueurAvant + 1;
}

function enregistrerDataJSON() {
    // Récupération de la date actuelle
    const aujourdHui = new Date();

    const annee = aujourdHui.getFullYear();
    const jour = String(aujourdHui.getDate()).padStart(2, '0');
    const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0');

    const nomFichier = `${annee}${mois}${jour} - SoFixBudget.json`;

    const contenuJSON = JSON.stringify(data, null, 2);
    const blob = new Blob([contenuJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;

    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);

    URL.revokeObjectURL(url);
}