const BorderBehaviour = {
    BORDERS : "BORDERS",
    WRAP : "WRAP",
    NONE : "NONE"
}

class Agent2D {
    static drawRatio = 5;
    static img;
    constructor(x, y, mass) {
        this.pos = createVector(x, y);
        this.lastPos = this.pos.copy();
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mass = mass < 0? 0 : mass;
        this.massLoss = 0;
        this.c = color(0, 0, 0);
        this.r = sqrt(this.mass / PI) * Agent2D.drawRatio;
        this.borderBehaviour = BorderBehaviour.NONE;
        this.borderDamp = 0.8;
        this.maxSteeringForce = 0.01;
        this.maxSpeed = 1;
        this.arrivalDist = 200;

        this.wanderLookAhead = 70;
        this.wanderRadius = 50;
        this.wanderNoiseT = random(10);
        this.wanderNoiseInc = 0.01;

        this.size = this.r;
        this.state = "normal";
        this.arteria = null;
        this.coefflujo = 0.05;
        this.turbulencia = 0.03;
        this.ruidoT = random(1000);

    }
    static createRandomVel(x, y, mass, velMag) {
        let agent = new Agent2D(x, y, mass);
        let v = p5.Vector.random2D();
        v.setMag(velMag);
        agent.vel.add(v);
        return agent;
    }
    static createRandomPos(mass = 1) {
        let agent = new Agent2D(random(width), random(height), mass);
        return agent;
    }
    update(velocidadFlujo = 0) {

        if (this.arteria) {
            this.seguirFlujo(this.arteria, velocidadFlujo);
        }


        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;
        this.vel.add(this.acc);
        let factorVelocidad = 1;
        if (this.arteria) {
            let presion = this.arteria.presionArterial ?? 120;
            factorVelocidad = presion >= 120
                ? map(presion, 120, 200, 1, 1.35)
                : map(presion, 80, 120, 0.90, 1);
        }
        this.vel.limit(this.maxSpeed * factorVelocidad);
        this.pos.add(this.vel);
        if (this.arteria) {
            this.limitarAvancePorPlaca(this.arteria, this.lastPos.x);
        }
        this.acc.mult(0);
        this.borders();
        this.mass -= this.massLoss;
        this.r = sqrt(this.mass / PI) * Agent2D.drawRatio;

        if (this.arteria) {
            this.limitarAlLumen(this.arteria);
            if (this.salioDerecha(this.arteria)) {
                this.reaparecerIzquierda(this.arteria);
            }
        }
    }
    display() {
        stroke(this.c);
        strokeWeight(this.r * 2)
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        beginShape();
        vertex(-this.r/3, -this.r/2);
        vertex(-this.r/3, this.r/2);
        vertex(3 * this.r/3, 0);
        endShape(CLOSE);
        pop();
    }
    borders() {
        switch (this.borderBehaviour) {
            case BorderBehaviour.BORDERS:
                if (this.pos.x < this.r || this.pos.x > width - this.r)
                    this.vel.x *= -this.borderDamp;
                if (this.pos.y < this.r || this.pos.y > height - this.r)
                    this.vel.y *= -this.borderDamp;
                this.pos.x = constrain(this.pos.x, this.r, width - this.r);
                this.pos.y = constrain(this.pos.y, this.r, height - this.r);
                break;
            case BorderBehaviour.WRAP:
                if (this.pos.x > width + this.r) this.pos.x = -this.r;
                if (this.pos.x < -this.r) this.pos.x = width + this.r;
                if (this.pos.y > height + this.r) this.pos.y = -this.r;
                if (this.pos.y < -this.r) this.pos.y = height + this.r;
                break;
            case BorderBehaviour.NONE:
                break;
        }
    }
    addForce(f) {
        let force = p5.Vector.div(f, this.mass);
        this.acc.add(force);
    }
    applyGravity(g) {
        this.acc.add(g);
    }
    applyFriction(m) {
        let fric = this.vel.copy();
        fric.normalize();
        fric.mult(-m);
        this.addForce(fric);
    }
    applyDrag(d) {
        let drag = this.vel.copy();
        drag.normalize();
        drag.mult(this.vel.mag()**2 * -d);
        this.addForce(drag);
    }
    isDead() {
        return this.mass <= 0;
    }
    seek(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let steering = p5.Vector.sub(desired, this.vel);
        steering.limit(this.maxSteeringForce);
        this.addForce(steering);
    }
    arrive(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let steering = p5.Vector.sub(desired, this.vel);
        steering.limit(this.maxSteeringForce);
        this.addForce(steering);
        let dist = p5.Vector.dist(this.pos, target);
        let speed = map(dist, 0, this.arrivalDist, 0,this.maxSpeed);
        this.vel.limit(speed);
    }
    wander() {
        let future = this.vel.copy();
        future.setMag(this.wanderLookAhead);
        let r = this.vel.copy();
        r.setMag(this.wanderRadius);
        r.rotate(map(noise(this.wanderNoiseT), 0, 1, -PI, PI));
        this.wanderDebug(future, r);
        this.wanderNoiseT += this.wanderNoiseInc;
        r.add(future);
        r.add(this.pos);
        this.seek(r);
    }
    wanderDebug(future, r) {
        push();
        stroke(255);
        strokeWeight(1);
        noFill();
        translate(this.pos.x, this.pos.y);
        line(0, 0, future.x, future.y);
        translate(future.x, future.y);
        ellipse(0, 0, r.mag() * 2);
        translate(r.x, r.y);
        ellipse(0, 0, 5);
        pop();     
    }
    getNormalPoint(position, a, b) {
        let vectorA = p5.Vector.sub(position, a)
        let vectorB = p5.Vector.sub(b, a)
        vectorB.normalize();
        vectorB.mult(vectorA.dot(vectorB));
        let normalPoint = p5.Vector.add(a, vectorB)
        return normalPoint;
    }
    follow(segment) {
        let future = this.vel.copy()
        future.setMag(25)
        future.add(this.pos)
        
        let normalPoint = this.getNormalPoint(future, segment.start, segment.end)

        let v2 = p5.Vector.sub(segment.end, segment.start)
        v2.setMag(25)
        let target = p5.Vector.add(normalPoint, v2)

        let distance = p5.Vector.dist(normalPoint, future)

        if (distance > segment.r) {
            this.seek(target)
        }
    }

