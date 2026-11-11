const inputNewUtilisateur = document.getElementById('inputNewUtilisateur')

// Ajout d'un utilisateur depuis le champ de saisie
function ajoutUtilisateurDepuisSaisie(){
    const resultat = ajouterUtilisateur(inputNewUtilisateur.value)
    if (resultat !== true){
        alert(resultat)
        return
    }
    inputNewUtilisateur.value = ''
    majListeUtilisateur()
}

// Evenement d'un clique dans un div ajoututilisateurs
document.querySelector('.ajoutUtilisateurs').addEventListener('click', (event)=>{
    // on vérifie que c'est bien le bouton d'ajout qui a été cliqué sinon on s'arrête
    if (!event.target.closest('.btnAddUser')) return;
    ajoutUtilisateurDepuisSaisie()
})

// Touche Entrée dans le champ d'ajout
inputNewUtilisateur.addEventListener('keydown', (event)=>{
    if (event.key === 'Enter') ajoutUtilisateurDepuisSaisie()
})

// Evenement d'un clique dans le div de la liste des utilisateurs
document.querySelector('.listeUtilisateurs').addEventListener('click', (event)=>{
    const button = event.target.closest('.suppUser, .modifUser, .validModifUser, .annulModifUser')
    if (!button) return;

    // récupération de l'id de l'utilisateur
    const ligne = button.closest('tr')
    const idUser = ligne.dataset.idutilisateur

    if (button.classList.contains('suppUser')) supprimerUtilisateurDepuisListe(idUser)

    if (button.classList.contains('modifUser')){
        // On réaffiche la liste pour annuler une éventuelle autre modification en cours
        majListeUtilisateur()
        passerUtilisateurEnModification(idUser)
    }

    if (button.classList.contains('validModifUser')) validerModificationUtilisateur(ligne)

    if (button.classList.contains('annulModifUser')) majListeUtilisateur()
})

// Clavier dans la ligne en modification : Entrée pour valider, Échap pour annuler
document.querySelector('.listeUtilisateurs').addEventListener('keydown', (event)=>{
    const ligne = event.target.closest('tr.edition')
    if (!ligne) return
    if (event.key === 'Enter') validerModificationUtilisateur(ligne)
    if (event.key === 'Escape') majListeUtilisateur()
})

function supprimerUtilisateurDepuisListe(idUser){
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
}

// Remplace le nom de l'utilisateur par un champ pré-rempli
function passerUtilisateurEnModification(idUser){
    const user = utilisateursValides().find(u => u.id === Number(idUser))
    const ligne = document.querySelector(`.listeUtilisateurs tr[data-idutilisateur="${idUser}"]`)
    if (!user || !ligne) return

    ligne.classList.add('edition')
    ligne.innerHTML = `
        <td class="ligneUtilisateur">
            <input class="inputModifUser" type="text" value="${echapperHTML(user.nom)}" aria-label="Nouveau nom">
        </td>
        <td>
            <button class="btnSupp validModifUser" aria-label="Valider la modification"><i data-lucide="circle-check"></i></button>
            <button class="btnSupp annulModifUser" aria-label="Annuler la modification"><i data-lucide="undo-2"></i></button>
        </td>
    `
    lucide.createIcons()
    const input = ligne.querySelector('input')
    input.focus()
    input.select()
}

function validerModificationUtilisateur(ligne){
    const resultat = modifierUtilisateur(ligne.dataset.idutilisateur, ligne.querySelector('input').value)
    if (resultat !== true){
        alert(resultat)
        return
    }
    // Met à jour la liste, les comptes (propriétaires) et les dépenses ouvertes
    majListeUtilisateur()
}

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
                // Création du contenu avec le nom, puis les boutons modifier et supprimer
                trUser.innerHTML=`
                    <td class="ligneUtilisateur">
                        ${echapperHTML(utilisateur.nom)}
                    </td>
                    <td>
                        <button class="btnSupp modifUser" aria-label="Modifier l'utilisateur"><i data-lucide="pencil"></i></button>
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
