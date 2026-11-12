// Structure des données (enregistrées telles quelles dans le fichier JSON) :
// {
//   user:         [ { id, nom } ],
//   listeComptes: [ { id, libelle, idProprietaire, principal } ],   (un seul principal par propriétaire)
//   revenus:      [ { idProprietaire, montant } ],
//   categories:   [ { id, nom, depenses: [ { id, libelle, montant, idComptePayeDepuis, idCharge } ] } ]
// }
// idProprietaire / idCharge : id d'un utilisateur, ou 0 pour "Joint"
let data = {
    user: [],
    listeComptes: [],
    revenus: [],
    categories: []
}

// Vérifie qu'un objet lu dans un fichier a bien la structure attendue
function structureValide(d){
    return d !== null && typeof d === 'object'
        && Array.isArray(d.user)
        && Array.isArray(d.listeComptes)
        && d.listeComptes.every(c => typeof c.principal === 'boolean')
        && Array.isArray(d.revenus)
        && Array.isArray(d.categories)
        && d.categories.every(c => Array.isArray(c.depenses))
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
            const contenu = JSON.parse(e.target.result);
            if (!structureValide(contenu)){
                alert(`Impossible de charger "${fichier.name}" : le contenu ne correspond pas au format SoFix Budget.`);
                return;
            }
            data = contenu;
            // Initialisation de l'affichage
            initFront()
            majNomFichier(fichier.name)

        } catch (erreur) {
            console.error('Le fichier JSON est invalide :', erreur);
            alert(`Impossible de charger "${fichier.name}" : le fichier JSON est invalide.`);
        }

    };

    lecteur.readAsText(fichier);
    // Réinitialisation du champ pour pouvoir recharger le même fichier
    event.target.value = '';
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