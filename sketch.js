
let arteria;
let sistema;
let nivelTabaquismo = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);

    crearSimulacion();
    configurarControles();
}

function configurarControles() {
    let tabaquismo = document.getElementById("tabaquismo");
    tabaquismo.addEventListener("input", actualizarTabaquismo);
    actualizarTabaquismo();

    let idsDummy = ["presion-arterial", "ldl", "hdl"];

    for (let i = 0; i < idsDummy.length; i++) {
        let slider = document.getElementById(idsDummy[i]);
        slider.addEventListener("input", actualizarSliderDummy);
        mostrarValorSlider(slider);
    }
}

function mostrarValorSlider(slider) {
    let valor = document.getElementById(slider.id + "-valor");

    if (valor) {
        valor.textContent = slider.value;
    }
}

function actualizarSliderDummy(evento) {
    mostrarValorSlider(evento.target);
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
    document.getElementById("contador-estenosis").textContent = arteria.estenosisMaxima().toFixed(1);
}

function crearSimulacion() {
    arteria = new Arteria(width / 2, height / 2);

    sistema = new AgentSystem2D(arteria, 
        {
        globulosRojos: 25,
        ldl: 100,
        hdl: 12,
        oxidantes: 10,
        macrofagos: 20,
        celulasEspumosas: 0,
        tabaquismo: nivelTabaquismo
    });

    sistema.initialize();
}

function draw() {
    background("#620202");

    arteria.actualizarPlaca();
    arteria.display();

    sistema.update();
    sistema.display();
    actualizarContadores();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    crearSimulacion();
}
