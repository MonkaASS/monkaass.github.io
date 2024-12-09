/*
Вся работа постпроцессора
*/

const urlParams = new URLSearchParams(window.location.search);
const calc = urlParams.get('calc');

const calcs = getOrCreateCalculations()
const calcIndex = findIndexByName(calc)

const canvas = document.getElementById('calcCanvas')
canvas.width = calcCanvas.offsetWidth;
canvas.height = calcCanvas.offsetHeight * 2;

const epureNxCtx = document.getElementById('epureNx').getContext('2d', { willReadFrequently: true });
const epureSxCtx = document.getElementById('epureSx').getContext('2d', { willReadFrequently: true });
const epureUxCtx = document.getElementById('epureUx').getContext('2d', { willReadFrequently: true });

function loadCalculation(){
    if (calcIndex == -1){
        document.title = 'Ошибка'
        root.innerHTML = `<div class="starter-template text-white text-center m-3">
                <h1 id="calcNameText">Вычисления с таким названием не существует</h1>
            </div>`
        return
    }
    if (calcs[calcIndex].starred){
        calcNameText.innerHTML = `Вычисление: ${calcs[calcIndex].name} <i id="starCalc" class="fa-solid fa-star cursor-pointer"></i>`
    }
    else{
        calcNameText.innerHTML = `Вычисление: ${calcs[calcIndex].name} <i id="starCalc" class="fa-regular fa-star cursor-pointer"></i>`
    }
}
loadCalculation()

function checkCalc(){
    if (calcIndex == -1){
        return false
    }
    return true
}

starCalc.onclick = function(){
    if (calcs[calcIndex].starred){
        starCalc.setAttribute('class', 'fa-regular fa-star cursor-pointer')
        calcs[calcIndex].starred = false
    }
    else{
        starCalc.setAttribute('class', 'fa-solid fa-star cursor-pointer')
        calcs[calcIndex].starred = true
    }
    localStorage.setItem('calculations', JSON.stringify(calcs))
}

function reDraw(){
    drawScheme(canvas, calcs[calcIndex].data.scheme, cWidth.value / 2, cHeight.value * 0.01, showFCheck.checked, showQCheck.checked)
}

if (checkCalc()){
    document.title = `Вычисление: ${calcs[calcIndex].name}`
    loadCanvasMetaData()
    reDraw()

    let data = calcs[calcIndex].data.scheme
    let deltas = calculateDeltas(data)

    // Добавляем эпюры
    makeEpure(epureNxCtx, calculateNx, data, deltas, 'Nx')
    makeEpure(epureSxCtx, calculateSigmax, data, deltas, 'σx')
    makeEpure(epureUxCtx, calculateUx, data, deltas, 'Ux')

    // Добавляем таблицы
    generateTables(data, deltas)

    selectBar.innerHTML = ''
    let bars = getBars(data);
    for (let i of range(0, bars.length)){
        selectBar.innerHTML += `<option value="${i + 1}">Стержень ${i + 1}</option>`
    }
}

loadInCreator.onclick = () => {
    localStorage.setItem('preprocessInputs', JSON.stringify(calcs[calcIndex].data.scheme))
    window.location.href = `../index.html`;
}

makePDF.onclick = async () => {
    const pdfGen = new PDFGenerator()

    pdfGen.addTitleToPDF('Начальные значения', 1)
    const initials = generateInitialValues()
    pdfGen.addTableToPDF(initials['head'], initials['body'], "Исходные параметры стержней")

    pdfGen.addTitleToPDF('Схема и эпюры', 1)

    await pdfGen.addCanvasToPDF(document.getElementById('calcCanvas'), 'Начальный рисунок')

    await pdfGen.addCanvasToPDF(document.getElementById('epureNx'), 'Эпюра Nx')
    await pdfGen.addCanvasToPDF(document.getElementById('epureSx'), 'Эпюра Sigmax')
    await pdfGen.addCanvasToPDF(document.getElementById('epureUx'), 'Эпюра Ux')

    pdfGen.addTitleToPDF('Расчетные таблицы', 1)
    const tables = document.getElementsByName('report-table')
    for (let table of range(0, tables.length)){
        let tmpTable = readTable(tables[table])
        pdfGen.addTitleToPDF(`Стержень ${table + 1}`, 2)
        pdfGen.addTableToPDF(tmpTable['head'], tmpTable['body'], `Расчетная таблица ${table + 1}`)
    }

    pdfGen.downloadPDF(`${calcs[calcIndex].name.replace(' ', '_')}_Отчет.pdf`)
}

