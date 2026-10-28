
class HDL extends Agent2D {

    constructor(x, y) {
        super(x, y, 1);

        this.vel = createVector(random(0.7, 1.3), 0);
        this.maxSpeed = 1.3;
        this.size = 5;

        this.state = "normal";
    }

    update() {
        super.update();

        // Movimiento horizontal dentro del lumen
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

        // Sombra
        fill(25, 75, 120, 55);
        circle(1, 1.5, this.size * 2.3);

        // Contorno azul oscuro
        fill(25, 100, 155);
        circle(0, 0, this.size * 2);

        // Cuerpo azul
        fill(65, 165, 220);
        circle(-0.3, -0.3, this.size * 1.65);

        // Pequeños detalles 
        fill(185, 230, 250);
        circle(-1.2, -1, this.size * 0.55);
        circle(1.2, 0.8, this.size * 0.3);

        // Reflejo
        fill(235, 250, 255, 200);
        circle(-1.4, -1.5, this.size * 0.25);

        pop();
    }
}
