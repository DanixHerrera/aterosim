class Arteria {
    constructor(x, y, configuracion = {}) {
        this.x = x;
        this.y = y;
        this.ancho = width;
        this.alto = height;

        this.altoLumen = 150;
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
        this.endotelioInferior.direccionLumen = -1;
        this.intima = new Intima(
            this.ancho,
            this.perlinAmplitudIntima,
            this.perlinEscala,
            this.perlinSeed,
            this
        );

        this.configurarDanoInicial(configuracion);

        this.c = color("#FFC1C2");

        this.limitesPlaca = null;
        this.espacioPlaca = [];
        this.actualizarPlaca();
    }

    configurarDanoInicial(configuracion) {
        let indices = configuracion.indicesDanados;

        if (!indices) {
            return;
        }

        for (let i = 0; i < indices.length; i++) {
            let dano = indices[i];
            let endotelio = dano.pared === "inferior"
                ? this.endotelioInferior
                : this.endotelioSuperior;

            let indice = constrain(dano.indice, 0, endotelio.segmentos.length - 1);
            endotelio.segmentos[indice].damage();
        }
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

    paredMasCercana(pos) {
        let xLocal = pos.x - this.xInicio;
        let top = this.yLumenSuperior + this.endotelioSuperior.offsetEn(xLocal);
        let bottom = this.yLumenInferior + this.endotelioInferior.offsetEn(xLocal);
        if (pos.y < (top + bottom) / 2) {
            return "superior";
        }
        return "inferior";
    }

    posicionEnIntima(indice, lado, n) {
        let endotelio = this.endotelioSuperior;
        if (lado === "inferior") {
            endotelio = this.endotelioInferior;
        }
        let paso = endotelio.anchoSegmento + endotelio.separacionSegmentos;
        let xLocal = indice * paso + endotelio.anchoSegmento / 2;
        xLocal = xLocal + ((n % 3) - 1) * 6;

        let capa = Math.floor(n / 3);
        let offset = this.intima.offsetEn(xLocal);
        let y;
        if (lado === "superior") {
            y = this.yLumenSuperior - this.intima.distanciaLumen + offset + capa * 6;
        } else {
            y = this.yLumenInferior + this.intima.distanciaLumen + offset - capa * 6;
        }
        return createVector(this.xInicio + xLocal, y);
    }

    actualizarPlaca() {
        this.endotelioSuperior.calcularPlacaDeseada();
        this.endotelioInferior.calcularPlacaDeseada();

        this.resolverContactoPlaca();

        this.endotelioSuperior.actualizarPerfilPlaca();
        this.endotelioInferior.actualizarPerfilPlaca();
    }

    huecoSinPlaca(offsetSuperior, offsetInferior) {
        let superior = this.yLumenSuperior + this.altoEndotelio + offsetSuperior;
        let inferior = this.yLumenInferior - this.altoEndotelio + offsetInferior;
        return inferior - superior;
    }

    limitePlacaSegmento(i) {
        let sup = this.endotelioSuperior;
        let inf = this.endotelioInferior;
        let ultimo = sup.segmentos.length - 1;

        let limite = Math.min(
            this.huecoSinPlaca(sup.offsetsIzquierda[i], inf.offsetsIzquierda[i]),
            this.huecoSinPlaca(sup.offsetsDerecha[i], inf.offsetsDerecha[i])
        );

        if (i > 0) {
            limite = Math.min(limite,
                this.huecoSinPlaca(sup.offsetsDerecha[i - 1], inf.offsetsDerecha[i - 1]));
        }
        if (i < ultimo) {
            limite = Math.min(limite,
                this.huecoSinPlaca(sup.offsetsIzquierda[i + 1], inf.offsetsIzquierda[i + 1]));
        }

        return Math.max(0, limite);
    }

    resolverContactoPlaca() {
        let sup = this.endotelioSuperior;
        let inf = this.endotelioInferior;
        let cantidad = sup.segmentos.length;

        if (!this.limitesPlaca || this.limitesPlaca.length !== cantidad) {
            this.limitesPlaca = [];
            for (let i = 0; i < cantidad; i++) {
                this.limitesPlaca.push(this.limitePlacaSegmento(i));
            }
            this.espacioPlaca = new Array(cantidad).fill(Infinity);
        }

        for (let i = 0; i < cantidad; i++) {
            let segSup = sup.segmentos[i];
            let segInf = inf.segmentos[i];
            let limite = this.limitesPlaca[i];

            let alturaSup = Math.min(segSup.placaAltura, segSup.placaDeseada);
            let alturaInf = Math.min(segInf.placaAltura, segInf.placaDeseada);

            let total = alturaSup + alturaInf;
            if (total > limite && total > 0) {
                let f = limite / total;
                alturaSup *= f;
                alturaInf *= f;
                total = limite;
            }

            let quiereSup = Math.max(0, segSup.placaDeseada - alturaSup);
            let quiereInf = Math.max(0, segInf.placaDeseada - alturaInf);
            let quiere = quiereSup + quiereInf;

            let libre = Math.max(0, limite - total);

            if (quiere <= libre) {
                alturaSup += quiereSup;
                alturaInf += quiereInf;
            } else if (quiere > 0) {
                let f = libre / quiere;
                alturaSup += quiereSup * f;
                alturaInf += quiereInf * f;
            }

            segSup.placaAltura = alturaSup;
            segInf.placaAltura = alturaInf;
            this.espacioPlaca[i] = Math.max(0, limite - (alturaSup + alturaInf));
        }
    }

    segmentoSaturado(indice) {
        let espacio = this.espacioPlaca[indice];
        return espacio !== undefined && espacio < 0.05;
    }

    estenosisSegmento(indice) {
        let paso = this.endotelioSuperior.anchoSegmento + this.endotelioSuperior.separacionSegmentos;
        let xLocal = indice * paso + this.endotelioSuperior.anchoSegmento / 2;

        let top = this.yLumenSuperior + this.altoEndotelio + this.endotelioSuperior.offsetEn(xLocal);
        let bottom = this.yLumenInferior - this.altoEndotelio + this.endotelioInferior.offsetEn(xLocal);
        let altoLibre = bottom - top;

        let placa = this.endotelioSuperior.placaEn(xLocal) + this.endotelioInferior.placaEn(xLocal);

        return min(100, placa / altoLibre * 100);
    }

    estenosisMaxima() {
        let maxima = 0;
        for (let i = 0; i < this.endotelioSuperior.segmentos.length; i++) {
            maxima = max(maxima, this.estenosisSegmento(i));
        }
        return maxima;
    }

    estenosisPromedio() {
        let cantidad = this.endotelioSuperior.segmentos.length;
        let total = 0;
        for (let i = 0; i < cantidad; i++) {
            total = total + this.estenosisSegmento(i);
        }
        return total / cantidad;
    }

    dentroDelLumen(pos) {
        if (pos.x >= this.xInicio && pos.x <= this.xInicio + this.ancho) {
            let xLocal = pos.x - this.xInicio;
            let offsetSuperior = this.endotelioSuperior.offsetEn(xLocal);
            let offsetInferior = this.endotelioInferior.offsetEn(xLocal);
            let placaSuperior = this.endotelioSuperior.placaEn(xLocal);
            let placaInferior = this.endotelioInferior.placaEn(xLocal);

            let top = this.yLumenSuperior + this.altoEndotelio + offsetSuperior + placaSuperior;
            let bottom = this.yLumenInferior - this.altoEndotelio + offsetInferior - placaInferior;

            if (pos.y >= top && pos.y <= bottom) {
                return true;
            }
        }

        return false;
    }
}
