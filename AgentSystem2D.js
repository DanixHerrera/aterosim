
class AgentSystem2D {
    constructor(arteria, config = {}) {
        this.arteria = arteria;
        this.agents = [];
        this.velocidadFlujo = config.velocidadFlujo ?? 1.5;
        this.damp = 0.15;

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

        this.presionArterial = 115;
        if (config.presionArterial !== undefined) {
            this.presionArterial = config.presionArterial;
        }

        this.ldlMg = 90;
        this.hdlMg = 60;
        if (config.ldlMg !== undefined) {
            this.ldlMg = config.ldlMg;
        }
        if (config.hdlMg !== undefined) {
            this.hdlMg = config.hdlMg;
        }

        this.oxidantesBase = this.config.oxidantes;
        this.oxidantesMax = 60;
        this.proteccionHDLMin = 0.3;
        this.radioInteraccion = 12;
        this.arteria.factorPresion = this.factorPresionArterial();
        this.arteria.presionArterial = this.presionArterial;
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
        this.aplicarPresionArterial(this.presionArterial);
        this.aplicarLDL(this.ldlMg);
        this.aplicarHDL(this.hdlMg);
    }

    factorPresionArterial() {
        if (this.presionArterial < 115) {
            return map(this.presionArterial, 80, 115, 0.75, 1);
        }

        return map(this.presionArterial, 115, 200, 1, 1.8);
    }

    aplicarPresionArterial(nivel) {
        this.presionArterial = constrain(nivel, 80, 200);
        this.arteria.presionArterial = this.presionArterial;
        this.arteria.factorPresion = this.factorPresionArterial();
    }

    aplicarLDL(nivel) {
        this.ldlMg = constrain(nivel, 50, 220);
        let deseados = round(map(this.ldlMg, 50, 220, 25, 140));
        this.ajustarLDL(deseados);
    }

    aplicarHDL(nivel) {
        this.hdlMg = constrain(nivel, 20, 100);
        let deseados = round(map(this.hdlMg, 20, 100, 4, 30));
        this.ajustarCantidad(HDL, deseados);
    }

    ajustarCantidad(Type, deseados) {
        let agentes = this.getAgentsOfType(Type);

        while (agentes.length < deseados) {
            let pos = this.randomLumenPosition(10);
            this.addAgent(Type, pos.x, pos.y);
            agentes = this.getAgentsOfType(Type);
        }

        while (agentes.length > deseados) {
            let ultimo = agentes[agentes.length - 1];
            let indice = this.agents.indexOf(ultimo);

            if (indice !== -1) {
                this.agents.splice(indice, 1);
            }

            agentes = this.getAgentsOfType(Type);
        }
    }

    ajustarLDL(deseados) {
        let ldlsNormales = this.agents.filter(agent =>
            agent instanceof LDL && agent.state === "normal"
        );

        while (ldlsNormales.length < deseados) {
            let pos = this.randomLumenPosition(10);
            this.addAgent(LDL, pos.x, pos.y);
            ldlsNormales = this.agents.filter(agent =>
                agent instanceof LDL && agent.state === "normal"
            );
        }

        while (ldlsNormales.length > deseados) {
            let eliminable = ldlsNormales[ldlsNormales.length - 1];
            let indice = this.agents.indexOf(eliminable);
            if (indice !== -1) {
                this.agents.splice(indice, 1);
            }

            ldlsNormales = this.agents.filter(agent =>
                agent instanceof LDL && agent.state === "normal"
            );
        }
    }

    mantenerLDL() {
        let deseados = round(map(this.ldlMg, 50, 220, 25, 140));
        this.ajustarLDL(deseados);
    }

    calcularProbabilidadInfiltracion(segmentoSuperior, segmentoInferior) {
        let segmento = null;

        if (segmentoSuperior && segmentoSuperior.isDamage()) {
            segmento = segmentoSuperior;
        }

        if (segmentoInferior && segmentoInferior.isDamage()
            && (!segmento || segmentoInferior.desgaste > segmento.desgaste)) {
            segmento = segmentoInferior;
        }

        if (!segmento) {
            return 0;
        }

        let factorDano = map(segmento.desgaste, 0.3, 1, 0.06, 0.18);
        let factorLDL = map(this.ldlMg, 50, 220, 0.75, 1.30);
        let factorPresion = map(this.presionArterial, 80, 200, 0.75, 1.30);
        let factorTabaquismo = map(this.tabaquismo, 0, 100, 1, 1.25);
        let factorHDL = map(this.hdlMg, 20, 100, 1.20, 0.80);

        let probabilidad = factorDano
            * factorLDL
            * factorPresion
            * factorTabaquismo
            * factorHDL;

        return constrain(probabilidad, 0.02, 0.28);
    }

