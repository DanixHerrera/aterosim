
class GlobuloRojo extends Agent2D {
    constructor(x, y) {
        super(x, y, 20);
        this.vel = createVector(random(0.8, 1.5), 0);
        this.maxSpeed = 1.5;
        this.size = 12;
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

        // Dimensiones
        const ancho = this.size * 2;
        const alto = this.size * 1.5;

        noStroke();

        // Sombra
        fill(100, 15, 30, 45);
        ellipse(1.5, 3, ancho * 1.02, alto * 1.05);

        // Cuerpo
        fill(145, 22, 42);
        ellipse(0, 0, ancho, alto);

        fill(204, 43, 62);
        ellipse(0, -0.5, ancho * 0.94, alto * 0.90);

        // Zona central
        fill(239, 112, 126);
        ellipse(0, -0.5, ancho * 0.55, alto * 0.46);

        // Luz suave
        fill(255, 190, 196, 100);
        ellipse(-ancho * 0.12, -alto * 0.22, ancho * 0.40, alto * 0.16);

        pop();
    }
}
