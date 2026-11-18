
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

    esEstatico(agent) {
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

        this.mantenerOxidantes();
        this.procesarProteccionHDL();
        this.detectCollisions();

        for (const agent of this.agents) {
            if (!this.esEstatico(agent)) {
                agent.limitarAlLumen(this.arteria);
            }
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
        let mag1 = this.esEstatico(a1) ? 0 :
            (a1.mass > 0 ? 1 / a1.mass : 0);
        let mag2 = this.esEstatico(a2) ? 0 :
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
            const mag1 = this.esEstatico(a1) ? 0 :
                (a1.mass > 0 ? 1 / a1.mass : 0);
            const mag2 = this.esEstatico(a2) ? 0 :
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
}
