let entreesAssurance = [
    {
        id : 1,
        libelle : "Chevrolet",
        montant : 41.81,
        payeDepuis : "J.C",
        charge : "J"
    }
]

function afficherEntrees(tabEntrees, idZone){
    
    const zone = document.getElementById(idZone)
    zone.innerHTML = ''

    tabEntrees.forEach(entrees => {
        const ligne = document.createElement('tr')
        ligne.innerHTML = `
            <td>${entrees.libelle}</td>
            <td>${entrees.montant.toFixed(2)} €</td>
            <td>${rechLibelle(data.listeCharge, entrees.charge)
                
            }</td>
            <td>${rechLibelle(data.listeComptes, entrees.payeDepuis)}</td>
        `
        zone.appendChild(ligne)
    })
}

function afficherNelleEntree(idZone, nomZone){
    const zone = document.getElementById(idZone)
    const ligne = document.createElement('tr')

    ligne.innerHTML = `
        <td><input type="text" id="libelle${nomZone}" name="libelle${nomZone}" /></td>
        <td><input type="number" id="montantAssurance" name="montantAssurance" /></td>
        <td>
            <select name="choixCharge">
                <option value="J">Joint</option>
                <option value="S">Sophie</option>
                <option value="F">Félix</option>
            </select>
        </td>
        <td>
            <select name="choixCharge">
                <option value="J">Joint</option>
                <option value="S">Sophie</option>
                <option value="F">Félix</option>
            </select>
        </td>
    `
    zone.appendChild(ligne)
}

afficherEntrees(entreesAssurance, "tabEntreesAssurances")
afficherNelleEntree("tabEntreesAssurances", "Assurance")

function rechLibelle(liste, valeur){
    const objetTrouve = liste.find(obj => obj["symbole"] === valeur);
  return objetTrouve ? objetTrouve["libelle"] : null;
}
