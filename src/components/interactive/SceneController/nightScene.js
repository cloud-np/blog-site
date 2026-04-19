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
        circleLinearGradient.addColorStop(0, '#090909');
        circleLinearGradient.addColorStop(1, '#101010');

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
    //Helpers
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
        layers = [
            { speed: 0.015, scale: 0.2, count: 320 },
            { speed: 0.03, scale: 0.5, count: 50 },
            { speed: 0.05, scale: 0.75, count: 30 }
        ],
        starsAngle = 145,
        starBaseRadius = 2,
        paused = false;

    // Pre-render static background (planet + moons) to an offscreen canvas
    var bgCanvas = document.createElement("canvas");
    bgCanvas.width = width;
    bgCanvas.height = height;
    var bgPainter = new GradientCirclePainter(bgCanvas);
    bgPainter.drawBigPlanet();
    bgPainter.drawMoon(0.05, 0.4, 0.2, 0.67);
    bgPainter.drawMoon(3.04, 0, 1.6, 0.40);

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

    // Throttle to ~20fps (50ms interval) — stars are too slow to need 60fps
    var FRAME_INTERVAL = 50;
    var lastFrameTime = 0;
    // Pause when canvas is off-screen
    var observer = new IntersectionObserver(function (entries) {
        paused = !entries[0].isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    // Respect prefers-reduced-motion
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function update(timestamp) {
        if (!paused) {
            if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
                lastFrameTime = timestamp;

                context.clearRect(0, 0, width, height);
                // Draw cached background in one call
                context.drawImage(bgCanvas, 0, 0);

                context.fillStyle = "#ebfbff";
                context.beginPath();
                for (let i = 0; i < stars.length; i += 1) {
                    let star = stars[i];
                    star.update();
                    // Batch all stars into a single path
                    context.moveTo(star.x + star.radius, star.y);
                    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false);
                    if (star.x > width) star.x = 0;
                    else if (star.x < 0) star.x = width;
                    if (star.y > height) star.y = 0;
                    else if (star.y < 0) star.y = height;
                }
                context.fill();
            }
        }

        // If user prefers reduced motion, render one frame and stop
        if (prefersReducedMotion) return;

        requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}
