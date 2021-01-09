(function ($) {
    let navbar = $('#nav-bar');

    $(window).scroll(function () {
        let st = $(this).scrollTop();
        st > 80 ? navbar.removeClass('bg-transparent').addClass('bg-purple-gradient') :
            navbar.removeClass('bg-purple-gradient').addClass('bg-transparent');
    });

    $("#blurb-learn").click(function () {
        $('html,body').animate({
                scrollTop: $("#explore-con").offset().top - 60}, "slow");
    });
})(jQuery);


let collapsed_nav = document.getElementById("nav-hide-content"),
    navbar = document.getElementById("nav-bar");

collapsed_nav.addEventListener('show.bs.collapse', function () {
    navbar.className = "navbar fixed-top navbar-expand-md navbar-dark bg-purple-gradient";
});
collapsed_nav.addEventListener('hidden.bs.collapse', function () {
    navbar.className = "navbar fixed-top navbar-expand-md navbar-dark bg-transparent";
});


let canvas = document.getElementById("constellations"),
    ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";


canvas.width = document.body.clientWidth;
// canvas.height = 750;
canvas.height = (window.innerHeight > 600 ? window.innerHeight : 600);
document.getElementById("explore-background-con").style.top = canvas.height - 2 + "px";
canvas.style.display = "block";


var stars = [],
    speed = 0.15,
    offset = 50,
    dist = 40,
    max_connect = 3,
    special_count = 0,
    x = (canvas.height + offset / 2) * (canvas.width + offset) * 0.0004,
    mouse = {
        x: 0,
        y: 0
    };


for (let i = 0; stars.length < x;) {
    i = new New_dot();
    i.life = Math.random();
    stars.push(i);
}

function New_dot() {
    let n = this;
    let l = function () {
        return (Math.pow(Math.random(), .5) - 1) * (n.radius) * speed;
    };
    this.x = Math.random() * canvas.width + offset;
    this.y = Math.random() * canvas.height + offset / 2;
    this.radius = 2 * Math.random() + .5;
    this.vx = l();
    this.vy = .5 * l();
    this.life = 0;
    this.midlife = 0;
    this.size = 0;
    this.quota = 0;
    this.special = 0;
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    let x = stars.length;
    for (let i = 0; i < x; i++) {
        let s = stars[i];
        s.size = s.radius * Math.pow(s.life, .6);
        s.quota = s.size * (s.special ? 2.4 : 1.4) | 0;

        ctx.fillStyle = s.special ? "rgba(255,204,0, 1)" : "rgba(223,190,255, 1)";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    let pointer_quota = max_connect;
    ctx.beginPath();
    for (let i = 0; i < x; i++) {
        let starI = stars[i];
        if (pointer_quota && (distance(mouse, starI) < dist * starI.size)) {
            ctx.moveTo(starI.x, starI.y);
            ctx.lineTo(mouse.x, mouse.y);
            pointer_quota--;
        }
        for (let j = i + 1; ((j < x) && starI.quota); j++) {
            let starII = stars[j];
            if (distance(starI, starII) < Math.min(dist * Math.min(starI.size, starII.size) * Math.min(starI.quota, starII.quota), dist * max_connect)) {
                ctx.moveTo(starI.x, starI.y);
                ctx.lineTo(starII.x, starII.y);
                starI.quota--;
                starII.quota--;
            }
        }
    }
    ctx.lineWidth = .8;
    ctx.strokeStyle = "rgba(223, 190, 255, 0.4)";
    ctx.stroke();
}

function distance(point1, point2) {
    let xs;
    let ys;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}


function update() {
    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];

        s.life += (s.midlife ? -.0015 : .0015) / s.radius;
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

            if (s.x < -20 || s.x > canvas.width + offset || s.y < -20 || s.y > canvas.height + offset / 2) {
                if (s.special) {
                    special_count--;
                }
                stars.splice(i, 1);
            }
        }
    }
    for (let j = 0; stars.length < x + special_count;) {
        j = new New_dot();
        stars.push(j);
    }
}

window.addEventListener('mousemove', function (e) {
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

window.addEventListener("resize", function () {
    canvas.width = document.body.clientWidth;
    // canvas.height = 750;
    canvas.height = (window.innerHeight > 600 ? window.innerHeight : 600);
    document.getElementById("explore-background-con").style.top = canvas.height - 2 + "px";
    x = (canvas.height + offset / 2) * (canvas.width + offset) * 0.0004;
});

window.addEventListener("click", function (e) {
    if (e.clientY < canvas.height) {
        let rect = canvas.getBoundingClientRect(),
            s = new New_dot();
        s.x = e.clientX - rect.left;
        s.y = e.clientY - rect.top;
        s.life = .5;
        s.radius *= 1.5;
        s.special = 1;
        stars.push(s);
        special_count++;
    }
}, false);

// Update and draw

function tick() {
    draw();
    update();
    requestAnimationFrame(tick);
}

tick();