countInXBtn.onclick = function(){
    setCountX()
}

countInX.onkeydown = (e) => {
    if (e.keyCode == 13){
        setCountX()
    }
}

function setCountX(){
    let data = calcs[calcIndex].data.scheme
    let bars = getBars(data)
    if(countInX.value > bars[selectBar.value - 1]){
        alert('Значение не может быть больше длины стержня')
        return
    }
    else if(countInX.value < 0){
        alert('Значение не может быть отрицательным')
        return
    }
    let res = countX(data, selectBar.value, countInX.value)
    countInXDiv.children[0].innerHTML = `Nx = ${res.Nx}`
    countInXDiv.children[1].innerHTML = `σx = ${res.Sx}`
    countInXDiv.children[2].innerHTML = `Ux = ${res.Ux}`
}

function countX(data, bar, x){
    let Nx = math.round(calculateNx(data, calculateDeltas(data), bar, x), setPrecision.value)
    let Sx = math.round(calculateSigmax(data, calculateDeltas(data), bar, x), setPrecision.value)
    let Ux = math.round(calculateUx(data, calculateDeltas(data), bar, x), setPrecision.value)

    return {Nx: Nx, Sx: Sx, Ux: Ux}
}

function generateInitialValues(){
    let data = calcs[calcIndex].data.scheme
    let head = [], body = []
    head = [['#', 'L', 'A', 'E', '[σ]']]

    let barsLen = getBars(data)
    for (let bar of range(0, barsLen.length)){
        body.push([
            bar + 1,
            barsLen[bar],
            data[2][data[1][bar].Ig - 1].A,
            data[2][data[1][bar].Ig - 1].E,
            data[2][data[1][bar].Ig - 1].sigma,
        ])
    }

    return {head: head, body: body}
}

function regenerateTables(){
    precText.innerHTML = `Точность: ${setPrecision.value}`
    pointNumberText.innerHTML = `Колчиство точек: ${tablePoints.value}`
    generateTables(calcs[calcIndex].data.scheme, calculateDeltas(calcs[calcIndex].data.scheme), tablePoints.value, maxS.checked)
}


function generateTables(data, _deltas, N = 10, showOnlyMax=false){
    let tableReportDiv = document.getElementById('tableReportDiv')
    tableReportDiv.innerHTML = ''

    let bars = getBars(data)

    let xs = []
    let Nxs = []
    let Sxs = []
    let Uxs = []

    let Sp = []

    for (let bar of range(0, bars.length)){
        Sp.push(data[2][data[1][bar].Ig - 1].sigma)
    }

    for (let bar of bars){
        xs.push(range(0, bar + 0.1, bar / (N - 1)))
    }
    
    for (let bar of range(1, bars.length + 1)){
        let tmp = []
        for (let x of xs[bar - 1]){
            tmp.push(math.round(calculateNx(data, _deltas, bar, x), setPrecision.value))
        }
        Nxs.push([...tmp])
    }
    
    for (let bar of range(1, bars.length + 1)){
        let tmp = []
        for (let x of xs[bar - 1]){
            tmp.push(math.round(calculateSigmax(data, _deltas, bar, x), setPrecision.value))
        }
        Sxs.push([...tmp])
    }
    
    for (let bar of range(1, bars.length + 1)){
        let tmp = []
        for (let x of xs[bar - 1]){
            tmp.push(math.round(calculateUx(data, _deltas, bar, x), setPrecision.value))
        }
        Uxs.push([...tmp])
    }

    
    for (let bar of range(0, bars.length)){        
        tableReportDiv.innerHTML += `<h4 class="text-white mt-5"> Нагрузки в стержне ${bar + 1} </h4>`
        let table = document.createElement('table')
        table.className = 'table mt-2 text-white'
        table.setAttribute('name', 'report-table')
        table.innerHTML = `<thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">x</th>
                <th scope="col">Nx</th>
                <th scope="col">Ux</th>
                <th scope="col">σx</th>
                <th scope="col">[σ]</th>
            </tr>
        </thead>`

        let tbody = document.createElement('tbody')
        if (!showOnlyMax){
            for (let i of range(0, xs[bar].length)){
                tbody.innerHTML += `<tr>
                    <th scope="row">${i + 1}</th>
                    <td>${xs[bar][i]}</td>
                    <td>${Nxs[bar][i]}</td>
                    <td>${Uxs[bar][i]}</td>
                    <td>${Sxs[bar][i]}</td>
                    <td>${Sp[bar]}</td>
                </tr>`
            }
        }
        else{
            let items = [Sxs[bar].findIndex((el) => el >= math.max(Sxs[bar])), Sxs[bar].findIndex((el) => el <= math.min(Sxs[bar]))]
            for (i of items){
                tbody.innerHTML += `<tr>
                    <th scope="row">${i + 1}</th>
                    <td>${xs[bar][i]}</td>
                    <td>${Nxs[bar][i]}</td>
                    <td>${Uxs[bar][i]}</td>
                    <td>${Sxs[bar][i]}</td>
                    <td>${Sp[bar]}</td>
                </tr>`
            }
        }
        
        tableReportDiv.appendChild(table)
        table.appendChild(tbody)
    }
}

