// Catégories : data.categories = [ { id, nom, depenses: [ ... ] } ]
// Chaque catégorie contient directement ses dépenses (voir backDepense.js).

// Recherche d'une catégorie par son id (undefined si absente)
function trouverCategorie(idCategorie){
    return data.categories.find(c => c.id === Number(idCategorie))
}

// Toutes les dépenses, toutes catégories confondues
function toutesLesDepenses(){
    return data.categories.flatMap(c => c.depenses)
}

// Catégories triées par ordre alphabétique (sans tenir compte des majuscules ni des accents)
function categoriesTriees(){
    return [...data.categories].sort((a, b) =>
        String(a.nom).localeCompare(String(b.nom), 'fr', { sensitivity: 'base' })
    )
}

// Vérifie un nom de catégorie (déjà nettoyé des espaces)
// idIgnore : catégorie à ne pas comparer (celle qu'on renomme)
function validerNomCategorie(nom, idIgnore = null){
    if (nom === '') return 'Le nom de la catégorie est obligatoire.'
    const existe = data.categories.some(c =>
        c.id !== idIgnore && String(c.nom).toLowerCase() === nom.toLowerCase()
    )
    if (existe) return `Une catégorie "${nom}" existe déjà.`
    return null
}

// Crée une catégorie vide
// Renvoie la catégorie créée, ou un message d'erreur (chaîne)
function ajouterCategorie(nom){
    nom = String(nom).trim()
    const erreur = validerNomCategorie(nom)
    if (erreur) return erreur

    const ids = data.categories.map(c => c.id)
    const idNew = ids.length > 0 ? Math.max(...ids) + 1 : 1

    const categorie = { id: idNew, nom: nom, depenses: [] }
    data.categories.push(categorie)
    return categorie
}

// Renomme une catégorie (son id ne change pas)
// Renvoie true si c'est fait, sinon un message d'erreur (chaîne)
function renommerCategorie(idCategorie, nouveauNom){
    idCategorie = Number(idCategorie)
    nouveauNom = String(nouveauNom).trim()

    const categorie = trouverCategorie(idCategorie)
    if (!categorie) return 'Catégorie introuvable.'

    const erreur = validerNomCategorie(nouveauNom, idCategorie)
    if (erreur) return erreur

    categorie.nom = nouveauNom
    return true
}

// Nombre de dépenses d'une catégorie
function nbDepensesCategorie(idCategorie){
    const categorie = trouverCategorie(idCategorie)
    return categorie ? categorie.depenses.length : 0
}

// Supprime une catégorie, et donc ses dépenses
// Renvoie true si c'est fait, false si la catégorie n'existe pas
function supprimerCategorie(idCategorie){
    const index = data.categories.findIndex(c => c.id === Number(idCategorie))
    if (index === -1) return false
    data.categories.splice(index, 1)
    return true
}
