/*
Вся работа процессора
*/

function calculateDeltas(data){
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;

    let A = math.zeros(nodes.length, nodes.length)
    for (let i = 0; i < A.size()[0] - 1; i++) {
        for (let j = 0; j < A.size()[1] - 1; j++) {
            if (i == j){
                let barClass = barClasses[[bars[i].Ig - 1]]
                let K = (barClass.E * barClass.A) / (nodes[bars[i].J - 1] - nodes[bars[i].I - 1])

                A.set([i, j], A.get([i, j]) + K)
                A.set([i + 1, j], A.get([i + 1, j]) - K)
                A.set([i, j + 1], A.get([i, j + 1]) - K)
                A.set([i + 1, j + 1], A.get([i + 1, j + 1]) + K)
            }
        }
    }
    let barClass = barClasses[[bars[nodes.length - 2].Ig - 1]]
    let K = (barClass.E * barClass.A) / (nodes[bars[nodes.length - 2].J - 1] - nodes[bars[nodes.length - 2].I - 1])
    A.set([nodes.length - 1, nodes.length - 1], K)

    if (supports[0]){
        A.set([0, 0], 1)
        A.set([1, 0], 0)
        A.set([0, 1], 0)
    }

    if (supports[1]){
        A.set([nodes.length - 1, nodes.length - 1], 1)
        A.set([nodes.length - 2, nodes.length - 1], 0)
        A.set([nodes.length - 1, nodes.length - 2], 0)
    }

    let b = math.zeros(nodes.length)
    for (let i = 0; i < nodes.length; i++){
        let f = concentratedForces.find((el) => el.I == i + 1)
        if (f !== undefined){
            b.set([i], b.get([i]) + f.F)
        }

        for (load of distributedLoads){
            if (bars[load.I - 1].I == (i + 1) || bars[load.I - 1].J == (i + 1)){
                b.set([i], b.get([i]) + (nodes[bars[load.I - 1].J - 1] - nodes[bars[load.I - 1].I - 1]) * load.q / 2)
            }
        }
        bars.find((el) => el.I == i + 1)
        bars.find((el) => el.J == i + 1)
        
    }

    if (supports[0]){
        b.set([0], 0)
    }

    if (supports[1]){
        b.set([nodes.length - 1], 0)
    }

    deltas = math.multiply(math.inv(A), math.transpose(b))

    return deltas
}

function calculateNx(data, _deltas, bar, x){

    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;
    let barLen = (nodes[bars[bar - 1].J - 1] - nodes[bars[bar - 1].I - 1])

    if (x > barLen){
        return null
    }

    let deltas = _deltas.toArray()

    let load = distributedLoads.find((el) => el.I == bar)
    if (load == undefined){
        load = 0
    }
    else{
        load = load.q * (nodes[bars[load.I - 1].J - 1] - nodes[bars[load.I - 1].I - 1]) / 2
    }

    let firstPart = barClasses[bars[bar - 1].Ig - 1].E * barClasses[bars[bar - 1].Ig - 1].A / barLen
    let xPart = 1 - 2 * x / barLen

    return firstPart * (deltas[bar] - deltas[bar - 1]) + load * xPart
}

function findBorderNxValues(data, _deltas){
    let res = []
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;
    for (let bar of bars){
        let N1 = calculateNx(data, _deltas, bar.I, 0)
        let N2 = calculateNx(data, _deltas, bar.I, (nodes[bars[bar.I - 1].J - 1] - nodes[bars[bar.I - 1].I - 1]))
        res.push([N1, N2])
    }

    return res
}

function calculateSigmax(data, _deltas, bar, x){
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;
    let barLen = (nodes[bars[bar - 1].J - 1] - nodes[bars[bar - 1].I - 1])
    if (x > barLen){
        return null
    }
    return calculateNx(data, _deltas, bar, x) / barClasses[bars[bar - 1].Ig - 1].A
}

function findBorderSigmaxValues(data, _deltas){
    let res = []
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;
    for (let bar of bars){
        let Sigma1 = calculateSigmax(data, _deltas, bar.I, 0)
        let Sigma2 = calculateSigmax(data, _deltas, bar.I, (nodes[bars[bar.I - 1].J - 1] - nodes[bars[bar.I - 1].I - 1]))
        res.push([Sigma1, Sigma2])
    }

    return res
}

function calculateUx(data, _deltas, bar, x){
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;
    let deltas = _deltas.toArray()

    let barLen = (nodes[bars[bar - 1].J - 1] - nodes[bars[bar - 1].I - 1])
    if (x > barLen){
        return null
    }

    let load = distributedLoads.find((el) => el.I == bar)
    if (load == undefined){
        load = 0
    }
    else{
        load = load.q * math.pow(barLen, 2) / (2 * barClasses[bars[bar - 1].Ig - 1].E * barClasses[bars[bar - 1].Ig - 1].A) * x / barLen * (1 - x / barLen)
    }

    let firstPart = deltas[bar - 1] + x / barLen * (deltas[bar] - deltas[bar - 1])

    return firstPart + load
}

function findBorderUxValues(data, _deltas){
    let res = []
    const [nodes, bars, barClasses, supports, concentratedForces, distributedLoads] = data;
    for (let bar of bars){
        let U1 = calculateUx(data, _deltas, bar.I, 0)
        let U2 = calculateUx(data, _deltas, bar.I, (nodes[bars[bar.I - 1].J - 1] - nodes[bars[bar.I - 1].I - 1]))
        res.push([U1, U2])
    }

    return res
}

function testProcessor(data){
    let deltas = calculateDeltas(data)

    console.log('data', data)

    console.log('deltas', deltas)

    console.log('Nxs', findBorderNxValues(data, deltas))

    console.log('Sigmas', findBorderSigmaxValues(data, deltas))

    console.log('Uxs', findBorderUxValues(data, deltas))

    console.log('N1(2)', calculateNx(data, deltas, 1, 2))
    console.log('Sigma1(2)', calculateSigmax(data, deltas, 1, 2))
    console.log('U1(2)', calculateUx(data, deltas, 1, 2))
}