function getBars(data){
    let _nodes = data[0]
    let _bars = data[1]

    let bars = []
    
    for (bar of _bars){
        bars.push(Math.abs(_nodes[bar.J - 1] - _nodes[bar.I - 1]))
    }
    return bars
}

function makeEpure(ctx, func, data, _deltas, yLabel){
    let bars = getBars(data)
    let datasets = []

    let starting = 0;
    let sum = 0
    for (let i of range(0, bars.length)){
        let tmpData = []
        for (let j of range(0, bars[i], 0.1)){
            tmpData.push({
                x: starting,
                y: math.round(func(data, _deltas, i + 1, j), setPrecision.value)
            })
            starting += 0.1
            starting = math.round(starting, setPrecision.value)
        }
        sum += bars[i]
        starting = sum
        tmpData.push({
            x: starting,
            y: math.round(func(data, _deltas, i + 1, bars[i]), setPrecision.value)
        })
        datasets.push({
            borderColor: 'blue',
            backgroundColor: ctx.createPattern(createVerticalLines(), 'repeat'),
            showLine: true,
            pointRadius: 1,
            data: tmpData
        })
    }

    let minVal = findMin(datasets)
    let maxVal = findMax(datasets)
    starting = 0
    for (let i of range(0, bars.length - 1)){
        datasets.push({
            borderColor: 'red',
            showLine: true,
            pointRadius: 2,
            data: [
                {
                    x: starting + bars[i],
                    y: minVal
                },
                {
                    x: starting + bars[i],
                    y: maxVal
                }
            ]
        })
        starting += bars[i]
    }

    const chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: datasets
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yLabel
                    }
                }]
            }
        }
    });
}

function findMin(datasets){
    let min = datasets[0]['data'][0]['y']

    for (let dataset of datasets){
        for (let num of dataset['data']){
            if (num['y'] < min){
                min = num['y']
            }
        }
    }
    
    return(math.ceil(min) - 1)
}

function findMax(datasets){
    let max = datasets[0]['data'][0]['y']

    for (let dataset of datasets){
        for (let num of dataset['data']){
            if (num['y'] > max){
                max = num['y']
            }
        }
    }
    
    return(math.ceil(max))
}

function createVerticalLines() {
    const canvas = document.createElement('canvas');
    const size = 5;
    canvas.width = size * 2;
    canvas.height = size * 2;
    const context = canvas.getContext('2d');

    context.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    context.lineWidth = 2;

    
    context.beginPath();
    context.moveTo(size, 0);
    context.lineTo(size, canvas.height);
    context.stroke();

    return canvas;
}

function readTable(table){
    let head = []
    let body = []

    for (let item of table.querySelector('thead').children[0].children){
        head.push(item.innerHTML)
    }

    for (let tr of table.querySelector('tbody').children){
        let tmpData = []
        for (let child of tr.children){
            tmpData.push(child.innerHTML)
        }
        body.push(tmpData)
    }

    return {head: [head], body: body}
}

function range(start, end, step=1){
    let array = []
    for (let i = start; i < end; i += step){
        array.push(math.round(i, 2));
    }
    return array;
}

