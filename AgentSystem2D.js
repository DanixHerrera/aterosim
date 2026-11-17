
class AgentSystem2D {
    constructor(arteria, config = {}) {
        this.arteria = arteria;
        this.agents = [];
        this.velocidadFlujo = config.velocidadFlujo ?? 1.5;
        this.damp = 0.3;

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
        this.detectCollisions();
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
        if (dif.magSq() === 0)
            dif = createVector(1, 0);
        let distancia = dif.mag();
        let distanciaMinima = a1.r + a2.r;
        dif.normalize();
        dif.setMag(distanciaMinima - distancia);
        a1.pos.add(dif);
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

            const mag1 = a1.mass > 0 ? 1 / a1.mass : 0;
            const mag2 = a2.mass > 0 ? 1 / a2.mass : 0;

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
