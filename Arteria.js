class Arteria {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ancho = 1800;
        this.alto = 400;

        this.altoLumen = 200;
        this.altoEndotelio = 8;
        this.xInicio = this.x - this.ancho/ 2;
        this.yLumenSuperior = this.y - this.altoLumen / 2;
        this.yLumenInferior = this.y + this.altoLumen / 2;

        this.endotelio = new Endotelio();
        this.intima = new Intima();

        this.c = color("#d31a17");
    }

    display() {
        noStroke();
        fill(this.c);
        rect(this.xInicio,this.yLumenSuperior, this.ancho,this.altoLumen);

        this.intima.display(this.xInicio,this.yLumenSuperior - this.intima.distanciaLumen,this.ancho);

        this.intima.display(this.xInicio,this.yLumenInferior + this.intima.distanciaLumen,this.ancho);

        this.endotelio.display(this.xInicio,this.yLumenSuperior,this.altoEndotelio);
        this.endotelio.display(this.xInicio,this.yLumenInferior - this.altoEndotelio,this.altoEndotelio);
    }

    dentroDelLumen(pos) {
        if (pos.x >= this.xInicio && pos.x <= this.xInicio + this.ancho) {
            if (pos.y >= this.yLumenSuperior && pos.y <= this.yLumenInferior) {
                return true;
            }
        }

        return false;
    }

}