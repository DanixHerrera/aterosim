
class AgentSystem2D {
    constructor(arteria, config = {}) {
        this.arteria = arteria;
        this.agents = [];
        this.velocidadFlujo = config.velocidadFlujo ?? 1.5;
        this.damp = 0.4;

        this.config = {
            globulosRojos: config.globulosRojos ?? 12,
            ldl: config.ldl ?? 25,
            hdl: config.hdl ?? 12,
            oxidantes: config.oxidantes ?? 8,
            macrofagos: config.macrofagos ?? 3,
            celulasEspumosas: config.celulasEspumosas ?? 1
        };

        this.tabaquismo = 0;
        if (config.tabaquismo !== undefined) {
            this.tabaquismo = config.tabaquismo;
        }

        this.oxidantesBase = this.config.oxidantes;
        this.oxidantesMax = 30;
        this.proteccionHDLMin = 0.3;
        this.radioInteraccion = 12;
    }

    initialize() {
        this.agents = [];

        this.createAgents(GlobuloRojo, this.config.globulosRojos);
        this.createAgents(LDL, this.config.ldl);
        this.createAgents(HDL, this.config.hdl);
        this.createAgents(Oxidante, this.config.oxidantes);
        this.createAgents(Macrofago, this.config.macrofagos);

        for (let i = 0; i < this.config.celulasEspumosas; i++) {
            this.addFoamCell();
        }

        this.aplicarTabaquismo(this.tabaquismo);
    }

    cantidadOxidantesDeseada() {
        let cantidad = this.oxidantesBase
            + (this.oxidantesMax - this.oxidantesBase) * this.tabaquismo / 100;

        return Math.round(cantidad);
    }

    factorProteccionHDL() {
        return map(this.tabaquismo, 0, 100, 1, this.proteccionHDLMin);
    }

    aplicarTabaquismo(nivel) {
        this.tabaquismo = nivel;
        this.ajustarOxidantes();
    }

    ajustarOxidantes() {
        let deseados = this.cantidadOxidantesDeseada();
        let oxidantes = this.getAgentsOfType(Oxidante);

        while (oxidantes.length < deseados) {
            let pos = this.randomLumenPosition(10);
            this.addAgent(Oxidante, pos.x, pos.y);
            oxidantes = this.getAgentsOfType(Oxidante);
        }

        while (oxidantes.length > deseados) {
            let ultimo = oxidantes[oxidantes.length - 1];
            let indice = this.agents.indexOf(ultimo);

            if (indice !== -1) {
                this.agents.splice(indice, 1);
            }

            oxidantes = this.getAgentsOfType(Oxidante);
        }
    }

    mantenerOxidantes() {
        let deseados = this.cantidadOxidantesDeseada();
        let oxidantes = this.getAgentsOfType(Oxidante);

        if (oxidantes.length < deseados) {
            let faltantes = deseados - oxidantes.length;

            for (let i = 0; i < faltantes; i++) {
                let pos = this.randomLumenPosition(10);
                this.addAgent(Oxidante, pos.x, pos.y);
            }
        }
    }

    procesarProteccionHDL() {
        let hdls = this.getAgentsOfType(HDL);
        let oxidantes = this.getAgentsOfType(Oxidante);
        let eliminados = [];
        let factor = this.factorProteccionHDL();

        for (let i = 0; i < hdls.length; i++) {
            let hdl = hdls[i];

            for (let j = 0; j < oxidantes.length; j++) {
                let oxidante = oxidantes[j];

                if (eliminados.indexOf(oxidante) !== -1) {
                    continue;
                }

                let distancia = p5.Vector.dist(hdl.pos, oxidante.pos);

                if (distancia <= this.radioInteraccion) {
                    if (random(1) < factor) {
                        eliminados.push(oxidante);
                        hdl.reaparecerIzquierda(this.arteria);
                        break;
                    }
                }
            }
        }

        for (let i = 0; i < eliminados.length; i++) {
            let indice = this.agents.indexOf(eliminados[i]);

            if (indice !== -1) {
                this.agents.splice(indice, 1);
            }
        }
    }

