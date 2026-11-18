
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
        globulosRojos: 25,
        ldl: 125,
        hdl: 12,
        oxidantes: 100,
        macrofagos: 6,
        celulasEspumosas: 2
    });

    sistema.initialize();
    
    
}

function draw() {
    background("#EAF2F5");

    arteria.display();

    sistema.update();
    sistema.display();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    crearSimulacion();
}
