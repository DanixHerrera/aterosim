class Segmento {
    constructor(x, ancho, estado) {
        this.x = x;
        this.ancho = ancho;
        this.estado = estado || "sano";
    }

    display(y, alto) {
        noStroke();
        fill(this.isDamage() ? "#8f3535" : "#fc817d");
        rect(this.x, y, this.ancho, alto);
    }

    damage() {
        this.estado = "dañado";
    }

    isDamage() {
        return this.estado === "dañado";
    }
}