    randomLumenPosition(margin = 30) {
        const a = this.arteria;

        let x = random(a.xInicio + margin, a.xInicio + a.ancho - margin);
        let xLocal = x - a.xInicio;
        let offsetSuperior = a.endotelioSuperior.offsetEn(xLocal);
        let offsetInferior = a.endotelioInferior.offsetEn(xLocal);
        let y = random(
            a.yLumenSuperior + margin + offsetSuperior,
            a.yLumenInferior - margin + offsetInferior
        );

        return createVector(x, y);
    }

    createAgents(Type, quantity) {
        for (let i = 0; i < quantity; i++) {
            const pos = this.randomLumenPosition();
            const agent = new Type(pos.x, pos.y);

            agent.arteria = this.arteria;

            this.agents.push(agent);
        }
    }

    addAgent(Type, x, y) {
        const agent = new Type(x, y);

        agent.arteria = this.arteria;

        this.agents.push(agent);
        return agent;
    }

    addFoamCell() {
        const a = this.arteria;

        const x = random(
            a.xInicio + 30,
            a.xInicio + a.ancho - 30
        );

        let xLocal = x - a.xInicio;
        let offsetInferior = a.endotelioInferior.offsetEn(xLocal);

        const y = a.yLumenInferior + a.intima.distanciaLumen
            + a.intima.grosor / 2 + 8 + offsetInferior;

        return this.addAgent(CelulaEspumosa, x, y);
    }

    isStatic(agent) {
        return agent instanceof CelulaEspumosa;
    }

    update() {
        const ldls = this.getAgentsOfType(LDL);
        for (let i = this.agents.length - 1; i >= 0; i--) {
            const agent = this.agents[i];
            if (agent instanceof Macrofago) {
                agent.update(this.velocidadFlujo, ldls);
            } else {
                agent.update(this.velocidadFlujo);
            }
            if (agent.isDead()) {
                this.agents.splice(i, 1);
            }
        }

        this.mantenerOxidantes(); //
        this.procesarProteccionHDL();
        this.processLDLInfiltration();
        this.processLDLOxidation();
        this.detectCollisions();

        for (const agent of this.agents) {
            if (this.isStatic(agent)) {
                continue;
            }

            if (agent instanceof LDL && agent.state !== "normal") {
                continue;
            }

            agent.limitarAlLumen(this.arteria);
        }
    }

    display() {
        for (const agent of this.agents) {
            agent.display();
        }
    }

    getAgentsOfType(Type) {
        return this.agents.filter(agent => agent instanceof Type);
    }

    separate(a1, a2) {
        let dif = p5.Vector.sub(a1.pos, a2.pos);
        let distancia = dif.mag();
        let distanciaMinima = a1.r + a2.r;        
        if (dif.magSq() === 0)
            dif = createVector(1, 0);
        dif.normalize();
        let superposicion = distanciaMinima - distancia;
        let mag1 = this.isStatic(a1) ? 0 :
            (a1.mass > 0 ? 1 / a1.mass : 0);
        let mag2 = this.isStatic(a2) ? 0 :
            (a2.mass > 0 ? 1 / a2.mass : 0);
        let mag3 = mag1 + mag2;
        if (mag3 === 0)
            return;
        dif.mult(superposicion / mag3);
        a1.pos.add(p5.Vector.mult(dif, mag1));
        a2.pos.sub(p5.Vector.mult(dif, mag2));
    }

    collision(a1, a2) {
        if (a1.touch(a2)) {
            let dif = p5.Vector.sub(a1.pos, a2.pos);
            if (dif.magSq() === 0)
                dif = createVector(1, 0);
            dif.normalize();
            this.separate(a1, a2);
            let vel1 = a1.vel.copy();
            let vel2 = a2.vel.copy();
            let vel3 = p5.Vector.sub(vel1, vel2);
            const mag1 = this.isStatic(a1) ? 0 :
                (a1.mass > 0 ? 1 / a1.mass : 0);
            const mag2 = this.isStatic(a2) ? 0 :
                (a2.mass > 0 ? 1 / a2.mass : 0);
            const mag3 = mag1 + mag2;
            if (mag3 === 0)
                return;
            const mag4 = vel3.dot(dif);
            if (mag4 > 0)
                return;
            const impulso = -(1 + this.damp) * mag4 / mag3;
            let vel4 = p5.Vector.mult(dif, impulso);
            a1.vel.add(p5.Vector.mult(vel4, mag1));
            a2.vel.sub(p5.Vector.mult(vel4, mag2));
        }
    }

