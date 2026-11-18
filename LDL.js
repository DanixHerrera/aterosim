
class LDL extends Agent2D {

    constructor(x, y, estado = "normal") {
        super(x, y, 1);
        this.vel = createVector(random(0.8, 1.4), 0);
        this.maxSpeed = 1.4;
        this.size = 7;
        this.r = this.size;
        this.state = estado;
    }

    update(velocidadFlujo) {
        if (this.state === "infiltrado" || this.state === "oxidado") {
            this.vel.set(0, 0);
            this.acc.set(0, 0);

            if (this.arteria) {
                const a = this.arteria;
                const xLocal = constrain(this.pos.x - a.xInicio, 0, a.ancho);
                const lado = a.paredMasCercana(this.pos);
                let centroIntima;
                let limiteExterior;
                let limiteInterior;

                if (lado === "superior") {
                    centroIntima = a.yLumenSuperior - a.intima.distanciaLumen
                        + a.intima.offsetEn(xLocal);
                    limiteExterior = centroIntima - a.intima.grosor / 2 - this.size;
                    limiteInterior = centroIntima + a.intima.grosor / 2 + this.size;
                    if (this.pos.y < limiteExterior) {
                        this.pos.y = limiteExterior;
                        this.vel.y = abs(this.vel.y);
                    }
                } else {
                    centroIntima = a.yLumenInferior + a.intima.distanciaLumen
                        + a.intima.offsetEn(xLocal);
                    limiteExterior = centroIntima + a.intima.grosor / 2 + this.size;
                    limiteInterior = centroIntima - a.intima.grosor / 2 - this.size;
                    if (this.pos.y > limiteExterior) {
                        this.pos.y = limiteExterior;
                        this.vel.y = -abs(this.vel.y);
                    }
                }

                if (this.pos.x < a.xInicio + this.size) {
                    this.pos.x = a.xInicio + this.size;
                    this.vel.x = abs(this.vel.x);
                } else if (this.pos.x > a.xInicio + a.ancho - this.size) {
                    this.pos.x = a.xInicio + a.ancho - this.size;
                    this.vel.x = -abs(this.vel.x);
                }
            }
            return;
        }

        super.update(velocidadFlujo);
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);

        noStroke();

        if (this.state === "oxidado") {
            fill(135, 55, 35);
            circle(0, 0, this.size * 2);

            fill(205, 100, 55);
            circle(-1, -1, this.size * 1.35);

            fill(245, 165, 105);
            circle(-1.5, -1.5, this.size * 0.55);

        } else {
            fill(135, 85, 25, 80);
            circle(1, 1.5, this.size * 2.2);

            fill(190, 125, 30);
            circle(0, 0, this.size * 2);

            fill(235, 180, 65);
            circle(-0.5, -0.5, this.size * 1.65);

            fill(255, 218, 125);
            circle(-1.5, -1.5, this.size * 0.8);

            fill(255, 240, 190, 180);
            circle(-2, -2, this.size * 0.35);
        }

        pop();
    }
}
