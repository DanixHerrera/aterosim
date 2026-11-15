class Segmento {
    constructor(x, ancho, estado) {
        this.x = x;
        this.ancho = ancho;
        this.desgaste = 0;

        if (estado === "dañado") {
            this.desgaste = 1;
        }
    }

    display(y, alto, offsetIzquierda, offsetDerecha) {
        noStroke();

        if (this.isDamage()) {
            fill("#8f3535");
        } else {
            fill("#FF6B6B");
        }

        beginShape();
        vertex(this.x, y + offsetIzquierda);
        vertex(this.x + this.ancho, y + offsetDerecha);
        vertex(this.x + this.ancho, y + alto + offsetDerecha);
        vertex(this.x, y + alto + offsetIzquierda);
        endShape(CLOSE);
    }

    setDesgaste(valor) {
        this.desgaste = constrain(valor, 0, 1);
    }

    damage() {
        this.desgaste = 1;
    }

    isDamage() {
        return this.desgaste >= 0.3;
    }
}