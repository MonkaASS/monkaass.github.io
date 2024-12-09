/*
Вся работа препроцессора
*/

// // Пример данных
// const data = [
//     // Узлы
//     [0, 2.5, 6, 10.7],
//     // Стержни
//     [
//         {I: 0, J: 1, Ig: 1},
//         {I: 1, J: 2, Ig: 2},
//         {I: 2, J: 3, Ig: 1}
//     ],
//     // Классы стержней
//     [
//         {A: 1, E: 1, sigma: 5},
//         {A: 3, E: 1, sigma: 5}
//     ],
//      // Опоры
//     [True, True],
//     // Сосредоточенные силы
//     [{I: 2, F: 5}, {I: 2, F: -5}],
//     // Распределенные нагрузки
//     [{I: 1, q: 2}, {I: 2, q: -3}, {I: 3, q: -8}]
// ];

const canvas = mainCanvas
canvas.width = mainCanvas.offsetWidth;
canvas.height = mainCanvas.offsetHeight * 2;

function reDraw() {
    data = makeDataFromCreator()

    validation = validateData(data)
    if (validation.valid){
        drawScheme(canvas, data, cWidth.value / 2, cHeight.value * 0.01, showFCheck.checked, showQCheck.checked)
    }
    else{
        printErrors(canvas, validation.errors)
    }
}


function makeDataFromCreator(){
    nodes = []
    
    bars = []
    let sum = 0;
    let nodeIndex = 1
    for (let i = 0; i < document.getElementsByName("barNodeDiv1").length; i++){
        bars.push({
            I: nodeIndex,
            J: nodeIndex + 1,
            Ig: parseInt(document.getElementsByName("barNodeDiv2")[i].value)
        })
        nodes.push(sum)
        nodeIndex++
        sum += parseInt(document.getElementsByName("barNodeDiv1")[i].value)
    }
    if (bars.length != 0)
        nodes.push(sum)

    for (let el of document.getElementsByName("nodeCoordDiv")){
        nodes.push(parseInt(el.value))
    }
    
    barClasses = []
    for (let i = 0; i < document.getElementsByName("barClassDiv1").length; i++){
        barClasses.push({
            A: Number(document.getElementsByName("barClassDiv1")[i].value),
            E: Number(document.getElementsByName("barClassDiv2")[i].value),
            sigma: Number(document.getElementsByName("barClassDiv3")[i].value)
        })
    }
    
    supports = []
    supports.push(leftSupport.checked)
    supports.push(rightSupport.checked)
    
    Fs = []
    for (let i = 0; i < document.getElementsByName("FNodeNumber").length; i++){
        Fs.push({
            I: parseInt(document.getElementsByName("FNodeNumber")[i].value),
            F: Number(document.getElementsByName("FValue")[i].value),
        })
    }
    
    Qs = []
    for (let i = 0; i < document.getElementsByName("QBarNumber").length; i++){
        Qs.push({
            I: parseInt(document.getElementsByName("QBarNumber")[i].value),
            q: Number(document.getElementsByName("QValue")[i].value),
        })
    }
    
    let newData = []
    newData.push(nodes)
    newData.push(bars)
    newData.push(barClasses)
    newData.push(supports)
    newData.push(Fs)
    newData.push(Qs)
    return newData;
}

