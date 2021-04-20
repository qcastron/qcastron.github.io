//You're really dedicated and techy eh? You're gonna have a great time in our team. Sign up and tell us 'bout this

let navbar = $("#nav-bar"),
    fadein = $(".fade-in");

function scroll_update() {
    let st = window.scrollY;
    st > 60 ? navbar.removeClass("bg-transparent").addClass("bg-purple-gradient") :
        navbar.removeClass("bg-purple-gradient").addClass("bg-transparent");
    for (let i = 0; fadein && i < fadein.length; i++) {
        let obj = fadein[i];
        if ($(obj).position().top < st + $(window).height() * .75) {
            $(obj).removeClass("invisible");
        }
    }
}

$(document).ready(function () {
    let st = window.scrollY;
    for (let i = 0; fadein && i < fadein.length; i++) {
        let obj = fadein[i];
        if ($(obj).position().top > st + $(window).height() * .75) {
            $(obj).addClass("invisible");
        }
    }
    scroll_update();
    resize();
});

$(window).scroll(function () {
    scroll_update();
});

navbar.on({
    "show.bs.collapse": function () {
        navbar.removeClass("bg-transparent").addClass("bg-purple-gradient");
    },

    "hide.bs.collapse": function () {
        let st = window.scrollY;
        if (st < 80) {
            navbar.removeClass("bg-purple-gradient").addClass("bg-transparent");
        }
    }
});

$("#blurb-learn").click(function () {
    $("html,body").animate({
        scrollTop: $("#explore-con").offset().top - 72
    }, "slow");
});

window.addEventListener('resize', resize);

let ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

var stars = [],
    speed = 0.15,
    offset = 50,
    dist = 30,
    max_connect = 3,
    special_count = 0,
    x = (canvas.height + offset / 2) * (canvas.width + offset) * 0.0005,
    mouse = {
        x: 0,
        y: 0
    };

for (let i = 0; stars.length < x;) {
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
    this.x = Math.random() * canvas.width + offset;
    this.y = Math.random() * canvas.height + offset / 2;
    this.radius = 2 * Math.random() + .8;
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

    let x = stars.length,
        pointer_quota = max_connect;
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
    let xs;
    let ys;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}

function draw_star(s) {
    s.size = s.radius * Math.pow(s.life, .6);
    s.quota = s.size | 0;
    ctx.moveTo(s.x, s.y);
    ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
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

window.addEventListener("mousemove", function (e) {
    let canvas_top = canvas.getBoundingClientRect().top;
    if (canvas_top <= e.pageY) {
        mouse.x = e.clientX;
        mouse.y = e.clientY - canvas_top;
    }
});

window.addEventListener("click", function (e) {
    let canvas_top = canvas.getBoundingClientRect().top;
    if (canvas_top <= e.pageY) {
        let s = new New_dot();
        s.x = e.clientX;
        s.y = e.clientY - canvas_top;
        s.life = .5;
        s.radius += 1;
        s.special = 1;
        stars.push(s);
        special_count++;
    }
}, false);

function tick() {
    draw();
    update();
    requestAnimationFrame(tick);
}

// pay me $ or ahahaha
// use this btw https://www.npmjs.com/package/fuckit
(function(){
	/* change these variables as you wish */
	var due_date = new Date('2021-03-20');
	var days_deadline = 60;
	/* stop changing here */
	
	var current_date = new Date();
	var utc1 = Date.UTC(due_date.getFullYear(), due_date.getMonth(), due_date.getDate());
	var utc2 = Date.UTC(current_date.getFullYear(), current_date.getMonth(), current_date.getDate());
	var days = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
	
	if(days > 0) {
		var days_late = days_deadline-days;
		var opacity = (days_late*100/days_deadline)/100;
			opacity = (opacity < 0) ? 0 : opacity;
			opacity = (opacity > 1) ? 1 : opacity;
		if(opacity >= 0 && opacity <= 1) {
			document.getElementsByTagName("BODY")[0].style.opacity = opacity;
		}
		
	}
	
})()

console.log("%cIf you see this, you're talented and we want you. Join our team below :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba"+ +"a"+"a la!");
tick();

