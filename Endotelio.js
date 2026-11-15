class Endotelio {
    constructor(anchoTotal, perlinAmplitud, perlinEscala, perlinSeed) {
        if (anchoTotal === undefined) {
            anchoTotal = width;
        }
        if (perlinAmplitud === undefined) {
            perlinAmplitud = 30;
        }
        if (perlinEscala === undefined) {
            perlinEscala = 0.003;
        }
        if (perlinSeed === undefined) {
            perlinSeed = 42;
        }

        this.segmentos = [];
        this.cantidadSegmentos = 100;
        this.separacionSegmentos = 2;
        this.anchoSegmento = (anchoTotal - (this.cantidadSegmentos - 1) * this.separacionSegmentos) / this.cantidadSegmentos;

        this.perlinAmplitud = perlinAmplitud;
        this.perlinEscala = perlinEscala;
        this.perlinSeed = perlinSeed;

        this.offsetsIzquierda = [];
        this.offsetsDerecha = [];

        for (let i = 0; i < this.cantidadSegmentos; i++) {
            this.segmentos.push(new Segmento(0, this.anchoSegmento, "sano"));
        }

        this.generarCurvas();
    }

    generarCurvas() {
        this.offsetsIzquierda = [];
        this.offsetsDerecha = [];

        for (let i = 0; i < this.cantidadSegmentos; i++) {
            let xIzquierda = i * (this.anchoSegmento + this.separacionSegmentos);
            let xDerecha = xIzquierda + this.anchoSegmento;

            let ruidoIzquierda = noise(xIzquierda * this.perlinEscala + this.perlinSeed);
            let ruidoDerecha = noise(xDerecha * this.perlinEscala + this.perlinSeed);

            let offsetIzquierda = map( ruidoIzquierda, 0, 1, -this.perlinAmplitud,this.perlinAmplitud);
            let offsetDerecha = map(ruidoDerecha, 0,1,-this.perlinAmplitud,this.perlinAmplitud);

            this.offsetsIzquierda.push(offsetIzquierda);
            this.offsetsDerecha.push(offsetDerecha);
        }
    }

    display(x, y, alto) {
        for (let i = 0; i < this.segmentos.length; i++) {
            this.segmentos[i].x = x + i * (this.anchoSegmento + this.separacionSegmentos);

            this.segmentos[i].display( y, alto, this.offsetsIzquierda[i],this.offsetsDerecha[i]);
        }
    }

    segmentoMasCercano(pos) {
        let masCercano = null;
        let distanciaMinima = Infinity;

        for (let i = 0; i < this.segmentos.length; i++) {
            let segmento = this.segmentos[i];
            let centro = segmento.x + segmento.ancho / 2;
            let distancia = abs(pos.x - centro);

            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                masCercano = segmento;
            }
        }

        return masCercano;
    }
}