    limitesLumen (arteria) {
        let xLocal = this.pos.x - arteria.xInicio;
        let offsetSuperior = arteria.endotelioSuperior.offsetEn(xLocal);
        let offsetInferior = arteria.endotelioInferior.offsetEn(xLocal);
        let placaSuperior = arteria.endotelioSuperior.placaEn(xLocal);
        let placaInferior = arteria.endotelioInferior.placaEn(xLocal);

        let top = arteria.yLumenSuperior + arteria.altoEndotelio + this.size + offsetSuperior + placaSuperior;
        let bottom = arteria.yLumenInferior - arteria.altoEndotelio - this.size + offsetInferior - placaInferior;

        if (top > bottom) {
            let medio = (top + bottom) / 2;
            top = medio;
            bottom = medio;
        }

        return { top: top, bottom: bottom };
    }

    limitarAvancePorPlaca(arteria, xAnterior = this.lastPos.x) {
        this.bloqueadoPorPlaca = false;
        if (this.inIntima || this.state === "infiltrado" || this.state === "oxidado") {
            return;
        }

        const radio = this.size;
        const inicio = Math.max(xAnterior, arteria.xInicio);
        const final = Math.min(this.pos.x + radio, arteria.xInicio + arteria.ancho);

        if (final <= inicio) return;

        const paso = 1;
        for (let x = inicio; x <= final; x += paso) {
            const xLocal = constrain(x - arteria.xInicio, 0, arteria.ancho);
            const paredSuperior = arteria.yLumenSuperior + arteria.altoEndotelio
                + arteria.endotelioSuperior.offsetEn(xLocal)
                + arteria.endotelioSuperior.placaEn(xLocal);
            const paredInferior = arteria.yLumenInferior - arteria.altoEndotelio
                + arteria.endotelioInferior.offsetEn(xLocal)
                - arteria.endotelioInferior.placaEn(xLocal);
            const espacioDisponible = paredInferior - paredSuperior;

            if (espacioDisponible < radio * 2) {
                const limiteX = x - radio - 0.5;
                if (this.pos.x > limiteX) {
                    this.pos.x = limiteX;
                    if (this.vel.x > 0) this.vel.x = 0;
                }
                this.bloqueadoPorPlaca = true;
                return;
            }
        }
    }

