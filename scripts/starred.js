/*
Вывод отмеченных вычислений. Всё также как в истории, только сортировка по отмеченности
*/

const calcs = getOrCreateCalculations().reverse()

if (calcs.length == 0){
    root.innerHTML = `<div class="starter-template text-white text-center m-3">
                <h1>Вычислений пока нет</h1>
            </div>`
}
else{
    starredDiv.innerHTML = ''
    let starredCalcs = getAllValsByBoolParam(calcs, 'starred')
    for (calc of starredCalcs.slice(0, 10)){
        if (calc.starred){
            starredDiv.innerHTML += `<div class="p-2 bd-highlight"><a class="text-white" style="text-decoration: none;" href="calculation.html?calc=${calc.name}"> <h4> ${calc.name} </h4> </a></div>`
        }
    }

    loadMore.onclick = function(){
        let starredCalcs = getAllValsByBoolParam(calcs, 'starred')
        for (calc of starredCalcs.slice(starredDiv.children.length, starredDiv.children.length + 10)){
            starredDiv.innerHTML += `<div class="p-2 bd-highlight"><a class="text-white" style="text-decoration: none;" href="calculation.html?calc=${calc.name}"> <h4> ${calc.name} </h4> </a></div>`
        }
        if (starredCalcs.length == starredDiv.children.length){
            loadMore.parentElement.remove()
        }
    }

    if (starredCalcs.length == starredDiv.children.length){
        loadMore.parentElement.remove()
    }
}

function getAllValsByBoolParam(array, param){
    let newArray = []
    for (item of array){
        if (item[param]){
            newArray.push(item)
        }
    }
    return newArray
}
