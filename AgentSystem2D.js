
class AgentSystem2D {
    constructor(arteria, config = {}) {
        this.arteria = arteria;
        this.agents = [];
        this.velocidadFlujo = config.velocidadFlujo ?? 1.5;

        this.config = {
            globulosRojos: config.globulosRojos ?? 12,
            ldl: config.ldl ?? 25,
            hdl: config.hdl ?? 12,
            oxidantes: config.oxidantes ?? 8,
            macrofagos: config.macrofagos ?? 3,
            celulasEspumosas: config.celulasEspumosas ?? 1
        };
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
    }

    display() {
        for (const agent of this.agents) {
            agent.display();
        }
    }

    getAgentsOfType(Type) {
        return this.agents.filter(agent => agent instanceof Type);
    }
}
