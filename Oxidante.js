
class Oxidante extends Agent2D {

    constructor(x, y) {
        super(x, y, 1);
        this.vel = createVector(random(0.8, 1.4), 0);
        this.maxSpeed = 1.4;
        this.size = 5;
    }

    update() {
        super.update();
        this.vel.y = 0;
        if (this.pos.x > width + this.size) {
            this.pos.x = -this.size;
            this.pos.y = random(130, 270);
        }
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);

        noStroke();

        // Sombra
        fill(75, 40, 125, 65);
        circle(1, 1.5, this.size * 2.5);

        // Partícula irregular
        fill(125, 80, 190);
        beginShape();

        for (let i = 0; i < 10; i++) {
            let angulo = TWO_PI * i / 10;
            let radio = (i % 2 === 0)
                ? this.size
                : this.size * 0.55;

            vertex(
                cos(angulo) * radio,
                sin(angulo) * radio
            );
        }

        endShape(CLOSE);

        // Centro iluminado
        fill(205, 175, 245);
        circle(-1, -1, this.size * 0.65);

        pop();
    }
}
