// Fichier contenant les fonctions d'initialisation de la page

function initFront(){
    // Anciens fichiers : les charges des dépenses deviennent des utilisateurs (ou Joint)
    const chargesNonTrouvees = migrerChargesVersUtilisateurs()
    if (chargesNonTrouvees.length > 0){
        alert(`Ces charges ne correspondent à aucun utilisateur : ${chargesNonTrouvees.join(', ')}.\n`
            + `Les dépenses concernées n'ont plus de charge : modifiez-les pour en choisir une.`)
    }
    creerDivCategories()
    // Anciens fichiers : suppression du symbole des comptes (propriétaire déduit si absent)
    migrerComptesSansSymbole()
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