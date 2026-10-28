class Intima {
    constructor() {
        this.grosor = 24;
        this.distanciaLumen = 14;
        this.c = color("#fa5d59");
    }

    display(x, y, ancho) {
        stroke(this.c);
        strokeWeight(this.grosor);
        line(x, y, x + ancho, y);
    }
}