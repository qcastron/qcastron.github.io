//You're really dedicated and techy eh? You're gonna have a great time in our team. Sign up and tell us 'bout this

$(document).ready(function () {
    resize();
});

window.addEventListener('resize', resize);

let ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

let stars = [],
    speed = 0.2,
    dist = 30,
    max_connect = 3,
    special_count = 0,
    mouse = {
        x: 0,
        y: 0
    },
    step = 0,
    allowed = 1;

resize();
for (let i = 0; stars.length < stars_count;) {
    i = new New_dot();
    i.life = Math.random();
    i.midlife = Math.random() * 2 | 0;
    stars.push(i);
}

function New_dot() {
    let n = this;
    let l = function () {
        return (Math.pow(Math.random(), .5) - 1) * (n.radius) * speed;
    };
    this.x = Math.random() * skyW + skyWMin;
    this.y = Math.random() * skyH + skyHMin;
    this.radius = 2 * Math.random() + .8;
    this.vx = l();
    this.vy = .5 * l();
    this.life = 0;
    this.midlife = 0;
    this.size = 0;
    this.quota = 0;
    this.special = 0;
    this.parallaxOffsetX = 0;
    this.parallaxOffsetY = 0;
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = stars.length;
    ctx.beginPath();
    for (let i = 0; i < x; i++) {
        let starI = stars[i];
        for (let j = i + 1; ((j < x) && starI.quota); j++) {
            let starII = stars[j];
            if (distance(starI, starII) < Math.min(dist * Math.min(starI.size, starII.size) * Math.min(starI.quota, starII.quota), dist * max_connect)) {
                ctx.moveTo(starI.x + starI.parallaxOffsetX, starI.y + starI.parallaxOffsetY);
                ctx.lineTo(starII.x + starII.parallaxOffsetX, starII.y + starII.parallaxOffsetY);
                starI.quota--;
                starII.quota--;
            }
        }
    }
    ctx.lineWidth = .8;
    ctx.strokeStyle = "#6B7E99";
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < x; i++) {
        let s = stars[i];
        if (!s.special) {
            draw_star(s);
        }
    }
    ctx.fillStyle = "#E0E0E0";
    ctx.fill();
    if (special_count) {
        ctx.beginPath();
        for (let i = 0; i < x; i++) {
            let s = stars[i];
            if (s.special) {
                draw_star(s);
            }
        }
        ctx.fillStyle = "#FFCC00";
        ctx.fill();
    }
}

function distance(point1, point2) {
    let xs, ys;
    xs = point2.x + point2.parallaxOffsetX - point1.x - point1.parallaxOffsetX;
    ys = point2.y + point2.parallaxOffsetY - point1.y - point1.parallaxOffsetY;
    return Math.sqrt(xs * xs + ys * ys);
}

function draw_star(s) {
    s.size = s.radius * Math.pow(s.life, .6);
    s.quota = s.size | 0;
    ctx.moveTo(s.x, s.y);
    ctx.arc(s.x + s.parallaxOffsetX, s.y + s.parallaxOffsetY, s.size, 0, 2 * Math.PI);
}

function update() {
    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];

        s.life += (s.midlife ? -.004 : .004) / s.radius;
        if (s.life >= 1 && !s.midlife) {
            s.midlife = 1;
        }

        if (s.life < 0) {
            if (s.special) {
                special_count--;
            }
            stars.splice(i, 1);
        } else {
            s.x += s.vx;
            s.y += s.vy;

            if ((s.x < skyWMin || s.x > skyWMax || s.y < skyHMin || s.y > skyHMax) && !s.special) {
                stars.splice(i, 1);
            }
        }
    }
    for (let j = 0; stars.length < stars_count + special_count;) {
        j = new New_dot();
        stars.push(j);
    }

    for (let i = 0; i < stars.length; i++) {
        calOffset(stars[i]);
    }
}

function calOffset(s) {
    s.parallaxTargX = (mouse.x - halfWinW) * s.radius * s.radius / parallaxFactor;
    s.parallaxOffsetX += (s.parallaxTargX - s.parallaxOffsetX) / 10;
    s.parallaxTargY = (mouse.y - halfWinH) * s.radius * s.radius / parallaxFactor;
    s.parallaxOffsetY += (s.parallaxTargY - s.parallaxOffsetY) / 10;
}

if (window.DeviceOrientationEvent && navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i)) {
    window.addEventListener('deviceorientation', function () {
        mouse.x = (Math.min(Math.max(-event.gamma, -30), 30) + 30) * halfWinW / 30;
        mouse.y = (Math.min(Math.max(-event.beta, -30), 30) + 30) * halfWinH / 30;
    }, true);
    parallaxFactor = 40;
} else {
    window.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
}

window.addEventListener("click", function (e) {
    let canvas_top = canvas.getBoundingClientRect().top;
    if (canvas_top <= e.clientY) {
        let s = new New_dot();
        s.life = .5;
        s.radius += 1;
        s.special = 1;
        s.size = s.radius * Math.pow(s.life, .6);
        s.parallaxOffsetX = (mouse.x - halfWinW) * s.radius * s.radius / parallaxFactor;
        s.parallaxOffsetY = (mouse.y - halfWinH) * s.radius * s.radius / parallaxFactor;
        s.x = e.clientX - s.parallaxOffsetX;
        s.y = e.clientY - canvas_top - s.parallaxOffsetY;
        stars.push(s);
        special_count++;
        if (allowed) {
            allowed = 0;
            step++;
            setTimeout(function () {
                allowed = 1;
            }, 1500);
            if (step % 10 || step < 5) {
                gtag('event', 'click', {'event_category': 'canvas', 'event_label': step});
            }
        }
    }
}, false);

for (let i = 2; i < 10; i++) {
    setTimeout(function () {
        gtag('event', 'ping', {'event_category': 'ping', 'event_label': 15 * i});
    }, 15000 * i);
}

function tick() {
    draw();
    update();
    requestAnimationFrame(tick);
}

console.log("%cIf you see this, you're talented and we want you. Join our team below :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");
tick();