    seguirFlujo(arteria, velocidadFlujo) {
        let xLocal = constrain(this.pos.x - arteria.xInicio, 0, arteria.ancho);
        let offsetSuperior = arteria.endotelioSuperior.offsetEn(xLocal);
        let offsetInferior = arteria.endotelioInferior.offsetEn(xLocal);
        const placaSuperior = arteria.endotelioSuperior.placaEn(xLocal);
        const placaInferior = arteria.endotelioInferior.placaEn(xLocal);
        let paredSuperior = arteria.yLumenSuperior + arteria.altoEndotelio + offsetSuperior + placaSuperior;
        let paredInferior = arteria.yLumenInferior - arteria.altoEndotelio + offsetInferior  - placaInferior;
        let centroY = (paredSuperior + paredInferior) / 2;
        let radio = Math.max(1, (paredInferior - paredSuperior) / 2);
        let d = (this.pos.y - centroY) / radio;
        const distanciaAnticipacion = Math.max(this.size * 2.5, this.vel.x * 4);
        const xFuturo = constrain(this.pos.x + distanciaAnticipacion - arteria.xInicio, 0, arteria.ancho);
        const huecoFuturo = arteria.yLumenInferior - arteria.altoEndotelio
            + arteria.endotelioInferior.offsetEn(xFuturo)
            - arteria.endotelioInferior.placaEn(xFuturo)
            - (arteria.yLumenSuperior + arteria.altoEndotelio
                + arteria.endotelioSuperior.offsetEn(xFuturo)
                + arteria.endotelioSuperior.placaEn(xFuturo));

        const espacioNecesario = this.size * 2;
        const factorPaso = constrain((huecoFuturo - espacioNecesario) / Math.max(espacioNecesario, 1), 0, 1);        
        let factorPresion = arteria.factorPresion ?? 1;
        const desired = createVector(velocidadFlujo * factorPresion * Math.max(0, 1 - d * d) * factorPaso, 0);        
        let steering = p5.Vector.sub(desired, this.vel);
        steering.mult(this.coefflujo);
        this.applyGravity(steering);

        if (factorPaso < 1) {
            this.vel.x *= lerp(0.78, 0.94, factorPaso);
        }
        this.vel.x = Math.max(0, this.vel.x);

        let empuje = map(noise(this.ruidoT), 0, 1, -this.turbulencia, this.turbulencia);
        this.ruidoT += 0.01;
        this.applyGravity(createVector(0, empuje));

    }

    limitarAlLumen(arteria) {
        let limites = this.limitesLumen(arteria);
        if (this.pos.y < limites.top || this.pos.y > limites.bottom)
            this.vel.y *= -this.borderDamp;
        this.pos.y = constrain(this.pos.y, limites.top, limites.bottom);
    }

    salioDerecha(arteria) {
        return this.pos.x > arteria.xInicio + arteria.ancho + this.size;
    }

    reaparecerIzquierda(arteria) {
        this.pos.x = arteria.xInicio - this.size;
        let limites = this.limitesLumen(arteria);
        this.pos.y = random(limites.top, limites.bottom);
    }

    touch(a) {
        let dif = p5.Vector.sub(a.pos, this.pos)
        return dif.mag() < this.r + a.r
    }
}