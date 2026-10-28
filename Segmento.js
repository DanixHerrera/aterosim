class Segmento {
    constructor(x, ancho, estado) {
        this.x = x;
        this.ancho = ancho;
        this.estado = estado;
        this.c = color("#fc817d");
    }

    display(y, alto) {
        noStroke();
        fill(this.c);
        rect(this.x, y, this.ancho, alto);
    }

    damage() {
        
    }

    isDamage() {
        return false;
    }


}