    cantidadOxidantesDeseada() {
        let cantidad = this.oxidantesBase
            + (this.oxidantesMax - this.oxidantesBase) * this.tabaquismo / 100;

        return Math.round(cantidad);
    }

    factorProteccionHDL() {
        let factorTabaquismo = map(this.tabaquismo, 0, 100, 1, this.proteccionHDLMin);
        let factorHDL = map(this.hdlMg, 20, 100, 0.65, 1.15);

        return constrain(factorTabaquismo * factorHDL, 0.1, 1);
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

    mantenerMacrofagos() {
        let macrofagos = this.agents.filter(agent =>
            agent instanceof Macrofago && !(agent instanceof CelulaEspumosa)
        );

        while (macrofagos.length < this.config.macrofagos) {
            let pos = this.randomLeftPosition();
            this.addAgent(Macrofago, pos.x, pos.y);
            macrofagos = this.agents.filter(agent =>
                agent instanceof Macrofago && !(agent instanceof CelulaEspumosa)
            );
        }
    }

    randomLeftPosition(margin = 10) {
        const a = this.arteria;
        const x = a.xInicio - random(0, 18) - margin;
        const xLocal = constrain(x - a.xInicio, 0, a.ancho);
        const offsetSuperior = a.endotelioSuperior.offsetEn(xLocal);
        const offsetInferior = a.endotelioInferior.offsetEn(xLocal);
        const top = a.yLumenSuperior + a.altoEndotelio + margin + offsetSuperior;
        const bottom = a.yLumenInferior - a.altoEndotelio - margin + offsetInferior;

        return createVector(
            x,
            random(Math.min(top, bottom), Math.max(top, bottom))
        );
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

    convertirEnCelulaEspumosa(macrofago) {
        const a = this.arteria;
        const lado = a.paredMasCercana(macrofago.pos);
        let endotelio = a.endotelioSuperior;
        if (lado === "inferior") {
            endotelio = a.endotelioInferior;
        }

        const xLocal = constrain(macrofago.pos.x - a.xInicio, 0, a.ancho);
        const indice = endotelio.indiceEn(xLocal);
        const segmento = endotelio.segmentos[indice];

        const pos = a.posicionEnIntima(indice, lado, segmento.celulasEspumosas);
        const celula = new CelulaEspumosa(pos.x, pos.y);
        celula.arteria = a;
        celula.segmento = segmento;

        if (!a.segmentoSaturado(indice)) {
            segmento.celulasEspumosas++;
        }

        return celula;
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
                if (agent.estaLleno()) {
                    this.agents[i] = this.convertirEnCelulaEspumosa(agent);
                    continue;
                }
            } else {
                agent.update(this.velocidadFlujo);
            }
            if (agent.isDead()) {
                this.agents.splice(i, 1);
            }
        }

        this.procesarProteccionHDL();
        this.mantenerOxidantes();
        this.mantenerMacrofagos();
        this.mantenerLDL();
        this.processLDLInfiltration();
        this.processLDLOxidation();
        this.limitarLDLOxidadosPorZona();
        this.processPresionImpactos();
        this.detectCollisions();

        for (const agent of this.agents) {
            if (this.isStatic(agent)) {
                continue;
            }

            if (agent instanceof LDL && agent.state !== "normal") {
                continue;
            }

            agent.limitarAvancePorPlaca(this.arteria, agent.lastPos.x);
            agent.limitarAlLumen(this.arteria);
        }
    }

