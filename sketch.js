
let arteria;
let sistema;

function setup() {
    createCanvas(windowWidth, windowHeight);

    crearSimulacion();
}

function crearSimulacion() {
    arteria = new Arteria(width / 2, height / 2);

    sistema = new AgentSystem2D(arteria, 
        {
        globulosRojos: 120,
        ldl: 25,
        hdl: 12,
        oxidantes: 8,
        macrofagos: 6,
        celulasEspumosas: 2
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
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    crearSimulacion();
}
