class Endotelio {
    constructor() {
        this.segmentos = [];
        this.cantidadSegmentos = 10;
        this.anchoSegmento = 175;
        this.separacionSegmentos = 2;

        for (let i = 0; i < this.cantidadSegmentos; i++) {
            this.segmentos.push(new Segmento(0, this.anchoSegmento, "sano"));
        }
    }

    display(x, y, alto) {
        for (let i = 0; i < this.segmentos.length; i++) {
            this.segmentos[i].x = x + i * (this.anchoSegmento + this.separacionSegmentos);
            this.segmentos[i].display(y, alto);
        }
    }

    segmentoMasCercano(pos) {
        let masCercano = null;

        return null;
    }
}