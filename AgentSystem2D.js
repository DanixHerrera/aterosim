
class AgentSystem2D {
    constructor(config = {}) {
        // Cantidad inicial de cada tipo de agente.
        this.config = {
            globulosRojos: config.globulosRojos ?? 12,
            ldl: config.ldl ?? 25,
            hdl: config.hdl ?? 12,
            oxidantes: config.oxidantes ?? 8,
            macrofagos: config.macrofagos ?? 3
        };
        this.agents = [];
        this.lumen = {
            top: 125,
            bottom: 275
        };
        this.intima = {
            top: 310,
            bottom: 385
        };
        this.initialized = false;
    }

    initialize() {
        this.agents = [];

        this.createAgents(
            "globuloRojo",
            this.config.globulosRojos
        );

        this.createAgents("ldl", this.config.ldl);
        this.createAgents("hdl", this.config.hdl);
        this.createAgents(
            "oxidante",
            this.config.oxidantes
        );
        this.createAgents(
            "macrofago",
            this.config.macrofagos
        );

        this.addAgent(
            "celulaEspumosa",
            width * 0.5,
            this.intima.top + 20
        );

        this.initialized = true;
    }
    createAgents(type, quantity) {
        for (let i = 0; i < quantity; i++) {
            const x = random(width);
            const y = random(
                this.lumen.top + 10,
                this.lumen.bottom - 10
            );

            this.addAgent(type, x, y);
        }
    }
    addAgent(type, x, y) {
        let agent;

        switch (type) {
            case "globuloRojo":
                agent = new GlobuloRojo(x, y);
                break;

            case "ldl":
                agent = new LDL(x, y);
                break;

            case "hdl":
                agent = new HDL(x, y);
                break;

            case "oxidante":
                agent = new Oxidante(x, y);
                break;

            case "macrofago":
                agent = new Macrofago(x, y);
                break;

            case "celulaEspumosa":
                agent = new CelulaEspumosa(x, y);
                break;

            default:
                throw new Error(
                    `Tipo de agente desconocido: ${type}`
                );
        }

        this.agents.push(agent);
        return agent;
    }
    update() {
        for (let i = this.agents.length - 1; i >= 0; i--) {
            const agent = this.agents[i];

            agent.update();

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
        return this.agents.filter(
            agent => agent instanceof Type
        );
    }
    countAgents(Type) {
        return this.getAgentsOfType(Type).length;
    }
    clear() {
        this.agents = [];
        this.initialized = false;
    }
}
