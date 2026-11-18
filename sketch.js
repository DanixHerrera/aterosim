
let arteria;
let sistema;
let nivelTabaquismo = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);

    crearSimulacion();
    configurarControles();
}

function configurarControles() {
    let slider = document.getElementById("tabaquismo");
    slider.addEventListener("input", actualizarTabaquismo);
    actualizarTabaquismo();
}

function actualizarTabaquismo() {
    let slider = document.getElementById("tabaquismo");
    nivelTabaquismo = parseInt(slider.value, 10);

    document.getElementById("tabaquismo-valor").textContent = nivelTabaquismo;

    if (sistema) {
        sistema.aplicarTabaquismo(nivelTabaquismo);
    }
}

function actualizarContadores() {
    if (!sistema) {
        return;
    }

    let oxidantes = sistema.getAgentsOfType(Oxidante).length;
    let hdl = sistema.getAgentsOfType(HDL).length;
    let ldls = sistema.getAgentsOfType(LDL);
    let oxidados = 0;

    for (let i = 0; i < ldls.length; i++) {
        if (ldls[i].state === "oxidado") {
            oxidados = oxidados + 1;
        }
    }

    document.getElementById("contador-oxidantes").textContent = oxidantes;
    document.getElementById("contador-hdl").textContent = hdl;
    document.getElementById("contador-ldl-oxidados").textContent = oxidados;
}

function crearSimulacion() {
    arteria = new Arteria(width / 2, height / 2);

    sistema = new AgentSystem2D(arteria, 
        {
        globulosRojos: 120,
        ldl: 25,
        hdl: 12,
        oxidantes: 8,
        macrofagos: 20,
        celulasEspumosas: 2,
        tabaquismo: nivelTabaquismo
    });

    sistema.initialize();
    
    const ldls = sistema.getAgentsOfType(LDL);
    const segmentosDañados = [
        arteria.endotelioSuperior.segmentos[3],
        arteria.endotelioSuperior.segmentos[7]
    ];
    for (let i = 0; i < 3; i++) {
        ldls[i].state = "oxidado";
        const indiceSegmento = i % segmentosDañados.length;
        const segmento = segmentosDañados[indiceSegmento];
        const segmentoX = arteria.xInicio + [3, 7][indiceSegmento] * (arteria.endotelioSuperior.anchoSegmento + arteria.endotelioSuperior.separacionSegmentos);

        ldls[i].pos.x = segmentoX + segmento.ancho / 2;
        let xLocal = ldls[i].pos.x - arteria.xInicio;
        let offsetSuperior = arteria.endotelioSuperior.offsetEn(xLocal);
        let offsetInferior = arteria.endotelioInferior.offsetEn(xLocal);
        if (i % 2 === 0) {
            ldls[i].pos.y = arteria.yLumenSuperior + 12 + offsetSuperior;
        } else {
            ldls[i].pos.y = arteria.yLumenInferior - 12 + offsetInferior;
        }
        ldls[i].vel.set(0, 0);
        ldls[i].acc.set(0, 0);
    }
}

function draw() {
    background("#620202");

    arteria.display();

    sistema.update();
    sistema.display();
    actualizarContadores();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    crearSimulacion();
}
