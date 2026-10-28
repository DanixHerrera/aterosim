
class Macrofago extends Agent2D {

    constructor(x, y) {
        super(x, y, 8);

        this.vel = createVector(random(0.5, 0.9), 0);
        this.maxSpeed = 0.9;
        this.size = 19;

        this.state = "normal";
    }

    update() {
        this.vel.y = 0;

        super.update();
        if (this.arteria && this.pos.x > this.arteria.xInicio + this.arteria.ancho) {
            this.pos.x = this.arteria.xInicio - this.r;

            this.pos.y = random(
                this.arteria.yLumenSuperior + this.r,
                this.arteria.yLumenInferior - this.r
            );
        }
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        noStroke();
        fill(40, 90, 55, 45);
        ellipse(2, 3, this.size * 2.2, this.size * 1.9);
        fill(35, 115, 70);
        beginShape();
        for (let i = 0; i < 14; i++) {
            let angulo = TWO_PI * i / 14;

            let variacion = (i % 2 === 0) ? 1 : 0.84;
            let radio = this.size * variacion;

            vertex(cos(angulo) * radio, sin(angulo) * radio);
        }
        endShape(CLOSE);
        fill(95, 190, 120);
        ellipse(0, 0, this.size * 1.55, this.size * 1.4);
        fill(40, 105, 70);
        ellipse(-3, -2, 11, 13);
        ellipse(4, -3, 10, 11);
        ellipse(1, 4, 10, 9);
        fill(190, 235, 170);
        circle(-10, 3, 4);
        circle(9, 5, 5);
        circle(2, -10, 3);
        pop();
    }
}
