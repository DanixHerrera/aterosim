class Intima {
    constructor(anchoTotal, perlinAmplitud, perlinEscala, perlinSeed) {
        if (anchoTotal === undefined) {
            anchoTotal = width;
        }
        if (perlinAmplitud === undefined) {
            perlinAmplitud = 22;
        }
        if (perlinEscala === undefined) {
            perlinEscala = 0.003;
        }
        if (perlinSeed === undefined) {
            perlinSeed = 42;
        }

        this.grosor = 24;
        this.distanciaLumen = 14;
        this.c = color("#F37670");

        this.anchoTotal = anchoTotal;
        this.perlinAmplitud = perlinAmplitud;
        this.perlinEscala = perlinEscala;
        this.perlinSeed = perlinSeed;
        this.cantidadPuntos = 100;
        this.offsets = [];

        this.generarCurvas();
    }

    generarCurvas() {
        this.offsets = [];

        let paso = this.anchoTotal / this.cantidadPuntos;

        for (let i = 0; i <= this.cantidadPuntos; i++) {
            let x = i * paso;
            let ruido = noise(x * this.perlinEscala + this.perlinSeed);
            let offset = map(
                ruido,
                0,
                1,
                -this.perlinAmplitud,
                this.perlinAmplitud
            );

            this.offsets.push(offset);
        }
    }

    display(x, y, ancho) {
        let paso = ancho / this.cantidadPuntos;

        noFill();
        stroke(this.c);
        strokeWeight(this.grosor);

        beginShape();

        for (let i = 0; i <= this.cantidadPuntos; i++) {
            let xPunto = x + i * paso;
            vertex(xPunto, y + this.offsets[i]);
        }

        endShape();
    }
}
