class Arteria {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ancho = width;
        this.alto = height;

        this.altoLumen = 180;
        this.altoEndotelio = 8;

        this.xInicio = this.x - this.ancho / 2;

        this.yLumenSuperior = this.y - this.altoLumen / 2;
        this.yLumenInferior = this.y + this.altoLumen / 2;

        this.perlinAmplitudEndotelio = 50;
        this.perlinAmplitudIntima = 50;
        this.perlinEscala = 0.0025;
        this.perlinSeed = 142;

        this.amplitudCurva = 50;
        this.anchoCurva = 260;
        this.curvas = [
            { posicion: 0.33, sentido: -1 },
            { posicion: 0.66, sentido: 1 }
        ];

        this.endotelioSuperior = new Endotelio(
            this.ancho,
            this.perlinAmplitudEndotelio,
            this.perlinEscala,
            this.perlinSeed,
            this
        );
        this.endotelioInferior = new Endotelio(
            this.ancho,
            this.perlinAmplitudEndotelio,
            this.perlinEscala,
            this.perlinSeed,
            this
        );
        this.intima = new Intima(
            this.ancho,
            this.perlinAmplitudIntima,
            this.perlinEscala,
            this.perlinSeed,
            this
        );

        this.endotelioSuperior.segmentos[3].damage();
        this.endotelioSuperior.segmentos[7].damage();
        this.endotelioInferior.segmentos[5].damage();

        this.c = color("#FFC1C2");
    }

    display() {
        noStroke();
        fill(this.c);
        this.dibujarLumen();

        this.intima.display(
            this.xInicio,
            this.yLumenSuperior - this.intima.distanciaLumen,
            this.ancho
        );
        this.intima.display(
            this.xInicio,
            this.yLumenInferior + this.intima.distanciaLumen,
            this.ancho
        );

        this.endotelioSuperior.display(
            this.xInicio,
            this.yLumenSuperior,
            this.altoEndotelio
        );
        this.endotelioInferior.display(
            this.xInicio,
            this.yLumenInferior - this.altoEndotelio,
            this.altoEndotelio
        );
    }

    dibujarLumen() {
        let offsetsIzquierda = this.endotelioSuperior.offsetsIzquierda;
        let offsetsDerecha = this.endotelioSuperior.offsetsDerecha;
        let anchoSegmento = this.endotelioSuperior.anchoSegmento;
        let separacion = this.endotelioSuperior.separacionSegmentos;
        let cantidad = this.endotelioSuperior.segmentos.length;

        beginShape();

        for (let i = 0; i < cantidad; i++) {
            let x = this.xInicio + i * (anchoSegmento + separacion);
            vertex(x, this.yLumenSuperior + offsetsIzquierda[i]);
            vertex(x + anchoSegmento, this.yLumenSuperior + offsetsDerecha[i]);
        }

        for (let i = cantidad - 1; i >= 0; i--) {
            let x = this.xInicio + i * (anchoSegmento + separacion);
            vertex(x + anchoSegmento, this.yLumenInferior + offsetsDerecha[i]);
            vertex(x, this.yLumenInferior + offsetsIzquierda[i]);
        }

        endShape(CLOSE);
    }

    desviacion(x) {
        let total = 0;

        for (let i = 0; i < this.curvas.length; i++) {
            let curva = this.curvas[i];
            let centro = this.ancho * curva.posicion;
            let t = (x - centro) / this.anchoCurva;

            total = total + curva.sentido * this.amplitudCurva * Math.exp(-t * t);
        }

        return total;
    }

    dentroDelLumen(pos) {
        if (pos.x >= this.xInicio && pos.x <= this.xInicio + this.ancho) {
            let xLocal = pos.x - this.xInicio;
            let offsetSuperior = this.endotelioSuperior.offsetEn(xLocal);
            let offsetInferior = this.endotelioInferior.offsetEn(xLocal);

            let top = this.yLumenSuperior + this.altoEndotelio + offsetSuperior;
            let bottom = this.yLumenInferior - this.altoEndotelio + offsetInferior;

            if (pos.y >= top && pos.y <= bottom) {
                return true;
            }
        }

        return false;
    }
}
