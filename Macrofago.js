
class Macrofago extends Agent2D {

    constructor(x, y) {
        super(x, y, 8);

        this.vel = createVector(random(0.5, 0.9), 0);
        this.maxSpeed = 1.5;
        this.maxSteeringForce = 0.15;
        this.size = 10;
        this.radioDeteccion = 100;
        this.arrivalDist = 120;
        this.objetivo = null;

        this.capacidadAbsorcion = 3;
        this.ldlAbsorbidos = 0;
        this.margenAbsorcion = 4;

        this.state = "normal";
    }

    estaLleno() {
        return this.ldlAbsorbidos >= this.capacidadAbsorcion;
    }

    absorber(ldl) {
        if (this.estaLleno() || ldl.state !== "oxidado") {
            return false;
        }
        const distancia = p5.Vector.dist(this.pos, ldl.pos);
        if (distancia > this.r + ldl.r + this.margenAbsorcion) {
            return false;
        }
        ldl.state = "absorbido";
        ldl.mass = 0;
        this.ldlAbsorbidos++;
        return true;
    }

    detectar(ldls) {
        if (this.estaLleno()) {
            this.objetivo = null;
            this.state = "lleno";
            return;
        }
        let objetivo = null;
        let distanciaMinima = this.radioDeteccion;
        for (const ldl of ldls) {
            if (ldl.state !== "oxidado") {
                continue;
            }
            const distancia = p5.Vector.dist(this.pos, ldl.pos);
            if (distancia <= distanciaMinima) {
                distanciaMinima = distancia;
                objetivo = ldl;
            }
        }
        this.objetivo = objetivo;
        this.state = objetivo ? "persiguiendo" : "normal";
    }

    update(velocidadFlujo, ldls = []) {
        this.detectar(ldls);
        if (this.objetivo) {
            this.arrive(this.objetivo.pos);
        }
        super.update(velocidadFlujo);
        if (this.objetivo) {
            this.absorber(this.objetivo);
        }
    }

    seguirFlujo(arteria, velocidadFlujo) {
        if (!this.objetivo) {
            super.seguirFlujo(arteria, velocidadFlujo);
        }
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        let escala = this.size / 19;
        scale(escala);
        noStroke();
        fill(70, 75, 85, 40);
        ellipse(2, 3, 19 * 2.2, 19 * 1.9);
        fill(125, 132, 143);
        beginShape();
            for (let i = 0; i < 14; i++) {
                let angulo = TWO_PI * i / 14;
                let variacion = (i % 2 === 0) ? 1 : 0.84;
                let radio = 19 * variacion;
                vertex(cos(angulo) * radio, sin(angulo) * radio);
            }
        endShape(CLOSE);
        fill(190, 195, 203);
        ellipse(0, 0, 19 * 1.55, 19 * 1.4);
        fill(85, 91, 103);
        ellipse(-3, -2, 11, 13);
        ellipse(4, -3, 10, 11);
        ellipse(1, 4, 10, 9);
        fill(225, 228, 234);
        circle(-10, 3, 4);
        circle(9, 5, 5);
        circle(2, -10, 3);

        const gotas = [[-7, 6], [7, 1], [-1, -8]];
        fill(255, 214, 110);
        for (let i = 0; i < this.ldlAbsorbidos && i < gotas.length; i++) {
            circle(gotas[i][0], gotas[i][1], 8);
        }
        pop();
    }
}
