
let arteria;
let sistema;
let nivelTabaquismo = 0;
let presionArterial = 115;
let nivelLDL = 90;
let nivelHDL = 60;
let escenarioActivo = "escenario-saludable";
let segmentosGenerados = null;

let configuracionEscenarios = {
    "escenario-saludable": {
        cantidad: 40,
        seed: 3101,
        macrofagos: 25
    },
    "escenario-ldl-alto": {
        cantidad: 40,
        seed: 1901,
        macrofagos: 45
    },
    "escenario-hipertension": {
        cantidad: 40,
        seed: 1601,
        macrofagos: 40
    },
    "escenario-fumador": {
        cantidad: 40,
        seed: 1001,
        macrofagos: 50
    }
};

function setup() {
    createCanvas(windowWidth, windowHeight);

    crearSimulacion();
    configurarControles();
}

function configurarControles() {
    let tabaquismo = document.getElementById("tabaquismo");
    tabaquismo.addEventListener("input", actualizarTabaquismo);
    actualizarTabaquismo();

    let presion = document.getElementById("presion-arterial");
    presion.addEventListener("input", actualizarPresionArterial);
    actualizarPresionArterial();

    let ldl = document.getElementById("ldl");
    ldl.addEventListener("input", actualizarLDL);

    let hdl = document.getElementById("hdl");
    hdl.addEventListener("input", actualizarHDL);

    actualizarLDL();
    actualizarHDL();

    configurarEscenarios();
}

function actualizarTabaquismo() {
    let slider = document.getElementById("tabaquismo");
    nivelTabaquismo = parseInt(slider.value, 10);

    document.getElementById("tabaquismo-valor").textContent = nivelTabaquismo;
    if (arguments.length > 0) {
        desactivarEscenarios();
    }

    if (sistema) {
        sistema.aplicarTabaquismo(nivelTabaquismo);
    }
}

function actualizarPresionArterial() {
    let slider = document.getElementById("presion-arterial");
    presionArterial = parseInt(slider.value, 10);

    document.getElementById("presion-arterial-valor").textContent = presionArterial;
    if (arguments.length > 0) {
        desactivarEscenarios();
    }

    if (sistema) {
        sistema.aplicarPresionArterial(presionArterial);
    }
}

function actualizarLDL() {
    let slider = document.getElementById("ldl");
    nivelLDL = parseInt(slider.value, 10);
    document.getElementById("ldl-valor").textContent = nivelLDL;
    if (arguments.length > 0) {
        desactivarEscenarios();
    }

    if (sistema) {
        sistema.aplicarLDL(nivelLDL);
    }
}

function actualizarHDL() {
    let slider = document.getElementById("hdl");
    nivelHDL = parseInt(slider.value, 10);
    document.getElementById("hdl-valor").textContent = nivelHDL;
    if (arguments.length > 0) {
        desactivarEscenarios();
    }

    if (sistema) {
        sistema.aplicarHDL(nivelHDL);
    }
}

function desactivarEscenarios() {
    let ids = [
        "escenario-saludable",
        "escenario-ldl-alto",
        "escenario-hipertension",
        "escenario-fumador"
    ];

    for (let i = 0; i < ids.length; i++) {
        document.getElementById(ids[i]).checked = false;
    }

    escenarioActivo = null;
}

function configurarEscenarios() {
    let ids = [
        "escenario-saludable",
        "escenario-ldl-alto",
        "escenario-hipertension",
        "escenario-fumador"
    ];

    for (let i = 0; i < ids.length; i++) {
        document.getElementById(ids[i]).addEventListener("change", seleccionarEscenario);
    }
}

function seleccionarEscenario(evento) {
    if (!evento.target.checked) {
        return;
    }

    let ids = [
        "escenario-saludable",
        "escenario-ldl-alto",
        "escenario-hipertension",
        "escenario-fumador"
    ];

    for (let i = 0; i < ids.length; i++) {
        if (ids[i] !== evento.target.id) {
            document.getElementById(ids[i]).checked = false;
        }
    }

    let escenarios = {
        "escenario-saludable": { tabaquismo: 0, presion: 115, ldl: 90, hdl: 60 },
        "escenario-ldl-alto": { tabaquismo: 0, presion: 120, ldl: 190, hdl: 55 },
        "escenario-hipertension": { tabaquismo: 0, presion: 160, ldl: 100, hdl: 55 },
        "escenario-fumador": { tabaquismo: 100, presion: 120, ldl: 100, hdl: 45 }
    };

    let valores = escenarios[evento.target.id];
    escenarioActivo = evento.target.id;
    segmentosGenerados = generarSegmentosEscenario(
        evento.target.id,
        configuracionEscenarios[evento.target.id].cantidad
    );
    document.getElementById("tabaquismo").value = valores.tabaquismo;
    document.getElementById("presion-arterial").value = valores.presion;
    document.getElementById("ldl").value = valores.ldl;
    document.getElementById("hdl").value = valores.hdl;

    nivelTabaquismo = valores.tabaquismo;
    presionArterial = valores.presion;
    nivelLDL = valores.ldl;
    nivelHDL = valores.hdl;

    document.getElementById("tabaquismo-valor").textContent = nivelTabaquismo;
    document.getElementById("presion-arterial-valor").textContent = presionArterial;
    document.getElementById("ldl-valor").textContent = nivelLDL;
    document.getElementById("hdl-valor").textContent = nivelHDL;

    crearSimulacion();
}

