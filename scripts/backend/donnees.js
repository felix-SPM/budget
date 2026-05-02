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
            majNomFichier(event.target.files[0].name)

        } catch (erreur) {
            console.error('Le fichier JSON est invalide :', erreur);
        }
        
    };

    lecteur.readAsText(fichier);
});

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