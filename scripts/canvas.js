/*

Работа с основным канвасом, на котором отрисовывается схема

*/

function saveCanvasMetaData(){
    canvasMetaData = {
        height: cHeight.value,
        width: cWidth.value,
        showF: showFCheck.checked,
        showQ: showQCheck.checked
    }
    localStorage.setItem('canvasMetaData', JSON.stringify(canvasMetaData))
}


function loadCanvasMetaData(){
    if (localStorage.getItem('canvasMetaData') == undefined){
        saveCanvasMetaData()
    }
    
    let canvasMetaData = JSON.parse(localStorage.getItem('canvasMetaData'))
    cHeight.value = canvasMetaData.height
    cWidth.value = canvasMetaData.width
    showFCheck.checked = canvasMetaData.showF
    showQCheck.checked = canvasMetaData.showQ
}


function drawArrow(ctx, x, y, length, color, direction = 1, isF=false) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + direction * length, y);
    ctx.lineTo(x + direction * (length - 5), y - 5);
    ctx.moveTo(x + direction * length, y);
    ctx.lineTo(x + direction * (length - 5), y + 5);
    ctx.strokeStyle = color;
    if (isF)
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineWidth = 1;
}

function drawSupport(ctx, x, height, direction) {
    const width = 10; // ширина заделки
    const yStart = canvas.height / 2 - height / 2;
    const yEnd = canvas.height / 2 + height / 2;

    // Рисуем основание опоры
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x, yStart);
    ctx.lineTo(x, yEnd);
    ctx.stroke();

    // Рисуем наклонные штрихи внутри заделки
    // direction используется чтобы нарисовать штрихи
    // с однинаковым углом наклона
    if (direction == -1){
        for (let y = yStart; y < yEnd; y += 5) {
            ctx.beginPath();
            ctx.moveTo(x + width * direction, y);
            ctx.lineTo(x, y + 5);
            ctx.stroke();
        }
    }
    if(direction == 1){
        for (let y = yStart + 5; y < yEnd + 5; y += 5) {
            ctx.beginPath();
            ctx.moveTo(x + width * direction, y);
            ctx.lineTo(x, y - 5);
            ctx.stroke();
        }
    }
}
    
// Функция для отрисовки схемы на canvas
function drawScheme(canvas, data, scalerX = 1, scalerY = 1, showF=false, showq=false) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#262626";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '18px serif';

    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;

    // Находим минимальные и максимальные координаты по x и y, чтобы корректно масштабировать
    const xCoords = nodes
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);

    // Рассчитываем коэффициенты масштабирования
    const padding = 20;
    const scaleX = (canvas.width - 2 * padding) / (maxX - minX) - scalerX;

    // Функция для преобразования координат узлов в координаты canvas
    function transformX(x) {
        return (x - minX) * scaleX + padding;
    }

    // Отрисовка узлов
    ctx.fillStyle = 'white';
    nodes.forEach((node, index) => {
        const x = transformX(node);
        ctx.beginPath();
        ctx.arc(x, canvas.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(index + 1, x + 10, canvas.height / 2 + 30); // номер узла
    });

    // Отрисовка стержней
    bars.forEach(bar => {
        const node1 = nodes[bar.I - 1];
        const node2 = nodes[bar.J - 1];
        const barClass = barClasses[bar.Ig - 1];

        const x1 = transformX(node1);
        const x2 = transformX(node2);
        const width = Math.abs(x2 - x1);
        const height = barClass.A * 10 * scalerY; // масштабируем высоту стержня на канвасе
        
        ctx.strokeStyle = 'white';
        ctx.rect(x1, canvas.height / 2 - height / 2, width, height);
        ctx.stroke();
    });
    
    // Отрисовка опор
    // Отрисовка левой
    if (supports[0]){
        const x = transformX(nodes[0]);
        const height = 50; // Высота опоры
        drawSupport(ctx, x, height, -1);
    }
    // Отрисовка правой
    if (supports[1]){
        const x = transformX(nodes[nodes.length - 1]);
        const height = 50; // Высота опоры
        drawSupport(ctx, x, height, 1);
    }
    
    // Отрисовка сосредоточенных сил
    if (showF){
        concentratedForces.forEach(force => {
            const x = transformX(nodes[force.I - 1]);
            const color = force.F > 0 ? 'green' : 'red';
            ctx.fillText(force.F.toExponential(), x + 10 * Math.sign(force.F), canvas.height / 2 - 20); // сила в узле
            drawArrow(ctx, x, canvas.height / 2, 40, color, Math.sign(force.F), true);
        });
    }
    
    // Отрисовка распределенных нагрузок
    if (showq){
        distributedLoads.forEach(load => {
            const bar = bars[load.I - 1];
            const node1 = nodes[bar.I - 1];
            const node2 = nodes[bar.J - 1];

            const x1 = transformX(node1);
            const x2 = transformX(node2);
            const width = Math.abs(x2 - x1);
            const spacing = 15; // расстояние между стрелками распределенной нагрузки
            const numArrows = Math.floor(width / spacing); // количество стрелок
            
            ctx.fillText(load.q.toExponential(), x1 + width / 2, canvas.height / 2 - 20); // сила распределенной нагрузки на стержень

            const color = load.q > 0 ? 'green' : 'red';
            for (let i = 0; i < numArrows; i++) {
                const x = x1 + (i * spacing);
                if(Math.sign(load.q) == -1)
                    drawArrow(ctx, x + 20, canvas.height / 2, 12, color, Math.sign(load.q));
                else{
                    drawArrow(ctx, x, canvas.height / 2, 12, color, Math.sign(load.q));
                }
            }
        });
    }
}