function saveDictToFile(dictionary, fileName) {
  const jsonString = JSON.stringify(dictionary);

  const blob = new Blob([jsonString], { type: 'application/json' });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'data.json';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

const barsSpawnTag = `<span class="input-group-text text-white bg-transparent border-0"> {0} </span>
                        <input name="barNodeDiv1" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="Длина стержня">
                        <input name="barNodeDiv2" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="Класс стержня">`
setBarsBtn.onclick = () => {
    makeNElements(barsCountInput, barsDiv, barsSpawnTag)
}
barsCountInput.onkeydown = (e) => {
    if (e.keyCode == 13){
        makeNElements(barsCountInput, barsDiv, barsSpawnTag)
    }
}

const barsClassesSpawnTag = `<span class="input-group-text text-white bg-transparent border-0"> {0} </span>
                        <input name="barClassDiv1" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="A">
                        <input name="barClassDiv2" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="E">
                        <input name="barClassDiv3" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="σ">`
setBarsClassesBtn.onclick = () => {
    makeNElements(barsClassesCountInput, barsClassesDiv, barsClassesSpawnTag)
}
barsClassesCountInput.onkeydown = (e) => {
    if (e.keyCode == 13){
        makeNElements(barsClassesCountInput, barsClassesDiv, barsClassesSpawnTag)
    }
}

const FsSpawnTag = `<span class="input-group-text text-white bg-transparent border-0"> {0} </span>
                        <input name="FNodeNumber" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="Номер узла">
                        <input name="FValue" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="Fx">`
setFsBtn.onclick = () => {
    makeNElements(FsCountInput, FsDiv, FsSpawnTag)
}
FsCountInput.onkeydown = (e) => {
    if (e.keyCode == 13){
        makeNElements(FsCountInput, FsDiv, FsSpawnTag)
    }
}

const QsSpawnTag = `<span class="input-group-text text-white bg-transparent border-0"> {0} </span>
                        <input name="QBarNumber" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="Номер стержня">
                        <input name="QValue" oninput="saveInputsData()" type="number" class="form-control ms-2 bg-dark text-white border-0" placeholder="qx">`
setQsBtn.onclick = () => {
    makeNElements(QsCountInput, QsDiv, QsSpawnTag)
}
QsCountInput.onkeydown = (e) => {
    if (e.keyCode == 13){
        makeNElements(QsCountInput, QsDiv, QsSpawnTag)
    }
}

saveAsFile.onclick = () => {
    data = makeDataFromCreator()
    validation = validateData(data)
    if (validation.valid){
        saveDictToFile(data, "data");
    }
    else{
        if (confirm("Некорректно введены данные! Вы точно хотите сохранить их в файл?")) {
            saveDictToFile(data, "data");
        }
    }
}

function makeNElements(nInput, spawnDiv, spawnTag){
    let val = nInput.value;
    if (val < 0){
        alert('Значение не может быть отрицательным')
        return
    }
    let currentNodeDivs = spawnDiv.children;
    while (val < currentNodeDivs.length){
        spawnDiv.removeChild(spawnDiv.lastElementChild);
    }
    while (val > currentNodeDivs.length){
        let div = document.createElement('div');
        div.classList.add("input-group");
        div.classList.add("mb-3");
        div.innerHTML =  spawnTag.format((currentNodeDivs.length + 1).toString());
        spawnDiv.appendChild(div);
    }
}


uploadFile.addEventListener('change', (event) => {
    const file = uploadFile.files[0]
    readFromFile(file);
});


function readFromFile(file){
    let reader = new FileReader()
    reader.readAsText(file)
    
    reader.onload = function() {
        loadedData = JSON.parse(reader.result);

        let validation = validateData(loadedData)

        if (validation.valid){
            fillInputsWithData(loadedData)
            saveInputsData()
        }
        else{
            alert('Файл содержит неправильный формат или поврежден')
            uploadFile.value = ''
        }
    };
}

function fillInputsWithData(data){
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;

    barsCountInput.value = bars.length > 0 ? bars.length : '';
    setBarsBtn.click()

    barsClassesCountInput.value = barClasses.length > 0 ? barClasses.length : '';
    setBarsClassesBtn.click()

    leftSupport.checked = supports[0]
    rightSupport.checked = supports[1]

    FsCountInput.value = concentratedForces.length > 0 ? concentratedForces.length : '';
    setFsBtn.click()

    QsCountInput.value = distributedLoads.length > 0 ? distributedLoads.length : '';
    setQsBtn.click()
    
    barNode1Divs = document.getElementsByName("barNodeDiv1")
    barNode2Divs = document.getElementsByName("barNodeDiv2")
    for (let i = 0; i < bars.length; i++){
        barNode1Divs[i].value = nodes[bars[i].J - 1] - nodes[bars[i].I - 1]
        barNode2Divs[i].value = bars[i].Ig
    }
    
    barClassDiv1 = document.getElementsByName("barClassDiv1")
    barClassDiv2 = document.getElementsByName("barClassDiv2")
    barClassDiv3 = document.getElementsByName("barClassDiv3")
    for (let i = 0; i < barClasses.length; i++){
        if (barClasses[i].A >= 10 || barClasses[i].A < 1)
            barClassDiv1[i].value = barClasses[i].A.toExponential()
        else
            barClassDiv1[i].value = barClasses[i].A

        if (barClasses[i].E >= 10 || barClasses[i].E < 1)
            barClassDiv2[i].value = barClasses[i].E.toExponential()
        else
            barClassDiv2[i].value = barClasses[i].E

        barClassDiv3[i].value = barClasses[i].sigma.toExponential()
    }
    
    FDivs1 = document.getElementsByName("FNodeNumber")
    FDivs2 = document.getElementsByName("FValue")
    for (let i = 0; i < concentratedForces.length; i++){
        FDivs1[i].value = concentratedForces[i].I
        FDivs2[i].value = concentratedForces[i].F.toExponential()
    }
    
    qDivs1 = document.getElementsByName("QBarNumber")
    qDivs2 = document.getElementsByName("QValue")
    for (let i = 0; i < distributedLoads.length; i++){
        qDivs1[i].value = distributedLoads[i].I
        qDivs2[i].value = distributedLoads[i].q.toExponential()
    }

    reDraw()
}


drawSchemeBtn.onclick = () => {
    reDraw()
}

processBtn.onclick = () => {
    data = makeDataFromCreator();

    let validation = validateData(data)

    if (validation.valid){
        if (calcNameText.value != ''){
            let index = findIndexByName(calcNameText.value)
            if (index == -1){
                let n = processAndSaveToLocalStorage(calcNameText.value, data, index)
                window.location.href = `pages/calculation.html?calc=${n}`;
            }
            else{
                if (confirm("Рассчет с таким названием уже существует. Хотите перезаписать его?")){
                    let n = processAndSaveToLocalStorage(calcNameText.value, data, index)
                    window.location.href = `pages/calculation.html?calc=${n}`;
                }
            }
        }
        else{
            alert('Название не может быть пустым')
        }
    }
    else{
        alert("Данные некорректны. Расчет произвести невозможно.")
    }
}

function processAndSaveToLocalStorage(name, data, insertIndex){
    let _deltas = calculateDeltas(data).toArray()
    let dataToSave = {
        name: name,
        starred: false,
        data: {
            deltas: _deltas,
            scheme: data
        }
    }
    let calcs = getOrCreateCalculations()
    if (insertIndex == -1){
        calcs.push(dataToSave)
    }
    else{
        calcs[insertIndex] = dataToSave

    }

    localStorage.setItem('calculations', JSON.stringify(calcs))
    return name
}

clearAll.onclick = () => {
    if (confirm('Вы точно хотите очистить всё?')){
        ClearAll()
    }
}

function ClearAll(){
    barsCountInput.value = '';
    setBarsBtn.click()

    barsClassesCountInput.value = '';
    setBarsClassesBtn.click()

    leftSupport.checked = false
    rightSupport.checked = false

    FsCountInput.value = '';
    setFsBtn.click()

    QsCountInput.value = '';
    setQsBtn.click()

    reDraw()
    saveInputsData()
}

function saveInputsData(){
    data = makeDataFromCreator()
    reDraw()
    localStorage.setItem('preprocessInputs', JSON.stringify(data))
}

function loadInputsDataOnStart(){
    data = JSON.parse(localStorage.getItem('preprocessInputs'))

    fillInputsWithData(data)
}
loadInputsDataOnStart()

function validateData(data){
    let valid = true
    errorMessages = []
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;
    
    if (nodes.length == 0){
        valid = false
        errorMessages.push("Не существует ни одного стержня")
    }

    for (node of nodes){
        if (isNaN(node)){
            valid = false
            errorMessages.push("Не указаны длины всех стержней")
            break
        }
    }
    for (node of nodes){
        if (node < 0){
            valid = false
            errorMessages.push("Длина стержня не может быть отрицательной")
            break
        }
    }

    if (hasDuplicates(nodes)){
        valid = false
        errorMessages.push("Длина стержня не может быть нулевой")
    }


    for (bar of bars){
        if (isNaN(bar.Ig)){
            valid = false
            errorMessages.push("Класс стержня не указан")
            break
        }
    }

    for (bar of bars){
        if (bar.Ig <= 0 || bar.Ig > barClasses.length){
            valid = false
            errorMessages.push("Класс стержня указан не верно")
            break
        }
    }

    if (barClasses.length == 0){
        valid = false
        errorMessages.push("Не существует ни одного класса стержня")
    }

    for (barClass of barClasses){
        if (barClass.A <= 0){
            valid = false
            errorMessages.push("Неправильно описан класс стержня: A должно быть положительным")
            break
        }
    }

    for (barClass of barClasses){
        if (barClass.E <= 0){
            valid = false
            errorMessages.push("Неправильно описан класс стержня: E должно быть положительным")
            break
        }
    }

    for (barClass of barClasses){
        if (barClass.sigma <= 0){
            valid = false
            errorMessages.push("Неправильно описан класс стержня: σ должно быть положительным")
            break
        }
    }

    if (!supports[0] && !supports[1]){
        valid = false
        errorMessages.push("Конструкция не закреплена")
    }
    
    for (f of concentratedForces){
        if (f.I <= 0 || f.I > nodes.length){
            valid = false
            errorMessages.push("Сосредоточенная нагрузка: такого узла не существует")
            break
        }
    }

    for (f of concentratedForces){
        if (f.F == 0){
            valid = false
            errorMessages.push("Сосредоточенная нагрузка: нулевая нагрузка бессмысленна")
            break
        }
    }

    if (hasDuplicatesListOfDicts(concentratedForces, 'I')){
        valid = false
        errorMessages.push("Сосредоточенная нагрузка: 2 нагрузки не могут выходить из одного и того же узла")
    }

    for (q of distributedLoads){
        if (q.I <= 0 || q.I > bars.length){
            valid = false
            errorMessages.push("Распределенная нагрузка: такого стержня не существует")
            break
        }
    }

    for (q of distributedLoads){
        if (q.q == 0){
            valid = false
            errorMessages.push("Распределенная нагрузка: нулевая нагрузка бессмысленна")
            break
        }
    }

    if (hasDuplicatesListOfDicts(distributedLoads, 'I')){
        valid = false
        errorMessages.push("Распределенная нагрузка: 2 нагрузки не могут находится в одном и том же стержне")
    }

    return {valid: valid, errors: errorMessages}
}

function hasDuplicatesListOfDicts(arr, key){
    let arrByKey = []
    for (item of arr){
        arrByKey.push(item[key])
    }
    return hasDuplicates(arrByKey)
}

function hasDuplicates(arr){
    return arr.filter((item, index) => arr.indexOf(item) !== index).length != 0
}

loadCanvasMetaData()
reDraw()

function printErrors(canvas, errors){
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = canvas.width / 6
    let y = canvas.height / 8
    ctx.fillStyle = 'white';
    ctx.font = '18px serif';
    for (error of errors){
        ctx.fillText(error, x, y)
        y += 20
    }
}


