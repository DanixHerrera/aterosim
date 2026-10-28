class Arteria {
    constructor(x, y, ancho, alto) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.endotelio;
        this.intima;
    }

    display() {
        noStroke();
        fill("red");
        rect(this.x, this.y, this.ancho, this.alto);

    }

}