// Répartition : liste des virements à faire chaque mois pour que chaque compte
// puisse payer les dépenses qui lui sont affectées.
//
// Principe (identique au fichier Excel "Budget", feuille Résumé) :
// 1. Tous les revenus arrivent sur le compte principal Joint.
// 2. Les dépenses à charge de "Joint" (diminuées des revenus joints) sont réparties
//    entre les utilisateurs au prorata de leurs revenus.
// 3. Chaque utilisateur u reçoit sur son compte principal :
//       son revenu
//     + ce que ses comptes paient (pour lui ou pour les autres)
//     - ce qui est à sa charge (ses dépenses personnelles + sa part des dépenses communes)
// 4. Le compte principal Joint vire aussi aux autres comptes joints ce qu'ils paient ;
//    il lui reste exactement ce qu'il paie lui-même.
// 5. Chaque compte principal d'utilisateur vire à ses autres comptes ce qu'ils paient ;
//    ce qui lui reste, moins ce qu'il paie lui-même, est l'excédent de l'utilisateur.

// Somme des montants d'une liste de dépenses
function sommeMontants(depenses){
    return depenses.reduce((total, d) => total + d.montant, 0)
}

// Total payé par un compte (toutes catégories)
function totalPayeParCompte(idCompte){
    return sommeMontants(toutesLesDepenses().filter(d => d.idComptePayeDepuis === idCompte))
}

// Total des dépenses à la charge d'un propriétaire (utilisateur ou Joint)
function totalACharge(idProprietaire){
    return sommeMontants(toutesLesDepenses().filter(d => d.idCharge === idProprietaire))
}

// Total payé par l'ensemble des comptes d'un propriétaire
function totalPayeParProprietaire(idProprietaire){
    return data.listeComptes
        .filter(c => c.idProprietaire === idProprietaire)
        .reduce((total, c) => total + totalPayeParCompte(c.id), 0)
}

// Virements du compte principal d'un propriétaire vers ses autres comptes (montant = ce qu'ils paient)
function virementsVersAutresComptes(principal){
    return data.listeComptes
        .filter(c => c.idProprietaire === principal.idProprietaire && c.id !== principal.id)
        .map(c => ({ idDe: principal.id, idVers: c.id, montant: totalPayeParCompte(c.id) }))
        .filter(v => Math.abs(v.montant) >= 0.005)
}

// Calcule la répartition.
// Renvoie { erreurs: [...] } si le calcul est impossible, sinon le détail complet.
function calculRepartition(){
    const erreurs = []
    const users = utilisateursValides()

    if (users.length < 2){
        return { erreurs: ['La répartition nécessite au moins deux utilisateurs.'] }
    }
    const prorata = calculProrata()
    if (prorata === null) erreurs.push('Saisissez le revenu de chaque utilisateur (section Revenus).')

    const principalJoint = comptePrincipal(ID_JOINT)
    if (!principalJoint) erreurs.push('Créez un compte Joint : son compte principal reçoit tous les revenus.')
    users.forEach(u => {
        if (!comptePrincipal(u.id)) erreurs.push(`Créez un compte pour ${u.nom} : il recevra sa part depuis le compte joint.`)
    })
    if (erreurs.length > 0) return { erreurs: erreurs }

    // Dépenses communes à répartir : à charge de Joint, moins les revenus joints
    const revenuJoint = montantRevenu(ID_JOINT) || 0
    const communesARepartir = totalACharge(ID_JOINT) - revenuJoint

    // Détail par utilisateur
    const detailUtilisateurs = users.map(u => {
        const revenu = montantRevenu(u.id)
        const part = prorata.find(p => p.id === u.id).part / 100
        const chargesPerso = totalACharge(u.id)
        const partCommunes = communesARepartir * part
        const paye = totalPayeParProprietaire(u.id)
        const principal = comptePrincipal(u.id)
        const virementRecu = revenu + paye - chargesPerso - partCommunes
        const virements = virementsVersAutresComptes(principal)
        const resteSurPrincipal = virementRecu - virements.reduce((t, v) => t + v.montant, 0)
        const payeParPrincipal = totalPayeParCompte(principal.id)
        return {
            id: u.id, nom: u.nom, part: part * 100,
            revenu, chargesPerso, partCommunes, paye, virementRecu,
            idPrincipal: principal.id, virements, resteSurPrincipal, payeParPrincipal,
            excedent: resteSurPrincipal - payeParPrincipal
        }
    })

    // Virements depuis le compte principal Joint : vers chaque utilisateur, puis vers les autres comptes joints
    // (un montant négatif pour un utilisateur signifie que c'est à lui de virer vers le compte joint)
    const virementsJoint = [
        ...detailUtilisateurs.map(u => u.virementRecu >= 0
            ? { idDe: principalJoint.id, idVers: u.idPrincipal, montant: u.virementRecu }
            : { idDe: u.idPrincipal, idVers: principalJoint.id, montant: -u.virementRecu }),
        ...virementsVersAutresComptes(principalJoint)
    ].filter(v => v.montant >= 0.005)

    const revenusTotaux = data.revenus.reduce((t, r) => t + r.montant, 0)
    const sortiesJoint = virementsJoint.reduce((t, v) =>
        t + (v.idDe === principalJoint.id ? v.montant : -v.montant), 0)

    return {
        erreurs: [],
        revenusTotaux,
        depensesTotales: sommeMontants(toutesLesDepenses()),
        communesARepartir,
        detailUtilisateurs,
        joint: {
            idPrincipal: principalJoint.id,
            virements: virementsJoint,
            resteSurPrincipal: revenusTotaux - sortiesJoint,
            payeParPrincipal: totalPayeParCompte(principalJoint.id)
        }
    }
}
