const salaireSophie = document.getElementById("salaireSophie")
const salaireFelix = document.getElementById("salaireFelix")
const prorata = document.getElementById("prorata")
let partFelix = 0
let partSophie = 0

salaireSophie.addEventListener("change", (event) => {
    calculProrata()
})

salaireFelix.addEventListener("change", (event) => {
    calculProrata()
})

function calculProrata () {

    let salaireFelixLOC = Number(salaireFelix.value)
    let salaireSophieLOC = Number(salaireSophie.value)
    // la fonction Number converti la chaine de caractère en nombre et remplace "" par 0
    
    if ((salaireFelixLOC !== 0) && (salaireSophieLOC !== 0)){
        // Pour arrondir à deux décimales, il faut faire math.round(nombre*100)/100
        partFelix = arrondi2decimales((salaireFelixLOC/(salaireSophieLOC + salaireFelixLOC))*100)
        partSophie = arrondi2decimales(100 - partFelix)

        let divProrata = `
            Part Félix : ${partFelix} %<br />
            Part Sophie : ${partSophie} %<br />
            `
        prorata.innerHTML = divProrata
    }
}

function arrondi2decimales (nombre){
    return(Math.round(nombre*100)/100)
}