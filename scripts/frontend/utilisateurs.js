// Evenement d'un clique dans un div ajoututilisateurs
document.querySelector('.ajoutUtilisateurs').addEventListener('click', (event)=>{
    // on vérifie que c'est bien le bouton d'ajout qui a été cliqué sinon on s'arrête
    const button = event.target.closest('.btnAddUser')
    if (!button) return;

    // Création de la variable avec le nom de l'utilisateur qui est dans le champ
    const nom = document.getElementById('inputNewUtilisateur').value
    // Effacement de la valeur dans le champ input
    document.getElementById('inputNewUtilisateur').value = ""
    // Si le nom n'est pas vide on lance la création de l'utilisateur et la mise à jour de la liste
    if (!(nom === "")){
        ajouterUtilisateur(nom)
        majListeUtilisateur()
    }
})

// Evenement d'un clique dans le div de la liste des utilisateurs
document.querySelector('.listeUtilisateurs').addEventListener('click', (event)=>{
    // on vérifie que c'est bien le bouton de suppression qui a été cliqué sinon on s'arrête
    const button = event.target.closest('.suppUser')
    if (!button) return;

    // récupération de l'id de l'utilisateur
    const idUser = button.closest('tr').dataset.idutilisateur

    // On empêche la suppression d'un utilisateur qui possède encore des comptes
    const nb = nbComptesUtilisateur(idUser)
    if (nb > 0){
        alert(`Impossible de supprimer cet utilisateur : il possède ${nb} compte(s).`)
        return
    }

    // On empêche aussi la suppression d'un utilisateur qui a des dépenses à sa charge
    const nbDep = nbDepensesCharge(idUser)
    if (nbDep > 0){
        alert(`Impossible de supprimer cet utilisateur : ${nbDep} dépense(s) sont à sa charge.`)
        return
    }

    if (suppressionUtilisateur(idUser)){
            majListeUtilisateur()
    }

})
// Fonction de mise à jour de la liste des utilisateurs
function majListeUtilisateur(){
    // test qu'il y a bien une propriété user dans data sinon pas de mise à jour nécessaire
    if ('user' in data) {
        // Positionnement dans le div dans lequel la liste doit être affichée
        const zone=document.querySelector('div.listeUtilisateurs')
        
        // On vide la zone
        zone.innerHTML=''

        // Création du tableau qui contiendra une ligne par utilisateur
        const tabUser = document.createElement('table')
        // Boucle sur chacune des entrées de la propriété User
        data.user.forEach(utilisateur => {
            // Si l'ID n'est pas nul on affiche, sinon on ne fait rien
            if (!(utilisateur.id === "")){
                // Création d'une ligne
                const trUser = document.createElement('tr') 
                // Association d'une propriété au TR avec l'id de l'utilisateur
                trUser.dataset.idutilisateur=utilisateur.id
                // Création du contenu avec le nom, puis un bouton pour supprimer l'utilisateur
                trUser.innerHTML=`
                    <td class="ligneUtilisateur">
                        ${echapperHTML(utilisateur.nom)}
                    </td>
                    <td>
                        <button class="btnSupp suppUser" aria-label="Supprimer l'utilisateur"><i data-lucide="circle-x"></i></button>
                    </td>
                    `
                // Ajout de la ligne dans la table
                tabUser.appendChild(trUser)
            }
        });
        // Ajout du tableau dans le div
        zone.appendChild(tabUser)
    }
    // Les propriétaires possibles des comptes dépendent des utilisateurs
    majListeComptes()
    // Ainsi que les charges proposées dans les dépenses
    rafraichirCategoriesOuvertes()
    // Génération des boutons
    lucide.createIcons()
}