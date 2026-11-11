// Fichier contenant les fonctions d'initialisation de la page

function initFront(){
    creerDivCategories()
    // (met aussi à jour les comptes et les revenus)
    majListeUtilisateur()

    lucide.createIcons()
}

// Formate un montant en euros à la française : 1234.5 -> "1 234,50 €"
const formateurEuros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
function formatMontant(montant){
    return formateurEuros.format(montant)
}

// Échappe les caractères spéciaux HTML d'une valeur avant de l'insérer via innerHTML
// (évite qu'un nom ou un libellé contenant du HTML soit interprété comme du code)
function echapperHTML(valeur){
    if (valeur === null || valeur === undefined) return ''
    return String(valeur)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}