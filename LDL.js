
class LDL extends Agent2D {

    constructor(x, y) {
        super(x, y, 1);
        this.vel = createVector(random(0.8, 1.4), 0);
        this.maxSpeed = 1.4;
        this.size = 7;
        this.state = "normal";
    }

    update() {
        super.update();

        this.vel.y = 0;

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
