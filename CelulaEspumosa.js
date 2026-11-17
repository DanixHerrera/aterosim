
class CelulaEspumosa extends Macrofago {

    constructor(x, y) {
        super(x, y);

        this.state = "espumosa";
        this.size = 12;
        this.vel.set(0, 0);
        this.segmento = null;
    }

    // La célula espumosa permanece en la íntima
    update() {
        // No se desplaza por el lumen.
        // Más adelante se ubicará en la íntima
        // cuando el macrófago termine de absorber LDL.
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        scale(this.size / 22);

        noStroke();

        fill(90, 60, 30, 45);
        ellipse(2, 3, 22 * 2.2, 22 * 1.9);

        fill(160, 100, 40);
        beginShape();

        for (let i = 0; i < 14; i++) {
            let angulo = TWO_PI * i / 14;
            let variacion = (i % 2 === 0) ? 1 : 0.84;
            let radio = 22 * variacion;

            vertex(cos(angulo) * radio, sin(angulo) * radio);
        }

        endShape(CLOSE);

        fill(225, 170, 95);
        ellipse(0, 0, 22 * 1.6, 22 * 1.4);

        fill(255, 224, 145);
        circle(-9, -7, 9);
        circle(2, -9, 10);
        circle(9, -2, 8);
        circle(-5, 3, 11);
        circle(5, 7, 10);
        circle(-10, 9, 6);
        circle(0, 0, 8);

        fill(125, 75, 45);
        ellipse(-2, -1, 7, 10);

        pop();
    }
}