    display() {
        let celulasVisibles = new Map();
        let ldlsVisibles = new Map();

        for (const agent of this.agents) {
            if (agent instanceof CelulaEspumosa) {
                let segmento = agent.segmento;
                let cantidad = celulasVisibles.get(segmento) ?? 0;

                if (cantidad >= 1) {
                    continue;
                }

                celulasVisibles.set(segmento, cantidad + 1);
            }

            if (agent instanceof LDL
                && (agent.state === "infiltrado" || agent.state === "oxidado")) {
                const lado = this.arteria.paredMasCercana(agent.pos);
                const endotelio = lado === "inferior"
                    ? this.arteria.endotelioInferior
                    : this.arteria.endotelioSuperior;
                const xLocal = constrain(agent.pos.x - this.arteria.xInicio, 0, this.arteria.ancho);
                const indice = endotelio.indiceEn(xLocal);
                const clave = lado + ":" + indice;
                const cantidad = ldlsVisibles.get(clave) ?? 0;

                if (cantidad >= 1) {
                    continue;
                }

                ldlsVisibles.set(clave, cantidad + 1);
            }

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
        if (a1 instanceof Macrofago && a1.inIntima
            && (this.isStatic(a2) || a2 instanceof Macrofago)) {
            return;
        }

        if (a2 instanceof Macrofago && a2.inIntima
            && (this.isStatic(a1) || a1 instanceof Macrofago)) {
            return;
        }

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
            if (mag4 <= 0) {
                const impulso = -(1 + this.damp) * mag4 / mag3;
                let vel4 = p5.Vector.mult(dif, impulso);
                a1.vel.add(p5.Vector.mult(vel4, mag1));
                a2.vel.sub(p5.Vector.mult(vel4, mag2));
            }
            if (!a1.inIntima) a1.vel.x = Math.max(0, a1.vel.x);
            if (!a2.inIntima) a2.vel.x = Math.max(0, a2.vel.x);
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

            if (ldl.infiltracionCooldown === undefined) {
                ldl.infiltracionCooldown = 0;
            }

            if (ldl.infiltracionCooldown > 0) {
                ldl.infiltracionCooldown--;
                continue;
            }

            const xLocal = ldl.pos.x - a.xInicio;

            const offsetSuperior = a.endotelioSuperior.offsetEn(xLocal);
            const offsetInferior = a.endotelioInferior.offsetEn(xLocal);
            const placaSuperior = a.endotelioSuperior.placaEn(xLocal);
            const placaInferior = a.endotelioInferior.placaEn(xLocal);

            const paredSuperior = a.yLumenSuperior + a.altoEndotelio
                + offsetSuperior + placaSuperior;
            const paredInferior = a.yLumenInferior - a.altoEndotelio
                + offsetInferior - placaInferior;

            const segmentoSuperior = this.getSegmentAt(a.endotelioSuperior, ldl.pos.x);
            const segmentoInferior = this.getSegmentAt(a.endotelioInferior, ldl.pos.x);

            const cercaSuperior = abs(ldl.pos.y - paredSuperior) <= ldl.size + 2;
            const cercaInferior = abs(ldl.pos.y - paredInferior) <= ldl.size + 2;

            let infiltrado = false;
            let probabilidad = this.calcularProbabilidadInfiltracion(
                segmentoSuperior,
                segmentoInferior
            );

            if (cercaSuperior && segmentoSuperior && segmentoSuperior.isDamage()) {
                if (random(1) >= probabilidad) {
                    ldl.infiltracionCooldown = 30;
                    continue;
                }

                ldl.pos.y = a.yLumenSuperior - a.intima.distanciaLumen
                    + this.getIntimaOffsetAt(xLocal);
                infiltrado = true;
            } else if (cercaInferior && segmentoInferior && segmentoInferior.isDamage()) {
                if (random(1) >= probabilidad) {
                    ldl.infiltracionCooldown = 30;
                    continue;
                }

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

    limitarLDLOxidadosPorZona() {
        const ldlsOxidados = this.getAgentsOfType(LDL).filter(ldl =>
            ldl.state === "oxidado"
        );

        if (ldlsOxidados.length <= 100) {
            return;
        }

        const zonas = new Map();

        for (const ldl of ldlsOxidados) {
            const lado = this.arteria.paredMasCercana(ldl.pos);
            const endotelio = lado === "inferior"
                ? this.arteria.endotelioInferior
                : this.arteria.endotelioSuperior;
            const xLocal = constrain(ldl.pos.x - this.arteria.xInicio, 0, this.arteria.ancho);
            const indice = endotelio.indiceEn(xLocal);
            const clave = lado + ":" + indice;

            if (!zonas.has(clave)) {
                zonas.set(clave, {
                    endotelio: endotelio,
                    indice: indice,
                    ldls: []
                });
            }

            zonas.get(clave).ldls.push(ldl);
        }

        for (const zona of zonas.values()) {
            if (zona.ldls.length < 6) {
                continue;
            }

            if (!zona.endotelio.hayCelulaEspumosaCercana(zona.indice, 3)) {
                continue;
            }

            const exceso = ldlsOxidados.length - 100;
            const porcentaje = 0.40;
            const saturada = this.arteria.segmentoSaturado(zona.indice);
            const objetivo = saturada ? 0 : Math.min(
                zona.ldls.length,
                Math.ceil(exceso * porcentaje)
            );

            for (let i = 0; i < objetivo; i++) {
                const ldl = zona.ldls[i];
                zona.endotelio.segmentos[zona.indice].acumularGrasa(1.5);
                ldl.state = "absorbido";
                ldl.mass = 0;
            }

            const inicioDescarte = objetivo;
            const porcentajeDescarte = 0.35;
            const descartados = Math.min(
                zona.ldls.length - inicioDescarte,
                Math.ceil(exceso * porcentajeDescarte)
            );

            for (let i = inicioDescarte; i < inicioDescarte + descartados; i++) {
                const ldl = zona.ldls[i];
                ldl.state = "absorbido";
                ldl.mass = 0;
            }
        }
    }

    processPresionImpactos() {
            if (this.presionArterial <= 115) {
                return;
            }

            const exceso = this.presionArterial - 115;
            const factorImpacto = exceso / 85;

            for (const agent of this.agents) {
                if (this.isStatic(agent) || (agent instanceof LDL && agent.state !== "normal")) {
                    continue;
                }

                if (agent.impactoCooldown === undefined) {
                    agent.impactoCooldown = 0;
                }

                if (agent.impactoCooldown > 0) {
                    agent.impactoCooldown--;
                    continue;
                }

                if (agent.pos.x < this.arteria.xInicio || agent.pos.x > this.arteria.xInicio + this.arteria.ancho) {
                    continue;
                }

                const xLocal = agent.pos.x - this.arteria.xInicio;
                const paredSuperior = this.arteria.yLumenSuperior
                    + this.arteria.altoEndotelio
                    + this.arteria.endotelioSuperior.offsetEn(xLocal);
                const paredInferior = this.arteria.yLumenInferior
                    - this.arteria.altoEndotelio
                    + this.arteria.endotelioInferior.offsetEn(xLocal);
                const distanciaSuperior = abs(agent.pos.y - paredSuperior);
                const distanciaInferior = abs(agent.pos.y - paredInferior);
                let endotelio = null;

                if (distanciaSuperior <= agent.size + 3 && distanciaSuperior <= distanciaInferior) {
                    endotelio = this.arteria.endotelioSuperior;
                } else if (distanciaInferior <= agent.size + 3) {
                    endotelio = this.arteria.endotelioInferior;
                }

                if (!endotelio) {
                    continue;
                }

                const indice = endotelio.indiceEn(xLocal);
                const segmento = endotelio.segmentos[indice];
                const fuerzaVelocidad = constrain(abs(agent.vel.y) + abs(agent.vel.x) * 0.15, 0.5, 2);
                const incremento = factorImpacto * 0.006 * fuerzaVelocidad;

                segmento.setDesgaste(segmento.desgaste + incremento);

                for (let distancia = 1; distancia <= 2; distancia++) {
                    const desgasteVecino = incremento * 0.6 / distancia;
                    if (indice - distancia >= 0) {
                        const vecino = endotelio.segmentos[indice - distancia];
                        vecino.setDesgaste(vecino.desgaste + desgasteVecino);
                    }
                    if (indice + distancia < endotelio.segmentos.length) {
                        const vecino = endotelio.segmentos[indice + distancia];
                        vecino.setDesgaste(vecino.desgaste + desgasteVecino);
                    }
                }

                agent.impactoCooldown = 18;
            }
        }
}
