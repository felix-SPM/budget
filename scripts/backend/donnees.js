// Structure des données (enregistrées telles quelles dans le fichier JSON) :
// {
//   user:         [ { id, nom } ],
//   listeComptes: [ { id, libelle, idProprietaire, principal } ],   (un seul principal par propriétaire)
//   revenus:      [ { idProprietaire, montant } ],
//   categories:   [ { id, nom, depenses: [ { id, libelle, montant, idComptePayeDepuis, idCharge, idEnveloppe, ponctuelle } ] } ],
//   enveloppes:   [ { id, nom, idCompte, mouvements: [ { id, date: "AAAA-MM-JJ", libelle, montant } ] } ],
//   virementsFaits: [ { idDe, idVers, montant } ],   (virements de la Répartition cochés comme faits)
//   cloture:      null (budget modifiable) ou { date, libelle, mouvements: [ { idEnveloppe, idMouvement } ] }
// }
// idProprietaire / idCharge : id d'un utilisateur, ou 0 pour "Joint"
// idEnveloppe : enveloppe à créditer pour cette dépense, ou null si aucune
// ponctuelle : true pour une dépense exceptionnelle (non récurrente)
let data = {
    user: [],
    listeComptes: [],
    revenus: [],
    categories: [],
    enveloppes: [],
    virementsFaits: [],
    cloture: null
}

// Vérifie qu'un objet lu dans un fichier a bien la structure attendue
function structureValide(d){
    return d !== null && typeof d === 'object'
        && Array.isArray(d.user)
        && Array.isArray(d.listeComptes)
        && d.listeComptes.every(c => typeof c.principal === 'boolean')
        && Array.isArray(d.revenus)
        && Array.isArray(d.categories)
        && d.categories.every(c => Array.isArray(c.depenses)
            && c.depenses.every(dep => (dep.idEnveloppe === null || typeof dep.idEnveloppe === 'number')
                && typeof dep.ponctuelle === 'boolean'))
        && Array.isArray(d.enveloppes)
        && d.enveloppes.every(e => Array.isArray(e.mouvements))
        && Array.isArray(d.virementsFaits)
        && (d.cloture === null || (typeof d.cloture === 'object' && Array.isArray(d.cloture.mouvements)))
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

// Enregistre les données actuelles dans "AAAAMMJJ - SoFixBudget.json"
function enregistrerDataJSON() {
    // Récupération de la date actuelle
    const aujourdHui = new Date();

    const annee = aujourdHui.getFullYear();
    const jour = String(aujourdHui.getDate()).padStart(2, '0');
    const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0');

    telechargerJSON(data, `${annee}${mois}${jour} - SoFixBudget.json`);
}

// Fait télécharger un objet au format JSON sous le nom indiqué
function telechargerJSON(objet, nomFichier) {
    const contenuJSON = JSON.stringify(objet, null, 2);
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