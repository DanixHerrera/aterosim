
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

        return createVector(
            random(a.xInicio + margin, a.xInicio + a.ancho - margin),
            random(
                a.yLumenSuperior + margin,
                a.yLumenInferior - margin
            )
        );
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

        const y = a.yLumenInferior + a.intima.distanciaLumen
            + a.intima.grosor / 2 + 8;

        return this.addAgent(CelulaEspumosa, x, y);
    }

    update() {
        for (let i = this.agents.length - 1; i >= 0; i--) {
            const agent = this.agents[i];
            agent.update(this.velocidadFlujo);

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
