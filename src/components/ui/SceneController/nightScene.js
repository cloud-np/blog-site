class GradientCirclePainter {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.cWidth = canvas.width;
        this.cHeight = canvas.height;
        this.centerX = this.cWidth / 2;
        this.centerY = this.cHeight / 2;
        this.radius = Math.min(this.cWidth, this.cHeight) / 2;
    }

    fillWithGradient(circleLinearGradient) {
        this.ctx.fillStyle = circleLinearGradient;
        this.ctx.fill();
    }

    drawBigPlanet() {
        const circleLinearGradient = this.ctx.createLinearGradient(
            0, this.centerY * 0.05,
            0, this.centerY * 1.3
        );
        circleLinearGradient.addColorStop(0, '#101010');
        circleLinearGradient.addColorStop(1, '#141414');

        this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
        this.ctx.beginPath();

        this.ctx.arc(this.centerX, 
            this.cHeight > this.cWidth * 1.5
            ? this.centerY * 0.7
            : this.centerY * 1.15
            , this.radius, 0, 2 * Math.PI);
        this.fillWithGradient(circleLinearGradient);
    }

    drawMoon(gradientXOffSetMult, gradientXOffSetMult2, posXMult, posYmult) {
        const circleLinearGradient = this.ctx.createLinearGradient(
            this.centerX * gradientXOffSetMult, 0,
            this.centerX * gradientXOffSetMult2, 0,
        );

        const radius = Math.min(this.cWidth, this.cHeight) / 22;
        circleLinearGradient.addColorStop(0, '#101010');
        circleLinearGradient.addColorStop(1, '#202020');

        this.ctx.beginPath();

        this.ctx.arc(
            this.centerX * posXMult,
            this.centerY * posYmult
            , radius, 0, 2 * Math.PI);
        this.fillWithGradient(circleLinearGradient);
    }
}

