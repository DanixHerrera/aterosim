class Segmento {
    constructor(x, ancho, estado) {
        this.x = x;
        this.ancho = ancho;
        this.desgaste = 0;
        this.celulasEspumosas = 0;
        this.placaAltura = 0;
        this.grasaAcumulada = 0;

        if (estado === "dañado") {
            this.desgaste = 1;
        }
    }

    display(y, alto, offsetIzquierda, offsetDerecha, placaIzquierda = 0, placaDerecha = 0, direccionLumen = 1) {
        noStroke();

        let desplazamientoIzquierda = direccionLumen * placaIzquierda;
        let desplazamientoDerecha = direccionLumen * placaDerecha;

        if (placaIzquierda > 0 || placaDerecha > 0) {
            let yBase = y;
            if (direccionLumen < 0) {
                yBase = y + alto;
            }
            fill("#F2C14E");
            beginShape();
            vertex(this.x, yBase + offsetIzquierda);
            vertex(this.x + this.ancho, yBase + offsetDerecha);
            vertex(this.x + this.ancho, yBase + offsetDerecha + desplazamientoDerecha);
            vertex(this.x, yBase + offsetIzquierda + desplazamientoIzquierda);
            endShape(CLOSE);
        }

        if (this.isDamage()) {
            fill("#8f3535");
        } else {
            fill("#FF6B6B");
        }

        beginShape();
        vertex(this.x, y + offsetIzquierda + desplazamientoIzquierda);
        vertex(this.x + this.ancho, y + offsetDerecha + desplazamientoDerecha);
        vertex(this.x + this.ancho, y + alto + offsetDerecha + desplazamientoDerecha);
        vertex(this.x, y + alto + offsetIzquierda + desplazamientoIzquierda);
        endShape(CLOSE);
    }

    setDesgaste(valor) {
        this.desgaste = constrain(valor, 0, 1);
    }

    acumularGrasa(cantidad) {
        this.grasaAcumulada = constrain(this.grasaAcumulada + cantidad, 0, 40);
    }

    damage() {
        this.desgaste = 1;
    }

    isDamage() {
        return this.desgaste >= 0.3;
    }
}