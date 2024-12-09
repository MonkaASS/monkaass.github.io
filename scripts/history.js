/*

Ведение истории вычислений с поддержкой подгрузки элементов

*/

const calcs = getOrCreateCalculations().reverse()

if (calcs.length == 0){
    root.innerHTML = `<div class="starter-template text-white text-center m-3">
                <h1>Вычислений пока нет</h1>
            </div>`
}
else{
    historyDiv.innerHTML = ''
    for (calc of calcs.slice(0, 10)){
        historyDiv.innerHTML += `<div class="p-2 bd-highlight"><a class="text-white" style="text-decoration: none;" href="calculation.html?calc=${calc.name}"> <h4> ${calc.name} </h4> </a></div>`
    }

    loadMore.onclick = function(){
        for (calc of calcs.slice(historyDiv.children.length, historyDiv.children.length + 10)){
            historyDiv.innerHTML += `<div class="p-2 bd-highlight"><a class="text-white" style="text-decoration: none;" href="calculation.html?calc=${calc.name}"> <h4> ${calc.name} </h4> </a></div>`
        }
        if (calcs.length == historyDiv.children.length){
            loadMore.parentElement.remove()
        }
    }

    if (calcs.length == historyDiv.children.length){
        loadMore.parentElement.remove()
    }
}


