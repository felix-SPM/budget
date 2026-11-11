// Fichier contenant les fonctions d'initialisation de la page

function initFront(){
    creerDivCategories()
    // Anciens fichiers : on déduit le propriétaire des comptes à partir de leur symbole
    completerProprietairesComptes()
    // (met aussi à jour la liste des comptes)
    majListeUtilisateur()

    lucide.createIcons()
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