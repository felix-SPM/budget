// Création et initialisation de la variable contenant les données
let data = null;

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