const zoneRepartition = document.querySelector('.zoneRepartition')

// Affichage initial (avant tout fichier chargé)
document.addEventListener('DOMContentLoaded', majRepartition)

// Intitulé "propriétaire - compte" à partir de l'id d'un compte (défini dans comptes.js)
const nomCompte = idCompte => echapperHTML(intituleCompteParId(idCompte))

// Libellé seul d'un compte (sans le propriétaire)
const libelleCompte = idCompte => echapperHTML(data.listeComptes.find(c => c.id === idCompte).libelle)

// Tableau d'une liste de virements { idDe, idVers, montant }
// origineSansProprietaire : n'affiche que le libellé du compte d'origine
// (utile quand le titre de la section indique déjà à qui il appartient)
function tableauVirements(virements, origineSansProprietaire = false){
    if (virements.length === 0) return '<p class="messageVide">Aucun virement à faire.</p>'
    return `
        <table class="tableVirements">
            ${virements.map(v => `
                <tr>
                    <td>${origineSansProprietaire ? libelleCompte(v.idDe) : nomCompte(v.idDe)}</td>
                    <td class="flecheVirement"><i data-lucide="arrow-right"></i></td>
                    <td>${nomCompte(v.idVers)}</td>
                    <td class="montant">${formatMontant(v.montant)}</td>
                </tr>`).join('')}
        </table>`
}

// Ligne "libellé : montant" (classe "negatif" si le montant est négatif)
function ligneMontant(libelle, montant, classe = ''){
    const negatif = montant < -0.005 ? ' negatif' : ''
    return `<tr class="${classe}"><td>${libelle}</td><td class="montant${negatif}">${formatMontant(montant)}</td></tr>`
}

// Recalcule et affiche toute la section Répartition
function majRepartition(){
    const r = calculRepartition()

    // Calcul impossible : on indique ce qu'il manque
    if (r.erreurs.length > 0){
        zoneRepartition.innerHTML = `
            <ul class="erreursRepartition">
                ${r.erreurs.map(e => `<li>${echapperHTML(e)}</li>`).join('')}
            </ul>`
        return
    }

    const joint = r.joint
    // Le compte principal joint doit garder exactement ce qu'il paie lui-même
    const jointOK = Math.abs(joint.resteSurPrincipal - joint.payeParPrincipal) < 0.01

    zoneRepartition.innerHTML = `
        <h3>Synthèse du mois</h3>
        <table class="tableSynthese">
            ${ligneMontant('Revenus du foyer', r.revenusTotaux)}
            ${ligneMontant('Dépenses totales', r.depensesTotales)}
            ${ligneMontant('Solde', r.revenusTotaux - r.depensesTotales, 'total')}
        </table>

        <h3>Virements depuis ${nomCompte(joint.idPrincipal)}</h3>
        <p class="explication">Tous les revenus arrivent sur ce compte.</p>
        ${tableauVirements(joint.virements)}
        <table class="tableSynthese">
            ${ligneMontant('Reste sur le compte', joint.resteSurPrincipal)}
            ${ligneMontant('Dépenses payées par ce compte', joint.payeParPrincipal)}
        </table>
        ${jointOK ? '' : '<p class="alerteRepartition">Le compte joint ne garde pas exactement ce qu\'il doit payer : vérifiez les données.</p>'}

        ${r.detailUtilisateurs.map(u => `
            <h3>Virements depuis ${nomCompte(u.idPrincipal)}</h3>
            <p class="explication">Ce compte reçoit ${formatMontant(u.virementRecu)} du compte joint.</p>
            ${tableauVirements(u.virements, true)}
            <table class="tableSynthese">
                ${ligneMontant('Reste sur le compte', u.resteSurPrincipal)}
                ${ligneMontant('Dépenses payées par ce compte', u.payeParPrincipal)}
                ${ligneMontant(`Excédent de ${echapperHTML(u.nom)}`, u.excedent, 'total')}
            </table>
            ${u.excedent < -0.005 ? `<p class="alerteRepartition">${echapperHTML(u.nom)} n'a pas assez pour couvrir ses dépenses.</p>` : ''}
        `).join('')}

        <h3>Détail du calcul</h3>
        <div class="defilementHorizontal">
            <table class="tableDetail">
                <tr>
                    <th></th>
                    ${r.detailUtilisateurs.map(u => `<th>${echapperHTML(u.nom)}</th>`).join('')}
                </tr>
                <tr><td>Revenu</td>${r.detailUtilisateurs.map(u => `<td class="montant">${formatMontant(u.revenu)}</td>`).join('')}</tr>
                <tr><td>Prorata</td>${r.detailUtilisateurs.map(u => `<td class="montant">${u.part.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %</td>`).join('')}</tr>
                <tr><td>Dépenses à sa charge</td>${r.detailUtilisateurs.map(u => `<td class="montant">${formatMontant(u.chargesPerso)}</td>`).join('')}</tr>
                <tr><td>Part des dépenses communes</td>${r.detailUtilisateurs.map(u => `<td class="montant">${formatMontant(u.partCommunes)}</td>`).join('')}</tr>
                <tr><td>Payé par ses comptes</td>${r.detailUtilisateurs.map(u => `<td class="montant">${formatMontant(u.paye)}</td>`).join('')}</tr>
                <tr class="total"><td>Virement reçu du joint</td>${r.detailUtilisateurs.map(u => `<td class="montant">${formatMontant(u.virementRecu)}</td>`).join('')}</tr>
            </table>
        </div>
        <p class="explication">
            Virement reçu = revenu + payé par ses comptes − dépenses à sa charge − part des dépenses communes.
            Dépenses communes à répartir : ${formatMontant(r.communesARepartir)}
            (dépenses à charge de Joint, moins les revenus joints).
        </p>
    `
    lucide.createIcons()
}