function actualizarContadores() {
    if (!sistema) {
        return;
    }

    let oxidantes = sistema.getAgentsOfType(Oxidante).length;
    let hdl = sistema.getAgentsOfType(HDL).length;
    let ldls = sistema.getAgentsOfType(LDL);
    let oxidados = 0;
    let normales = 0;

    for (let i = 0; i < ldls.length; i++) {
        if (ldls[i].state === "oxidado") {
            oxidados = oxidados + 1;
        } else if (ldls[i].state === "normal") {
            normales = normales + 1;
        }
    }

    document.getElementById("contador-oxidantes").textContent = oxidantes;
    document.getElementById("contador-hdl").textContent = hdl;
    document.getElementById("contador-ldl-normales").textContent = normales;
    document.getElementById("contador-ldl-oxidados").textContent = oxidados;
    document.getElementById("contador-estenosis").textContent = arteria.estenosisMaxima().toFixed(1);
}

function cantidadLDL(nivel) {
    return round(map(nivel, 50, 220, 25, 140));
}

function cantidadHDL(nivel) {
    return round(map(nivel, 20, 100, 4, 30));
}

function generarSegmentosEscenario(nombre, cantidad) {
    let semilla = configuracionEscenarios[nombre].seed;
    let estado = semilla;
    let indices = [];

    function aleatorio() {
        estado = (estado * 1664525 + 1013904223) % 4294967296;
        return estado / 4294967296;
    }

    for (let pared of ["superior", "inferior"]) {
        let usados = new Set();

        while (usados.size < cantidad) {
            let indice = floor(aleatorio() * 100);

            if (!usados.has(indice)) {
                usados.add(indice);
                indices.push({ pared: pared, indice: indice });
            }
        }
    }

    return indices;
}

function configuracionArteriaActual() {
    if (escenarioActivo) {
        let configuracion = configuracionEscenarios[escenarioActivo];
        if (!segmentosGenerados) {
            segmentosGenerados = generarSegmentosEscenario(
                escenarioActivo,
                configuracion.cantidad
            );
        }
        return {
            indicesDanados: segmentosGenerados,
            macrofagos: configuracion.macrofagos
        };
    }

    let indices = [
        { pared: "superior", indice: 3 },
        { pared: "superior", indice: 7 },
        { pared: "superior", indice: 21 },
        { pared: "superior", indice: 36 },
        { pared: "superior", indice: 68 },
        { pared: "inferior", indice: 5 },
        { pared: "inferior", indice: 16 },
        { pared: "inferior", indice: 43 },
        { pared: "inferior", indice: 79 }
    ];

    let macrofagos = 25;

    if (nivelLDL >= 160) {
        macrofagos = macrofagos + 20;
        indices = indices.concat([
            { pared: "superior", indice: 31 },
            { pared: "superior", indice: 48 },
            { pared: "inferior", indice: 35 },
            { pared: "inferior", indice: 67 }
        ]);
    }

    if (presionArterial >= 160) {
        indices = indices.concat([
            { pared: "superior", indice: 14 },
            { pared: "superior", indice: 58 },
            { pared: "inferior", indice: 21 },
            { pared: "inferior", indice: 63 }
        ]);
        macrofagos = macrofagos + 15;
    }

    if (nivelTabaquismo >= 70) {
        indices = indices.concat([
            { pared: "superior", indice: 84 },
            { pared: "inferior", indice: 49 },
            { pared: "inferior", indice: 91 }
        ]);
        macrofagos = macrofagos + 15;
    }

    return {
        indicesDanados: indices,
        macrofagos: macrofagos
    };
}

function crearSimulacion() {
    let configuracion = configuracionArteriaActual();
    arteria = new Arteria(width / 2, height / 2, configuracion);

    sistema = new AgentSystem2D(arteria, 
        {
        globulosRojos: 25,
        ldl: cantidadLDL(nivelLDL),
        hdl: cantidadHDL(nivelHDL),
        oxidantes: 10,
        macrofagos: configuracion.macrofagos,
        celulasEspumosas: 0,
        tabaquismo: nivelTabaquismo,
        presionArterial: presionArterial,
        ldlMg: nivelLDL,
        hdlMg: nivelHDL
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