    detectCollisions() {
        for (let i = 0; i < this.agents.length; i++) {
            for (let j = i + 1; j < this.agents.length; j++) {
                let a1 = this.agents[i];
                let a2 = this.agents[j];
                this.collision(a1, a2);
            }
        }
    }

    getSegmentAt(endotelio, x) {
        const xLocal = x - this.arteria.xInicio;
        const paso = endotelio.anchoSegmento + endotelio.separacionSegmentos;

        const indice = Math.floor(xLocal / paso);

        if (indice < 0 || indice >= endotelio.segmentos.length) {
            return null;
        }

        const posicionDentro = xLocal - indice * paso;

        if (posicionDentro > endotelio.anchoSegmento) {
            return null;
        }

        return endotelio.segmentos[indice];
    }

    getIntimaOffsetAt(x) {
        const intima = this.arteria.intima;

        const posicion = constrain(
            x / this.arteria.ancho * intima.cantidadPuntos,
            0,
            intima.cantidadPuntos
        );

        const indice = Math.floor(posicion);
        const siguiente = Math.min(indice + 1, intima.cantidadPuntos);
        const t = posicion - indice;

        return lerp(
            intima.offsets[indice],
            intima.offsets[siguiente],
            t
        );
    }

    processLDLInfiltration() {
        const a = this.arteria;
        const ldls = this.getAgentsOfType(LDL);

        for (const ldl of ldls) {
            if (ldl.state !== "normal") {
                continue;
            }

            const xLocal = ldl.pos.x - a.xInicio;

            const offsetSuperior = a.endotelioSuperior.offsetEn(xLocal);
            const offsetInferior = a.endotelioInferior.offsetEn(xLocal);

            const paredSuperior = a.yLumenSuperior + a.altoEndotelio + offsetSuperior;
            const paredInferior = a.yLumenInferior - a.altoEndotelio + offsetInferior;

            const segmentoSuperior = this.getSegmentAt(a.endotelioSuperior, ldl.pos.x);
            const segmentoInferior = this.getSegmentAt(a.endotelioInferior, ldl.pos.x);

            const cercaSuperior = abs(ldl.pos.y - paredSuperior) <= ldl.size + 2;
            const cercaInferior = abs(ldl.pos.y - paredInferior) <= ldl.size + 2;

            let infiltrado = false;

            if (cercaSuperior && segmentoSuperior && segmentoSuperior.isDamage()) {
                ldl.pos.y = a.yLumenSuperior - a.intima.distanciaLumen
                    + this.getIntimaOffsetAt(xLocal);

                infiltrado = true;
            } else if (cercaInferior && segmentoInferior && segmentoInferior.isDamage()) {
                ldl.pos.y = a.yLumenInferior + a.intima.distanciaLumen
                    + this.getIntimaOffsetAt(xLocal);

                infiltrado = true;
            }

            if (infiltrado) {
                ldl.state = "infiltrado";
                ldl.vel.set(0, 0);
                ldl.acc.set(0, 0);
            }
        }
    }

    processLDLOxidation() {
        const ldls = this.getAgentsOfType(LDL);
        const oxidantes = this.getAgentsOfType(Oxidante);

        const distanciaOxidacion = 55;

        for (const ldl of ldls) {
            if (ldl.state !== "infiltrado") {
                continue;
            }

            for (const oxidante of oxidantes) {
                const distancia = p5.Vector.dist(ldl.pos, oxidante.pos);

                if (distancia <= distanciaOxidacion) {
                    ldl.state = "oxidado";
                    break;
                }
            }
        }
    }
}