export default function startNightScene(canvas) {
    const circlePainter = new GradientCirclePainter(canvas);

    //Helpers
    function lineToAngle(x1, y1, length, radians) {
        const x2 = x1 + length * Math.cos(radians);
        const y2 = y1 + length * Math.sin(radians);
        return { x: x2, y: y2 };
    }

    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    function degreesToRads(degrees) {
        return degrees / 180 * Math.PI;
    }

    //Particle
    var particle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,

        create: function (x, y, speed, direction) {
            var obj = Object.create(this);
            obj.x = x;
            obj.y = y;
            obj.vx = Math.cos(direction) * speed;
            obj.vy = Math.sin(direction) * speed;
            return obj;
        },

        getSpeed: function () {
            return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        },

        setSpeed: function (speed) {
            var heading = this.getHeading();
            this.vx = Math.cos(heading) * speed;
            this.vy = Math.sin(heading) * speed;
        },

        getHeading: function () {
            return Math.atan2(this.vy, this.vx);
        },

        setHeading: function (heading) {
            var speed = this.getSpeed();
            this.vx = Math.cos(heading) * speed;
            this.vy = Math.sin(heading) * speed;
        },

        update: function () {
            this.x += this.vx;
            this.y += this.vy;
        }
    };

    //Canvas and settings
    var context = canvas.getContext("2d"),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight,
        stars = [],
        shootingStars = [],
        layers = [
            { speed: 0.015, scale: 0.2, count: 320 },
            { speed: 0.03, scale: 0.5, count: 50 },
            { speed: 0.05, scale: 0.75, count: 30 }
        ],
        starsAngle = 36,
        shootingStarSpeed = {
            min: 15,
            max: 20
        },
        shootingStarOpacityDelta = 0.01,
        trailLengthDelta = 0.01,
        shootingStarEmittingInterval = 2000,
        shootingStarLifeTime = 500,
        maxTrailLength = 300,
        starBaseRadius = 2,
        shootingStarRadius = 3,
        paused = false;

    //Create all stars
    for (let j = 0; j < layers.length; j++) {
        let layer = layers[j];
        for (let i = 0; i < (layer.count / 8); i++) {
            let star = particle.create(randomRange(0, width), randomRange(0, height / 1.7), 0, 0);
            star.radius = starBaseRadius * layer.scale;
            star.setSpeed(layer.speed);
            star.setHeading(degreesToRads(starsAngle));
            stars.push(star);
        }
    }

    function createShootingStar() {
        let shootingStar = particle.create(randomRange(width / 2, width), randomRange(0, height / 3), 0, 0);
        shootingStar.setSpeed(randomRange(shootingStarSpeed.min, shootingStarSpeed.max));
        shootingStar.setHeading(degreesToRads(starsAngle));
        shootingStar.radius = shootingStarRadius;
        shootingStar.opacity = 0;
        shootingStar.trailLengthDelta = 0;
        shootingStar.isSpawning = true;
        shootingStar.isDying = false;
        shootingStars.push(shootingStar);
    }

    function killShootingStar(shootingStar) {
        setTimeout(function () {
            shootingStar.isDying = true;
        }, shootingStarLifeTime);
    }

    function update() {
        if (!paused) {
            context.clearRect(0, 0, width, height);
            context.fillRect(0, 0, width, height);
            context.fill();
            // drawGradientCircle(canvas, context);
            circlePainter.drawBigPlanet();
            // Left moon
            circlePainter.drawMoon(0.05, 0.4, 0.2, 0.67);
            // Right moon
            circlePainter.drawMoon(3.04, 0, 1.6, 0.40);

            for (let i = 0; i < stars.length; i += 1) {
                let star = stars[i];
                star.update();
                drawStar(star);
                if (star.x > width) {
                    star.x = 0;
                }
                if (star.x < 0) {
                    star.x = width;
                }
                if (star.y > height) {
                    star.y = 0;
                }
                if (star.y < 0) {
                    star.y = height;
                }
            }

            for (let i = 0; i < shootingStars.length; i += 1) {
                var shootingStar = shootingStars[i];
                if (shootingStar.isSpawning) {
                    shootingStar.opacity += shootingStarOpacityDelta;
                    if (shootingStar.opacity >= 1.0) {
                        shootingStar.isSpawning = false;
                        killShootingStar(shootingStar);
                    }
                }
                if (shootingStar.isDying) {
                    shootingStar.opacity -= shootingStarOpacityDelta;
                    if (shootingStar.opacity <= 0.0) {
                        shootingStar.isDying = false;
                        shootingStar.isDead = true;
                    }
                }
                shootingStar.trailLengthDelta += trailLengthDelta;

                shootingStar.update();
                if (shootingStar.opacity > 0.0) {
                    drawShootingStar(shootingStar);
                }
            }

            //Delete dead shooting shootingStars
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                if (shootingStars[i].isDead) {
                    shootingStars.splice(i, 1);
                }
            }
        }
        requestAnimationFrame(update);
    }

    function drawStar(star) {
        context.fillStyle = "#ebfbff";
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
        context.fill();
    }

    function drawShootingStar(p) {
        var x = p.x,
            y = p.y,
            currentTrailLength = (maxTrailLength * p.trailLengthDelta),
            pos = lineToAngle(x, y, -currentTrailLength, p.getHeading());

        context.fillStyle = "rgba(255, 255, 255, " + p.opacity + ")";
        context.beginPath();
        context.arc(x, y, p.radius, 0, Math.PI * 2, false);
        context.fill();
        var starLength = 5;
        context.beginPath();
        context.moveTo(x - 1, y + 1);

        context.lineTo(x, y + starLength);
        context.lineTo(x + 1, y + 1);

        context.lineTo(x + starLength, y);
        context.lineTo(x + 1, y - 1);

        context.lineTo(x, y + 1);
        context.lineTo(x, y - starLength);

        context.lineTo(x - 1, y - 1);
        context.lineTo(x - starLength, y);

        context.lineTo(x - 1, y + 1);
        context.lineTo(x - starLength, y);

        context.closePath();
        context.fill();

        //trail
        context.fillStyle = `rgba(235, 251, 255, ${p.opacity})`;
        context.beginPath();
        context.moveTo(x - 1, y - 1);
        context.lineTo(pos.x, pos.y);
        context.lineTo(x + 1, y + 1);
        context.closePath();
        context.fill();
    }

    //Run
    update();

    // Shooting stars
    // setInterval(function () {
    //     if (paused) return;
    //     createShootingStar();
    // }, shootingStarEmittingInterval);
}