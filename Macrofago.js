
class Macrofago extends Agent2D {

    constructor(x, y) {
        super(x, y, 8);

        this.vel = createVector(random(0.5, 0.9), 0);
        this.maxSpeed = 1.5;
        this.maxSpeedObjetivo = 3.2;
        this.maxSteeringForce = 0.15;
        this.size = 10;
        this.radioDeteccion = 180;
        this.arrivalDist = 120;
        this.objetivo = null;

        this.capacidadAbsorcion = 3;
        this.ldlAbsorbidos = 0;
        this.margenAbsorcion = 4;
        this.inIntima = false;

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

        if (this.arteria) {
            const lado = this.arteria.paredMasCercana(this.pos);
            let endotelio = lado === "inferior"
                ? this.arteria.endotelioInferior
                : this.arteria.endotelioSuperior;
            const xLocal = constrain(this.pos.x - this.arteria.xInicio, 0, this.arteria.ancho);
            const indice = endotelio.indiceEn(xLocal);
            endotelio.segmentos[indice].acumularGrasa(0.8);
        }

        return true;
    }

    soltarObjetivo() {
        if (this.objetivo && this.objetivo.reservadoPor === this) {
            this.objetivo.reservadoPor = null;
        }
        this.objetivo = null;
    }

    detectar(ldls) {
        if (this.estaLleno()) {
            this.soltarObjetivo();
            this.state = "lleno";
            return;
        }

        let objetivo = null;
        let distanciaMinima = this.radioDeteccion;
        for (const ldl of ldls) {
            if (ldl.state !== "oxidado") {
                continue;
            }
            if (ldl.reservadoPor && ldl.reservadoPor !== this) {
                continue;
            }
            const distancia = p5.Vector.dist(this.pos, ldl.pos);
            if (distancia <= distanciaMinima) {
                distanciaMinima = distancia;
                objetivo = ldl;
            }
        }
        if (objetivo !== this.objetivo) {
            this.soltarObjetivo();
            if (objetivo) {
                objetivo.reservadoPor = this;
            }
        }
        this.objetivo = objetivo;
        this.state = objetivo ? "persiguiendo" : "normal";
    }

    update(velocidadFlujo, ldls = []) {
        this.detectar(ldls);
        if (this.objetivo) {
            this.vel.limit(this.maxSpeedObjetivo);
            this.arrive(this.objetivo.pos);
            if (this.arteria && !this.arteria.dentroDelLumen(this.objetivo.pos)) {
                this.inIntima = true;
            }
        }
        super.update(velocidadFlujo);
        if (this.objetivo) {
            this.absorber(this.objetivo);
        }

        if (!this.objetivo && this.arteria
            && !this.arteria.dentroDelLumen(this.pos)) {
            super.limitarAlLumen(this.arteria);
        }
    }

    limitarAlLumen(arteria) {
        if (this.inIntima && this.objetivo) {
            const xLocal = constrain(this.pos.x - arteria.xInicio, 0, arteria.ancho);
            const lado = arteria.paredMasCercana(this.objetivo.pos);
            let centroIntima;
            let limiteExterior;

            if (lado === "superior") {
                centroIntima = arteria.yLumenSuperior - arteria.intima.distanciaLumen
                    + arteria.intima.offsetEn(xLocal);
                limiteExterior = centroIntima - arteria.intima.grosor / 2 - this.size;

                if (this.pos.y < limiteExterior) {
                    this.pos.y = limiteExterior;
                    this.vel.y = abs(this.vel.y);
                }
            } else {
                centroIntima = arteria.yLumenInferior + arteria.intima.distanciaLumen
                    + arteria.intima.offsetEn(xLocal);
                limiteExterior = centroIntima + arteria.intima.grosor / 2 + this.size;

                if (this.pos.y > limiteExterior) {
                    this.pos.y = limiteExterior;
                    this.vel.y = -abs(this.vel.y);
                }
            }

            if (this.pos.x < arteria.xInicio + this.size) {
                this.pos.x = arteria.xInicio + this.size;
                this.vel.x = abs(this.vel.x);
            } else if (this.pos.x > arteria.xInicio + arteria.ancho - this.size) {
                this.pos.x = arteria.xInicio + arteria.ancho - this.size;
                this.vel.x = -abs(this.vel.x);
            }
            return;
        }
        super.limitarAlLumen(arteria);
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
