
let arteria;
let sistema;

function setup() {
    createCanvas(windowWidth, windowHeight);

    crearSimulacion();
}

function crearSimulacion() {
    arteria = new Arteria(width / 2, height / 2);

    sistema = new AgentSystem2D(arteria, {
        globulosRojos: 12,
        ldl: 25,
        hdl: 12,
        oxidantes: 8,
        macrofagos: 3,
        celulasEspumosas: 1
    });

    sistema.initialize();
}

function draw() {
    background("#481b18");

    arteria.display();

    sistema.update();
    sistema.display();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    crearSimulacion();
}
