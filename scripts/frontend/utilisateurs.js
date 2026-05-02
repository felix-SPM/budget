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

    suppressionUtilisateur(idUser)
    majListeUtilisateur()
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
                        ${utilisateur.nom}
                    </td>
                    <td>
                        <button class="suppUser"><i data-lucide="circle-x"></i></button>
                    </td>
                    `
                // Ajout de la ligne dans la table
                tabUser.appendChild(trUser)
            }
        });
        // Ajout du tableau dans le div
        zone.appendChild(tabUser)
    }
    // Génération des boutons
    lucide.createIcons()
}