const BorderBehaviour = {
    BORDERS : "BORDERS",
    WRAP : "WRAP",
    NONE : "NONE"
}

class Agent2D {
    static drawRatio = 5;
    static img;
    constructor(x, y, mass) {
        this.pos = createVector(x, y);
        this.lastPos = this.pos.copy();
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mass = mass < 0? 0 : mass;
        this.massLoss = 0;
        this.c = color(0, 0, 0);
        this.r = sqrt(this.mass / PI) * Agent2D.drawRatio;
        this.borderBehaviour = BorderBehaviour.NONE;
        this.borderDamp = 0.8;
        this.maxSteeringForce = 0.01;
        this.maxSpeed = 1;
        this.arrivalDist = 200;

        this.wanderLookAhead = 70;
        this.wanderRadius = 50;
        this.wanderNoiseT = random(10);
        this.wanderNoiseInc = 0.01;
    }
    static createRandomVel(x, y, mass, velMag) {
        let agent = new Agent2D(x, y, mass);
        let v = p5.Vector.random2D();
        v.setMag(velMag);
        agent.vel.add(v);
        return agent;
    }
    static createRandomPos(mass = 1) {
        let agent = new Agent2D(random(width), random(height), mass);
        return agent;
    }
    update() {
        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.borders();
        this.mass -= this.massLoss;
        this.r = sqrt(this.mass / PI) * Agent2D.drawRatio;
    }
    display() {
        stroke(this.c);
        strokeWeight(this.r * 2)
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        beginShape();
        vertex(-this.r/3, -this.r/2);
        vertex(-this.r/3, this.r/2);
        vertex(3 * this.r/3, 0);
        endShape(CLOSE);
        pop();
    }
    borders() {
        switch (this.borderBehaviour) {
            case BorderBehaviour.BORDERS:
                if (this.pos.x < this.r || this.pos.x > width - this.r)
                    this.vel.x *= -this.borderDamp;
                if (this.pos.y < this.r || this.pos.y > height - this.r)
                    this.vel.y *= -this.borderDamp;
                this.pos.x = constrain(this.pos.x, this.r, width - this.r);
                this.pos.y = constrain(this.pos.y, this.r, height - this.r);
                break;
            case BorderBehaviour.WRAP:
                if (this.pos.x > width + this.r) this.pos.x = -this.r;
                if (this.pos.x < -this.r) this.pos.x = width + this.r;
                if (this.pos.y > height + this.r) this.pos.y = -this.r;
                if (this.pos.y < -this.r) this.pos.y = height + this.r;
                break;
            case BorderBehaviour.NONE:
                break;
        }
    }
    addForce(f) {
        let force = p5.Vector.div(f, this.mass);
        this.acc.add(force);
    }
    applyGravity(g) {
        this.acc.add(g);
    }
    applyFriction(m) {
        let fric = this.vel.copy();
        fric.normalize();
        fric.mult(-m);
        this.addForce(fric);
    }
    applyDrag(d) {
        let drag = this.vel.copy();
        drag.normalize();
        drag.mult(this.vel.mag()**2 * -d);
        this.addForce(drag);
    }
    isDead() {
        return this.mass <= 0;
    }
    seek(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let steering = p5.Vector.sub(desired, this.vel);
        steering.limit(this.maxSteeringForce);
        this.addForce(steering);
    }
    arrive(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let steering = p5.Vector.sub(desired, this.vel);
        steering.limit(this.maxSteeringForce);
        this.addForce(steering);
        let dist = p5.Vector.dist(this.pos, target);
        let speed = map(dist, 0, this.arrivalDist, 0,this.maxSpeed);
        this.vel.limit(speed);
    }
    wander() {
        let future = this.vel.copy();
        future.setMag(this.wanderLookAhead);
        let r = this.vel.copy();
        r.setMag(this.wanderRadius);
        r.rotate(map(noise(this.wanderNoiseT), 0, 1, -PI, PI));
        this.wanderDebug(future, r);
        this.wanderNoiseT += this.wanderNoiseInc;
        r.add(future);
        r.add(this.pos);
        this.seek(r);
    }
    wanderDebug(future, r) {
        push();
        stroke(255);
        strokeWeight(1);
        noFill();
        translate(this.pos.x, this.pos.y);
        line(0, 0, future.x, future.y);
        translate(future.x, future.y);
        ellipse(0, 0, r.mag() * 2);
        translate(r.x, r.y);
        ellipse(0, 0, 5);
        pop();     
    }
    getNormalPoint(position, a, b) {
        let vectorA = p5.Vector.sub(position, a)
        let vectorB = p5.Vector.sub(b, a)
        vectorB.normalize();
        vectorB.mult(vectorA.dot(vectorB));
        let normalPoint = p5.Vector.add(a, vectorB)
        return normalPoint;
    }
    follow(segment) {
        let future = this.vel.copy()
        future.setMag(25)
        future.add(this.pos)
        
        let normalPoint = this.getNormalPoint(future, segment.start, segment.end)

        let v2 = p5.Vector.sub(segment.end, segment.start)
        v2.setMag(25)
        let target = p5.Vector.add(normalPoint, v2)

        let distance = p5.Vector.dist(normalPoint, future)

        if (distance > segment.r) {
            this.seek(target)
        }
    }
}