class Endotelio {
    constructor(anchoTotal, perlinAmplitud, perlinEscala, perlinSeed, arteria) {
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
        this.arteria = arteria;

        this.offsetsIzquierda = [];
        this.offsetsDerecha = [];

        this.direccionLumen = 1;
        this.alturaPorCelula = 6;
        this.placaIzquierda = [];
        this.placaDerecha = [];

        for (let i = 0; i < this.cantidadSegmentos; i++) {
            this.segmentos.push(new Segmento(0, this.anchoSegmento, "sano"));
        }

        this.generarCurvas();
        this.actualizarPlaca();
    }

    actualizarPlaca() {
        let cantidad = this.segmentos.length;

        for (let i = 0; i < cantidad; i++) {
            let celulas = this.segmentos[i].celulasEspumosas;
            let celulasIzquierda = i > 0 ? this.segmentos[i - 1].celulasEspumosas : 0;
            let celulasDerecha = i < cantidad - 1 ? this.segmentos[i + 1].celulasEspumosas : 0;
            this.segmentos[i].placaAltura = this.alturaPorCelula * (celulas + 0.5 * (celulasIzquierda + celulasDerecha));
        }

        this.placaIzquierda = [];
        this.placaDerecha = [];

        for (let i = 0; i < cantidad; i++) {
            let placa = this.segmentos[i].placaAltura;
            let placaAnterior = i > 0 ? this.segmentos[i - 1].placaAltura : placa;
            let placaSiguiente = i < cantidad - 1 ? this.segmentos[i + 1].placaAltura : placa;
            this.placaIzquierda.push((placaAnterior + placa) / 2);
            this.placaDerecha.push((placa + placaSiguiente) / 2);
        }
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

            if (this.arteria) {
                offsetIzquierda = offsetIzquierda + this.arteria.desviacion(xIzquierda);
                offsetDerecha = offsetDerecha + this.arteria.desviacion(xDerecha);
            }

            this.offsetsIzquierda.push(offsetIzquierda);
            this.offsetsDerecha.push(offsetDerecha);
        }
    }

    offsetEn(x) {
        return this.interpolar(x, this.offsetsIzquierda, this.offsetsDerecha);
    }

    placaEn(x) {
        return this.interpolar(x, this.placaIzquierda, this.placaDerecha);
    }

    interpolar(x, valoresIzquierda, valoresDerecha) {
        let paso = this.anchoSegmento + this.separacionSegmentos;
        let ultimo = this.segmentos.length - 1;

        if (x <= 0) {
            return valoresIzquierda[0];
        }

        let xFinal = ultimo * paso + this.anchoSegmento;

        if (x >= xFinal) {
            return valoresDerecha[ultimo];
        }

        let indice = Math.floor(x / paso);
        let inicioSegmento = indice * paso;
        let finSegmento = inicioSegmento + this.anchoSegmento;

        if (x <= finSegmento) {
            let t = (x - inicioSegmento) / this.anchoSegmento;
            return lerp(valoresIzquierda[indice], valoresDerecha[indice], t);
        }

        let t = (x - finSegmento) / this.separacionSegmentos;
        return lerp(valoresDerecha[indice], valoresIzquierda[indice + 1], t);
    }

    indiceEn(x) {
        let paso = this.anchoSegmento + this.separacionSegmentos;
        let indice = Math.floor(x / paso);
        return constrain(indice, 0, this.segmentos.length - 1);
    }

    display(x, y, alto) {
        for (let i = 0; i < this.segmentos.length; i++) {
            this.segmentos[i].x = x + i * (this.anchoSegmento + this.separacionSegmentos);

            this.segmentos[i].display(
                y,
                alto,
                this.offsetsIzquierda[i],
                this.offsetsDerecha[i],
                this.placaIzquierda[i],
                this.placaDerecha[i],
                this.direccionLumen
            );
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

    segmentoEn(x) {
        let xLocal = x - this.arteria.xInicio;
        let paso = this.anchoSegmento + this.separacionSegmentos;
        let indice = Math.floor(xLocal / paso);

        if (indice < 0 || indice >= this.segmentos.length) {
            return null;
        }

        let segmento = this.segmentos[indice];

        if (xLocal > indice * paso + this.anchoSegmento) {
            return null;
        }

        return segmento;
    }
}
