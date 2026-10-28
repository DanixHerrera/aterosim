let arteria;

function setup() {
    createCanvas(windowWidth, windowHeight);
    //crearArteria();
    background("#481b18");

    arteria = new Arteria(width / 2, height / 2);
}

function draw() {
    
    arteria.display();
}


    

/* por si acaso se bugea la arteria en la ventana

function crearArteria() {
    arteria = new Arteria(width / 2, height / 2);
}
    
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    //crearArteria();
} */

// color endotelio: #fc817d
// color intima: #fa5d59
// color de placa: #f9d550