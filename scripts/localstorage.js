/*
Работа с хранилещем localstorage
*/

function getOrCreateCalculations(){
    let calcs = JSON.parse(localStorage.getItem('calculations'))
    if (calcs == null){
        calcs = []
        localStorage.setItem('calculations', JSON.stringify(calcs))
    }
    return calcs
}

function findIndexByName(name){
    let calcs = getOrCreateCalculations()
    let index = -1
    for (let i = 0; i < calcs.length; i++){
        if (calcs[i].name.toLowerCase() == name.toLowerCase()){
            index = i
            break
        }
    }
    return index
}

