let arteria;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);

    arteria = new Arteria(windowWidth/2, windowHeight/2, 800, 200);
}

function draw() {
    arteria.display();
}
