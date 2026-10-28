class Endotelio {
    constructor(anchoTotal = width) {
        this.segmentos = [];
        this.cantidadSegmentos = 10;
        this.separacionSegmentos = 2;
        this.anchoSegmento =
            (anchoTotal - (this.cantidadSegmentos - 1) * this.separacionSegmentos)
            / this.cantidadSegmentos;
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
        let distanciaMinima = Infinity;
        for (const segmento of this.segmentos) {
            const centro = segmento.x + segmento.ancho / 2;
            const distancia = abs(pos.x - centro);
            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                masCercano = segmento;
            }
        }
        return masCercano;
    }
}