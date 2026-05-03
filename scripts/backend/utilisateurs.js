// fonction pour ajouter un utilisateur
function ajouterUtilisateur(nom){
    // initialisation de l'ID associé à l'utilisateur
    let idNew = 1

    // si la propriété user ,n'existe pas
    if (!('user' in data)){
        // Création de la propriété
        data.user = []
    }
    // sinon on recherche un ID disponible
    else{
        idNew =
        data.user.length > 0
            ? Math.max(...data.user.map(e => e.id)) + 1
            : 1;
    }
    // Création d'un objet utilisateur
    const newUser = {
        id: idNew,
        nom: nom
    }

    // Ajout d'un membre dans data user
    data.user.push(newUser)
}

// fonction qui supprime un utilisateur 
function suppressionUtilisateur(idSupp){
    
    // Cherche d'index dans le tableau de user de l'élement qui possède l'id = idSupp
    const indexSupp = data.user.findIndex(user => user.id === Number(idSupp));

    if (!(indexSupp===-1)){
        // Suppression de l'entrée par son numéro d'index
        const supp = data.user.splice(indexSupp,1)
        // Si l'élement avec le bon id a été supprimé, TRUE est renvoyé
        return supp.length > 0 && supp[0].id === Number(idSupp)
    }
    else{
        return false
    }
    

    
}