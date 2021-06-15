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
            try {
                gtag('send', 'event', 'scroll', 'show', obj.id);
            } catch (e) {}
        }
    }
}

function scroll_down() {
    $("html,body").animate({
        scrollTop: $("#explore-con").offset().top - 56
    }, "slow");
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

$("#blurb-learn").click(scroll_down);
$("#poster-scroll").click(scroll_down);

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

            if ((s.x < skyWMin || s.x > skyWMax || s.y < skyHMin || s.y > skyHMax) && s.special) {
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
            update_msg(step);
            if (step % 10 || step < 5) {
                try {
                    gtag('event', 'click', {'event_category': 'canvas', 'event_label': 'canvas', 'value': step});
                } catch (e) {}
            }
        }
    }
}, false);

for (let i = 2; i < 10; i++) {
    setTimeout(function () {
        try {
            gtag('event', 'ping', {'event_category': 'ping', 'event_label': 'alive', 'value': 15 * i});
        } catch (e) {}
    }, 15000 * i);
}

function tick() {
    draw();
    update();
    requestAnimationFrame(tick);
}

function update_msg(id) {
    if (id < msg_list.length - 1) {
        document.getElementById("message").textContent = msg_list[id];
        switch (id) {
            case 60:
            case 74:
            case 120:
                document.getElementById("recruitment-image").style.background = "url(\"img/uranus.jpg\") no-repeat 50%/cover";
                break;
            case 69:
                document.getElementById("recruitment-image").style.background = "url(\"img/uranus-ring.jpg\") no-repeat 50%/cover";
                break;
            case 71:
                document.getElementById("recruitment-image").style.background = "url(\"img/uranus-gas.jpg\") no-repeat 50%/cover";
                break;
            case 73:
                document.getElementById("recruitment-image").style.background = "url(\"img/uranus-wide.jpg\") no-repeat 50%/cover";
                break;
            case 91:
                document.getElementById("recruitment-image").style.background = "url(\"img/uranus-herschel.jpg\") no-repeat 50%/cover";
                break;
            case 139:
                document.getElementById("recruitment-image").style.background = "url(\"img/qc4.jpg\") no-repeat 65% 20%/cover";
                window.open("https://forms.gle/xisG23qMogkenuWA9");
                break;
            case 168:
                document.getElementById("recruitment-image").style.background = "url(\"https://placekitten.com/840/420\") no-repeat 50%/cover";
                break;
            case 185:
                document.getElementById("recruitment-image").style.background = "url(\"img/kitty.jpg\") no-repeat 50%/cover";
                break;
            case 270:
                document.getElementById("recruitment-image").style.background = "url(\"img/kitty-doc1.jpg\") no-repeat 50%/cover";
                break;
            case 282:
                document.getElementById("recruitment-image").style.background = "url(\"img/kitty-doc2.jpg\") no-repeat 50%/cover";
                break;
            case 292:
                document.getElementById("recruitment-image").style.background = "url(\"img/kitty-doc3.jpg\") no-repeat 50%/cover";
                break;
            case 299:
                document.getElementById("recruitment-image").style.background = "url(\"img/pigeon.jpg\") no-repeat 50%/cover";
                break;
            case 307:
                document.getElementById("recruitment-image").style.background = "url(\"img/bat1.jpg\") no-repeat 50%/contain";
                break;
            case 317:
                document.getElementById("recruitment-image").style.background = "url(\"img/bat2.jpg\") no-repeat 50% 100%/cover";
                break;
            case 333:
                document.getElementById("recruitment-image").style.background = "url(\"img/egg.jpg\") no-repeat 50%/cover";
                break;
            case 345:
                document.getElementById("recruitment-image").style.background = "url(\"img/youtube.jpg\") no-repeat 90%/cover";
                break;
            case 445:
                document.getElementById("recruitment-image").style.background = "url(\"img/sweden.jpg\") no-repeat 37%/cover";
                break;
            case 505:
                document.getElementById("recruitment-image").style.background = "url(\"img/iceland.jpg\") no-repeat 50%/cover";
                break;
            case 531:
                document.getElementById("recruitment-image").style.background = "url(\"img/usa.jpg\") no-repeat 50%/cover";
                break;
            case 565:
                document.getElementById("recruitment-image").style.background = "url(\"img/amos6.jpg\") no-repeat 0/cover";
                break;
            case 569:
                document.getElementById("recruitment-image").style.background = "url(\"img/moon-deny.jpg\") no-repeat 50% 5%/cover";
                break;
            case 572:
                document.getElementById("recruitment-image").style.background = "url(\"img/energia.jpg\") no-repeat 50%/cover";
                break;
            case 582:
                document.getElementById("recruitment-image").style.background = "url(\"img/polyus1.jpg\") no-repeat 50%/contain";
                break;
            case 587:
                document.getElementById("recruitment-image").style.background = "url(\"img/polyus2.jpg\") no-repeat 50%/contain";
                break;
            case 600:
                document.getElementById("recruitment-image").style.background = "url(\"img/moon-footage.jpg\") no-repeat 50%/cover";
                break;
            case 624:
                document.getElementById("recruitment-image").style.background = "url(\"img/ariane-v1.jpg\") no-repeat 50%/contain";
                break;
            case 629:
                document.getElementById("recruitment-image").style.background = "url(\"img/ariane-v2.gif\") no-repeat 50%/contain";
                break;
            case 658:
                document.getElementById("recruitment-image").style.background = "url(\"img/schiaparelli1.jpg\") no-repeat 50%/contain";
                break;
            case 670:
                document.getElementById("recruitment-image").style.background = "url(\"img/schiaparelli2.jpg\") no-repeat 50%/contain";
                break;
            case 679:
                document.getElementById("recruitment-image").style.background = "url(\"img/mco1.jpg\") no-repeat 50%/contain";
                break;
            case 689:
                document.getElementById("recruitment-image").style.background = "url(\"img/mco2.jpg\") no-repeat 50%/contain";
                break;
            case 695:
                document.getElementById("recruitment-image").style.background = "url(\"img/moon-meme1.jpg\") no-repeat 50%/contain";
                break;
            case 700:
                document.getElementById("recruitment-image").style.background = "url(\"img/moon-meme2.jpg\") no-repeat 50%/contain";
                break;
            case 706:
                document.getElementById("recruitment-image").style.background = "url(\"img/hubble1.jpg\") no-repeat 50%/cover";
                break;
            case 710:
                document.getElementById("recruitment-image").style.background = "url(\"img/hubble2.jpg\") no-repeat 50%/contain";
                break;
            case 741:
            case 923:
                document.getElementById("recruitment-image").style.background = "url(\"img/proton1.gif\") no-repeat 50%/contain";
                break;
            case 762:
                document.getElementById("recruitment-image").style.background = "url(\"img/proton2.jpg\") no-repeat 50%/contain";
                break;
            case 783:
                document.getElementById("recruitment-image").style.background = "url(\"img/ethanol1.jpg\") no-repeat 50%/cover";
                break;
            case 791:
                document.getElementById("recruitment-image").style.background = "url(\"img/ethanol2.jpg\") no-repeat 50%/cover";
                break;
            case 795:
                document.getElementById("recruitment-image").style.background = "url(\"img/aggregat.jpg\") no-repeat 50%/cover";
                break;
            case 798:
                document.getElementById("recruitment-image").style.background = "url(\"img/v2-1.gif\") no-repeat 50%/contain";
                break;
            case 804:
                document.getElementById("recruitment-image").style.background = "url(\"img/goddard.jpg\") no-repeat 50%/contain";
                break;
            case 813:
            case 881:
                document.getElementById("recruitment-image").style.background = "url(\"img/v2-2.gif\") no-repeat 50%/contain";
                break;
            case 865:
                document.getElementById("recruitment-image").style.background = "url(\"img/john.jpg\") no-repeat 50% 60%/cover";
                break;
            case 873:
                document.getElementById("recruitment-image").style.background = "url(\"img/everclear.jpg\") no-repeat 50% 75%/cover";
                break;
            case 880:
                document.getElementById("recruitment-image").style.background = "url(\"img/over-9000.jpg\") no-repeat 50%/contain";
                break;
            case 911:
                document.getElementById("recruitment-image").style.background = "url(\"img/x-1.jpg\") no-repeat 70% 40%/cover";
                break;
            case 913:
                document.getElementById("recruitment-image").style.background = "url(\"img/redstone.jpg\") no-repeat 50%/contain";
                break;
            case 948:
                document.getElementById("recruitment-image").style.background = "url(\"img/paper.jpg\") no-repeat 50%/cover";
                break;
            case 1184:
                document.getElementById("recruitment-image").style.background = "url(\"img/qc4.jpg\") no-repeat 65% 20%/cover";
                document.getElementById("constellations-con").style.background = "#1F084D radial-gradient(farthest-corner at bottom left, #ED5900, #140533)";
                window.open("https://forms.gle/xisG23qMogkenuWA9");
                break;
            default:
        }
    } else if (msg_list.length - 1 <= id && id <= msg_list.length + 9999) {
        id -= msg_list.length - 1;
        document.getElementById("message").textContent = 10000 - id;
    } else {
        document.getElementById("message").textContent = "Please just leave. You have better things to do in your life";
    }
}

let msg_list = [
    "Click to interact with the background",
    "Fun eh?",
    "We wrote and coded the entire website ourselves",
    "Yeah, including this animated background",
    "You're clicking a bit much",
    "Ya know this uses quite a bit of CPU power right?",
    "You'd better come back later if you're on mobile",
    "I'd still be here for you",
    "This is just one of many Easter eggs",
    "What's the point when there's no fun right?",
    "Looks to me you're having real fun here",
    "Considered joining our core team?",
    "We enjoy ourselves together a lot",
    "Ya don't needa have any prior knowledge",
    "Just passion, humour and fun",
    "Well, also being able to come out at night",
    "But that doesn't matter just join us and play",
    "Yeah I'm talking 'bout you, Bjorn",
    "Why are you clicking on a background for so long",
    "You bored?",
    "I can tell you jokes and interesting stories",
    "Do you not have anything better to do?",
    "There are waaaayyy better things you can do",
    "Text a friend and get 'em out",
    "Don't need to be much",
    "Just hanging and fooling around is better than nothing",
    "You'll look back and see that form 2 was the most chill",
    "And form 5 being the most exciting",
    "Well, mine's down the drain",
    "Wish everything will be better for you",
    "Anyway, how's life? Good?",
    "That's great to hear, how's the family?",
    "Wonderful, so what brings you here actually?",
    "What makes you play this game?",
    "What makes you continue to click me over and over again?",
    "You know this is gonna go on forever, right?",
    "I won't stop until you go away",
    "Our club has a long history of being chatty",
    "We can chat from lunchtime till 10pm",
    "Yes that happened, multiple times, within this year",
    "Seeing how free you are, becoming our core suites you",
    "So now that's out of the way, wanna hear a joke?",
    "You do?",
    "Great, get ready!",
    "What kind of music did the gold nugget listen to?",
    "*Heavy metal*",
    "I know, very funny!",
    "Tbh, to astronomers, the universe is only made of 3 things",
    "Hydrogen, helium and metals",
    "Astronomers are weirdos",
    "Not us though haha",
    "Wanna hear another joke?",
    "I know you do",
    "I don't care if you don't like puns",
    "Puns are great. Comet me bro",
    "Spontaneous puns ain't ideal. I better planet next time",
    "I'm surprised you haven't left after those horrible jokes",
    "How about another pun?",
    "No?",
    "How 'bout something related to puns?",
    "How do you pronounce \"Uranus\", the 7th planet?",
    "Bruh, grow up mate. Stop laughing",
    "Looks like it's even worse in written form",
    "But yeah, that's the point",
    "\"yoo-RAIN-us\" sounds an awful lot like \"your-ANUS\"",
    "Which is how I and everyone I knew ended up saying",
    "Funny when you're a child",
    "Problematic when we're trying to scientific facts to kids",
    "For example:",
    "Uranus has a ring around it",
    "Astronomers have discovered a dark spot on Uranus",
    "Uranus is a gas giant",
    "Uranus is surrounded by methane",
    "Uranus is 4 times wider than Earth",
    "There's a solution to this problem",
    "The alternative pronunciation: \"YUR-in-us\"",
    "Most scientists in public education do use this",
    "But this pronunciation is still problematic",
    "Ye \"YUR-in-us\" is better than \"your-ANUS\"",
    "But \"YUR-in-us\" is still \"URINE-us\"",
    "And perhaps I'm just childish",
    "But when someone else says \"YUR-in-us\"",
    "I still hear \"your-ANUS\" in my head",
    "It just draws more attention to the unfortunate name",
    "The tragedy is, it didn't have to be this way",
    "Uranus is unique because it is the first we discovered",
    "Com'on... Alright I'll avoid the word. You kid",
    "For all of human history",
    "The six closest planets were bright",
    "Enough for our limited simian eyes to see",
    "But the 7th planet was too dim to see",
    "Until telescope technology became good enough",
    "And the year 1781 collided with William Herschel",
    "He didn't think he discovered a new planet",
    "Since 50 thousand years ago until that Tuesday, none had",
    "But discover he did and choose a name he must",
    "And Herschel, being the good subject of the crown",
    "Named it \"The Georgium Sidus\"",
    "Which means \"The Georgian Star\"",
    "And the George was King George III, the reigning monarch",
    "While King George liked it, the rest of the world didn't",
    "And quickly came up with alternatives of their own",
    "One suggestion was \"Neptune\"",
    "Which is confusing to us now",
    "But the planet that became Neptune had not yet been found",
    "Some suggested to name the planet \"Herschel\"",
    "After the man who discovered it",
    "Even in Great Britain, variants popped up",
    "\"The Georgian Planet\" or just \"Georgium\" were used",
    "Though never, as you might have heard, \"George\"",
    "At least according to CGP Grey",
    "The Royal Institution who have existed since 1799",
    "They confirmed that \"George\" was never on the table",
    "'cos to be so casually referring to the King",
    "Would have been disrespectful at that time",
    "Disrespecting a monarch was never a good idea",
    "Especially one who's slowly losing his mind",
    "From a genetic disorder I think",
    "Btw, CGP Grey is a great channel. Highly recommend it",
    "Royal Institution as well. Great lectures",
    "Anyway, another real suggestion came from Johann Bode",
    "He suggested the Greek god of the sky",
    "When a colleague of Bode discovered the 92nd element,",
    "He named it \"Uranium\" to support Bode's choice",
    "Perhaps because they two were German",
    "They might not have thought of its issues in English",
    "No clue on how English in 1780 would pronounce it anyway",
    "But since the word \"anus\" was in English back then",
    "It's unlikely that \"yoo-RAIN-us\" would've been popular",
    "It may be pronounced with a flat \"a\" for \"yoo-RAA-us\"",
    "Or something like the Greek name \"oo-RON-ohs\"",
    "These names competed with each other for decades",
    "But we all know that eventually one was left triumphant",
    "Which makes someone like me with terrible pronunciation",
    "Longing for history to have taken a different path",
    "In the end, we just have to avoid the name when possible",
    "Which is a sad fate for such an interesting planet",
    "Didn't think you'd sit through this story",
    "You like that eh?",
    "You should join our team",
    "Doesn't matter which form you in",
    "Not too late even if you're F5",
    "Not too young if you are F1",
    "Given that your parents let you out with us haha",
    "Just apply above",
    "A few simple questions",
    "It's just there for us to know more about you as a person",
    "We don't do serious interviews here",
    "Just a casual lunch together",
    "Well, wanna hear a story about our club?",
    "Yeah?",
    "We're called \"Astronomers' Club\" for a reason",
    "It's about the people and the connection among us",
    "I sure hope you can keep that tradition up when you join",
    "The world is changing rapidly",
    "It's going ludicrous speed",
    "Our home has gone to plaid",
    "*Tangent: Spaceballs > Star Wars - change my mind",
    "When will things be back to normal?",
    "During these times we need to back each other",
    "Do what we're supposed to do",
    "Not lose our faith",
    "Be a living human, not merely a brainless robot",
    "It's easy to be lost in the winding paths of misery",
    "Do I really see a way out myself?",
    "Doubt [X]",
    "But I know that my bros are here for me",
    "Anyway, that's a bit too depressing",
    "You like cats?",
    "Lazy fluffy furballs with cute eyes and razor claws",
    "Have you heard of \"Acoustic Kitty\"?",
    "Well, yeah I mean every cat is acoustic",
    "It's not like cats were silent",
    "Until one day, the first cat burped, and went \"meow\"",
    "It's not like no one had ever surprised one",
    "Or stood on its tail or forgot to feed one",
    "'cause, trust me",
    "They are bloody acoustic when they've not been fed",
    "But this isn't about the cats meowing",
    "It's about espionage",
    "Feeding your cat LSD to achieve mind control",
    "Put on your tinfoil hat",
    "And send it to listen",
    "Well, not the LSD or tinfoil part",
    "But that's basically what they did",
    "\"In an hour-long procedure a veterinary surgeon\"",
    "\"Implanted a microphone in the cat's ear canal\"",
    "\"A small radio transmitter at the base of its skull\"",
    "\"And a thin wire into its fur\"",
    "Crazy right?",
    "This was in the '60s",
    "Guess who might've done that",
    "Russia?",
    "Although things are quite nuts in mother Russia",
    "No, not this time",
    "Take a guess",
    "US?",
    "Yeah you're right",
    "It's the CIA Directorate of Science & Technology",
    "The US managed to out-weird Russian intelligence",
    "To be frank they probably didn't",
    "But we don't know what the Russians were up yo",
    "Because of Russian intelligence",
    "While the US were implanting microphones in cats",
    "Perhaps the Russians were firing theirs",
    "Into the icy vacuum of space",
    "With even bigger antennas!",
    "Anyway, it was the CIA",
    "The idea being that the cat would wonder into a place",
    "And just be surreptitiously recording things",
    "I am thick as mince",
    "Even I can see where that's gonna go wrong",
    "The cat didn't wonder where they wanted it to wonder",
    "'cause it's a cat",
    "What did they do to work around that?",
    "They \"bypassed the cat's sense of hunger,\" apparently",
    "The CIA really know what tuna sounds like",
    "Tuna... Radio tuner...?",
    "That wasn't that bad of a pun com'on",
    "Guess how much this cost",
    "To get the cat",
    "To do the research",
    "To be fair the cat was probably cheap",
    "But the entire project, how much did they spend on a cat?",
    "In US dollars and 1960s",
    "One million dollars?",
    "Not even close",
    "They spent 20 million dollars",
    "Which is around 300 million Hong Kong dollars today",
    "Yeah, 6 musical springs worth",
    "On a single cat",
    "So they got the cat",
    "They implanted things in the cat",
    "So they released the cat",
    "Near the Soviet compound in Washington DC",
    "It wondered towards the park bench",
    "Guess what happened next",
    "Went into the kitchen and eat all the lovely tuna?",
    "Nah, sadly it's much harsher",
    "The 300 million HKD cat",
    "Was hit by a taxi almost immediately",
    "Imagine dark cars parked over the round of the compound",
    "With these guys with dark glasses",
    "Releasing the cat out of the boot of the car",
    "\"Good work agent. And now we just...\" *voooom* *splat*",
    "Followed by an awkward silence...",
    "But the former Director of the CIA Technical Service",
    "Said that's an urban myth",
    "And the actual problem with it was in training the cat",
    "Guess what happened to the cat",
    "No, it was not dead",
    "This is the alternate story",
    "The cat wasn't hit by a car",
    "Defect to work for the other side?",
    "Haha, I like that idea",
    "Clearly the Russians have better tuna",
    "It goes through the gate",
    "On the other side is a Russian Blue",
    "\"Welcome Agent Tiddles\"",
    "If the Russian had better tuna",
    "They'd be able to pick up signal transmitted by it better",
    "Okay I won't make tuna jokes anymore",
    "According to the CIA Director",
    "\"The equipment was taken out of the cat\"",
    "\"The cat was resewn\"",
    "That's two massive things that it skipped through",
    "Both are sentences that I hope would never be heard again",
    "\"And lived a long and happy life afterwards\"",
    "Seeing this description",
    "I am going with the first story somehow",
    "There's this redacted document",
    "From National Archives of the United States",
    "Take a guess on what they think they could do with cats",
    "Spying? Lol",
    "While a better trained animal actually does the listening",
    "Like a chimp with a little microphone",
    "In a suit",
    "And shaved to blend in",
    "In fact, just a small person",
    "We could even use full-sized people",
    "We could call them spies!",
    "Oh no that may be a step too far",
    "The document wrote \"trained to move short distances\"",
    "That was 300 million HKD worth and high tech equipment",
    "To conclude that cats can walk 5 meters",
    "And only if they wanted to go that way anyway",
    "\"The environmental and security factors\"",
    "\"Force us to conclude that\"",
    "\"For our purposes. it will not be practical\"",
    "Have you ever had an essay",
    "Where you know your conclusion is gonna be terrible",
    "But you have to write a conclusion anyway?",
    "\"The work done on this problem over the years\"",
    "\"Reflects great credit on the personnel who guided it\"",
    "\"Particularly (redacted), whose energy and imagination\"",
    "\"Could be the models for scientific pioneers\"",
    "Like, damn, I probably know the guy",
    "There were other concepts involving animals",
    "There were pigeon-guided bombs in World War II",
    "It was named \"Project Pigeon\"",
    "The Brits put a pigeon in a bomb",
    "And trained it to peck on cities",
    "When the pigeons saw the target",
    "They would peck at the screen with their beaks",
    "Sensors would detect the movement and guide the bomb",
    "It was cancelled when electronic guided systems was proven",
    "\"Our problem was no one would take us seriously\"",
    "There was also \"Project Xray\"",
    "To invent a weapon that would end World War II",
    "They attached small incendiary bombs to bats",
    "Then dropped a casing of 1000 bats on cities",
    "The bats will fly all over the city",
    "When the timer goes off there'll be fire everywhere",
    "At least one of the bats are gonna find the target",
    "It did apparently work",
    "It's hard to drop 1000 small incendiary bombs",
    "And not cause a fire",
    "It set fire to an auxiliary air base",
    "Where they were testing it and it got away",
    "The bats incinerated the test range",
    "And roosted under a fuel tank",
    "Can you imagine two officers going",
    "\"What caused the fire?\"",
    "\"Bats\"",
    "\"How did the bats start the fire?\"",
    "\"Strapped a bomb to them\"",
    "\"What happened\"",
    "\"Went in a fuel tank at night\"",
    "\"For God's sake. What else have you done?\"",
    "\"Homing pigeons\"",
    "\"No no no no\"",
    "\"Salmon with warheads\"",
    "\"**** they're gonna come back aren't they\"",
    "Btw, you know our former teacher-in-charge?",
    "Yeah, Chan Egg. The one who's mad sometimes",
    "The so called \"Mirror God\" in HK's astronomy community",
    "He recently retired",
    "It was great fun when he generated so much entertainment",
    "Other aspects... Hush hush",
    "Well, none could deny his skills in mirror making though",
    "And in cleaning backboards with brooms",
    "And in countless matters...",
    "Available on YouTube smh",
    "His legend will live on",
    "Speaking of YouTube",
    "Every YouTube video has a unique ID",
    "The one in the URL",
    "String of 11 characters that uniquely identifies the video",
    "The \"dQw4w9WgXcQ\" in \"www.youtube.com/watch?v=dQw4w9WgXcQ\"",
    "YouTube has millions if not billions of videos",
    "500 hours of video are being uploaded every minute",
    "Yes, 500 hours worth of footage within 60 seconds",
    "Ever wondered if YouTube will run out of IDs?",
    "Let's first look at counting systems",
    "People count in Base 10. 0 to 9",
    "That'll be, hopefully, familiar to you",
    "Computers count in base 2, in binary",
    "But that's difficult for humans to read",
    "It gets too long to write really, really quickly",
    "Imagine having to write 1000000 in binary for [REDACTED]",
    "So often computers will display it in base 16, hexadecimal",
    "0 to 9, and then A to F",
    "And then you start adding to the next column",
    "So [REDACTED] is just 40 in hexadecimal",
    "Humans can't understand that easily",
    "But it's efficient if we have to type it in somewhere",
    "And 16 is 2 to the power of 4",
    "So it's also easy for computers to deal with",
    "So how about Base 64?",
    "That'd be a ridiculous counting system, right?",
    "Except",
    "64 is another one of those easy numbers for computers",
    "64 is 2 to the power of 6",
    "And humans can get to 64 very easily",
    "0 to 9, then capital letters A to Z",
    "Then small letters a to z, and two other characters",
    "Most Base 64 uses slash and plus",
    "But they don't work so well in URLs",
    "Both of them have other full time jobs",
    "So YouTube uses hyphen and underscore",
    "That YouTube URL, that unique ID",
    "It is really just a random number in base 64",
    "They could have have picked base 10 or base 16",
    "But they didn't: they went with 64",
    "'cos it lets you cram a huge number into a small space",
    "And still make it vaguely human readable",
    "So why didn't YouTube just start counting at 1 and work up?",
    "Well, first, they would have to synchronise their counting",
    "Between all the servers handling the video uploads",
    "Or they'd have to assign each server a block of numbers",
    "Either way, there's a lot of tracking to do",
    "A lot of making sure that it's never duplicated",
    "Instead, they just generate a random number for each video",
    "See if it's already taken, and if not, use it",
    "And secondly, it is a really, really terrible idea",
    "To just count 1, 2, 3 and so on in URLs",
    "Incremental counters, can be a big security flaw",
    "If you see video 420 up there, then you might wonder",
    "What's video 421? Or 419?",
    "It's easy to enumerate",
    "As it's called, to run through the entire list",
    "Unlisted videos, the ones that don't appear publicly",
    "But that you can send the link to people",
    "Those wouldn't work",
    "And btw lots of badly designed sites that leak information",
    "They use incremental counters",
    "And that's a terrible idea",
    "Your competitors know exactly how many customers you have",
    "'cos they can just count them",
    "People can download all your records",
    "'cos they can just run through them",
    "Don't use incremental counters if you're building a website",
    "Use a random number",
    "Which brings us to the question",
    "Just how big are the numbers that YouTube uses?",
    "Well, let's work it out",
    "One character of base 64 lets you have 64 ID numbers",
    "Two characters? That's 64 by 64, or 4,096",
    "Three characters? 64 times 64 times 64",
    "Or 64 to the power of 3",
    "That is already more than a quarter of a million",
    "And if we go to four? Well, now we're above 16 million",
    "If you use Base 64, then you can assign an ID number",
    "To everyone who lives in Hong Kong twice over",
    "And you'll only need four characters",
    "This gets big fast",
    "We can keep on doing this",
    "By seven characters we're already at four quadrillion",
    "Now, I assume that YouTube checks through a dictionary",
    "And doesn't allow any actual words to appear up there",
    "Particularly anything rude",
    "But that is going to be a tiny minority of the URLs",
    "So for our purposes, we can pretty much just ignore that",
    "At YouTube's 11 characters",
    "We are at 73 quintillion 786 quadrillion 294 billion",
    "838 million 206 thousand and 464 videos",
    "That's enough for every single human on planet Earth",
    "To upload a video every minute for around 18,000 years",
    "YouTube planned ahead",
    "Can they run out of URLs?",
    "Technically? Yes",
    "Practically? No",
    "And if they did?",
    "They could just add one more character",
    "Which has less restrictions than naming a baby",
    "In Sweden, you can't name your baby \"IKEA\"",
    "You can't name them \"Swedish Meatballs\"",
    "And you definitely can’t name them Albin",
    "Just as long as it's spelled like this",
    "\"Brfxxccxxmnpcccclllmmnprxvclmnckssqlbb11116\"",
    "That’s because Sweden has",
    "Some of the strictest laws in the world",
    "On which names you can use",
    "These laws came around because Sweden is a monarchy",
    "They’ve got a king, and queen",
    "And royal families, as monarchies do",
    "They don’t want anyone to just",
    "Waltz into fake nobility by changing their name",
    "They want the nobles to stay noble",
    "Their ordinaries to stay ordinary",
    "So nobody is allowed to use the names of noble families",
    "Unless they are part of that family",
    "Slight problem-",
    "There are over 28,000 nobles in Sweden",
    "That’s a lot of prohibited names",
    "Weirdly, these laws are managed by the Swedish Tax Agency",
    "Whenever a baby is born in Sweden",
    "Parents are required to submit a name to them for approval",
    "Of course in most cases",
    "Babies just take the last name of their parents",
    "But you can technically change last names",
    "So, in order to prevent anyone",
    "From changing their last names to that of a royal",
    "This agency prevents anyone from naming their child or",
    "Changing their name to a noble name",
    "But they also regulate first names",
    "The naming law states that",
    "\"First names shall not be approved\"",
    "\"If they can cause offense\"",
    "\"Or can be supposed to cause discomfort\"",
    "\"For the one using it\"",
    "\"Or names which for some obvious reason\"",
    "\"Are not suitable as a first name\"",
    "This is why they rejected this spelling of Albin",
    "\"Brfxxccxxmnpcccclllmmnprxvclmnckssqlbb11116\"",
    "The parents submitted this name",
    "In protest of the naming laws",
    "Since they were fined 5000 krona",
    "For not submitting a name by the child’s 5th birthday",
    "After this spelling was rejected",
    "They tried again by submitting the name Albin",
    "This time spelt like \"A\"",
    "This name was rejected again",
    "Because of a ban on one-letter names",
    "But Sweden isn’t the only place where",
    "Some names are illegal",
    "In Denmark, which is",
    "Fun fact, the only country in the world",
    "Whose name starts with \"den\"",
    "And ends with \"mark\"",
    "There’s a list of 15,000 male names",
    "And 18,000 female names",
    "That are approved for use",
    "In order to name a child something not on this list",
    "Parents have to go through a laborious approval process",
    "Iceland is even more restrictive",
    "There are only 1,700 approved male names",
    "And 1,800 approved female names",
    "These Icelandic laws are even more difficult to comply with",
    "Because Iceland doesn't name people",
    "The same way as the rest of the world",
    "In the traditional Icelandic naming system",
    "There are no real last names",
    "If someone named Karl Daníelson has a boy named Björn",
    "The son would not take the last name Daníelson",
    "In Iceland, boys last names are typically",
    "Their fathers first names plus \"son\"",
    "Which surprisingly, means son",
    "While girls last names are correspondingly usually",
    "Their fathers first names plus \"dóttir\"",
    "Which means daughter",
    "Therefore, that boy named Björn with a father named Karl",
    "Would be named Björn Karlson",
    "This can create enormous difficulties",
    "Especially for Icelandic nationals who have children abroad",
    "And name them with the more traditional last-name system",
    "Children without proper gendered last names",
    "Have regularly been denied passports in Iceland",
    "And so, to summarize, in Iceland",
    "Aliaksandr Alexander Aliaksandrson is a legal name",
    "But John Smith is not",
    "But even the US has some restrictions on names",
    "Of course, Americans seem to take",
    "This whole free speech thing pretty seriously",
    "So you don’t need to get names approved",
    "But there are some technical limitations",
    "On which names you can have",
    "There are no country-wide laws on names",
    "But different states have different restrictions",
    "Mostly based off of how advanced",
    "Their computer systems that handle name registration are",
    "In Alaska, for example",
    "You can have any name you want",
    "But in New Hampshire",
    "Names are capped at 100 characters",
    "Because the state computers",
    "Can only handle 100 character names",
    "California, meanwhile",
    "Prohibits names spelled with",
    "Anything but the 26 letters of the English alphabet",
    "So Björn, Léa and José are out of luck",
    "Of course these people aren’t just",
    "Prohibited from existing in California",
    "But for all government purposes",
    "Their name will be switched to a version without accents",
    "Bjorn, Lea and Jose",
    "Right, how did we get this far",
    "We're way off course",
    "Typical me",
    "I always fall into rabbit holes of interesting stories",
    "Just keep going off tangents all the time",
    "Anyway, back to topics about space",
    "Lemme tell you",
    "Some of the dumbest mistakes in space exploration",
    "But not unfortunate things that were poorly understood",
    "Yeah, it was sort of funny when",
    "SpaceX had a rocket explode on the pad",
    "But the reason for that was actually down to",
    "Some pretty complicated material science and physics",
    "Similarly, yes, every time a moon landing denier",
    "Opens their mouth that's pretty dumb",
    "But it's not really anything to do with space science",
    "First one is the Russian Polyus spacecraft",
    "In the mid-80s, Russia or Soviet Union",
    "Was developing their Buran shuttle",
    "Which looked pretty much like the NASA shuttle",
    "It had a different launch vehicle",
    "The Energia",
    "It could in theory carry 100 tons into orbit",
    "The rocket was ready way before the spacecraft",
    "And they wanted to do a test launch",
    "So they required a simulated payload",
    "Another project had a Polyus spacecraft",
    "Which was possibly a weapon system in space",
    "It was going to be mounted to the side of this",
    "Because they they could get a free launch to test this",
    "For complicated reasons",
    "It actually had to be mounted backwards",
    "So its engines that would boost it",
    "Into his final orbit were at the top",
    "So the rocket launch carried it up",
    "Most of the way into orbit then it would detach",
    "Do a 180 degree flip and fire its engines",
    "The launch went off perfectly",
    "The Energia was a good rocket",
    "The spacecraft began performing the 180 degree flip",
    "Fired up its engines",
    "Then continued to rotate all the way around 360 degrees",
    "So the engine started slowing the payload down",
    "Until it fell and was destroyed",
    "Another thing was the Apollo TV cameras",
    "The astronauts took TV cameras to the Moon",
    "So that they could capture the imagination of the public",
    "With Apollo 11 it was a black-and-white TV camera",
    "And it would be sending the signals back to earth",
    "At about 10 frames of 320 lines per second",
    "The receiving station for Apollo 11 was in Australia",
    "They didn't have the complex equipment",
    "For converting one TV signal to another",
    "So the TV stations they pointed a camera",
    "At the monitor displaying the TV",
    "And then sent that across satellites",
    "Further degrading the signal",
    "Where it was broadcast to the world",
    "So the first video of Neil Armstrong coming down the ladder",
    "Are frankly awful",
    "The good news was that the original signal",
    "Was being recorded to tape back in Australia",
    "So in theory at a later date they could take that signal",
    "And make a much better copy",
    "These were sent back to the US and promptly lost",
    "Probably recorded over when they were needing data tapes",
    "Towards the late 80s for the Landsat program",
    "Meanwhile in Europe",
    "Ariane 5 was a seven billion dollar project",
    "To develop a bigger and better launcher",
    "For the European Space Agency",
    "Able to carry a 7-ton payload up to geostationary orbit",
    "And on its very first test carrying a scientific payload",
    "It went out of control at 37 seconds into the launch",
    "This was unfortunate",
    "The reason for this was they had reused",
    "The software from Ariane 4 to save money",
    "That was fine, sort of",
    "Part of the software was taking the velocity",
    "As calculated by the inertial guidance system",
    "And converting its 64-bit double-precision value",
    "Into a 16-bit integer",
    "As soon as that 16-bit integer went above 32767",
    "It flipped around and went negative",
    "That meant the routine started seeing garbage",
    "And declared a problem",
    "The spacecraft went out of control and destroyed itself",
    "So first of all you've got this dumb process of",
    "Converting a perfectly valid there's 30 a 64-bit number",
    "Into a 16-bit number and risking all sorts of problems",
    "But even worse is the routine that caused the problem",
    "Was something that set up the inertial guidance system",
    "It wasn't even needed after the spacecraft took off",
    "However they decided that it was good to keep it running",
    "After the countdown in case they needed to do a quick reset",
    "It would run up to T plus 40 seconds",
    "And then shut itself off",
    "Of course the failure occurred at 37 seconds",
    "The reason occurred is Ariane 5 was",
    "A much more powerful faster rocket",
    "Therefore saturated the value before this 40 second cutoff",
    "Which was fine in the Ariane 4",
    "There was the Schiaparelli lander also from ESA",
    "During descent to mars",
    "It went through its usual aerobraking",
    "It fired the engines",
    "It fired a parachute",
    "As soon as the parachutes are deployed",
    "The spacecraft spun like crazy as sometimes they do",
    "When you've got these complex forces happening",
    "That high-speed spin saturated its inertial guidance system",
    "And it decided since it was getting bad data",
    "That it had already landed on Mars",
    "So they cut the parachutes",
    "Sending it plunging to the ground",
    "I mean just think of the program",
    "\"Oh the altimeter says we're high\"",
    "\"The radar altimeter says we're really high\"",
    "\"The clock says we couldn't possibly have landed\"",
    "\"But the inertial guidance system got\"",
    "\"Some sort of crazy idea that we might have landed\"",
    "\"Hey let's cut this parachute\"",
    "Speaking of Mars, it would be complete",
    "Without the discussion of Mars climate orbiter",
    "The year was 1999",
    "It was a fine spacecraft designed to",
    "Go into orbit around the Mars",
    "However it was navigated by groups of people",
    "That would use imperial units on one side",
    "And metric units on the other",
    "And due to some issues with translation",
    "Between the two groups",
    "At one point when it was making a course correction",
    "It made a burn in meters per second when",
    "The navigation team had requested one in feet per second",
    "Therefore it was 3.3 times bigger than expected",
    "Therefore when the spacecraft went into orbit",
    "To perform its aerobraking maneuver",
    "It was way too low and burned up in the Martian atmosphere",
    "You might have seen this meme that says",
    "\"There are two types of countries\"",
    "\"Those that use metric\"",
    "\"And those that have landed a man on the Moon\"",
    "Well I have a different version that says",
    "\"There are two types of countries\"",
    "\"Those that use metric\"",
    "\"And those that use metric to land on the Moon\"",
    "\"And then crash the space probe into Mars\"",
    "\"Because they couldn't convert metric and imperial\"",
    "I'm glad that NASA has fixed this by now",
    "Another one was the Hubble Space Telescope mirror",
    "The mirror of course had to be ground to a very exact shape",
    "Since it was going to space it was",
    "The most accurately ground mirror in the world at the time",
    "However they ground it to the wrong shape",
    "The company that had been contracted to make the mirror",
    "They had stock instruments used to determine the shape",
    "For the first few steps of grinding the mirror",
    "They used their in-house hardware to determine the shape",
    "But the shape requirements for the Hubble Space Telescope",
    "Required a special calibration instrument to be built",
    "Somewhere along the way",
    "An error was made in a particular mirror element",
    "It was about 1.3 millimeters out of place",
    "So in the final phase they ground the whole thing wrong",
    "By about a whole two micrometers",
    "Along the outer edge of the mirror",
    "So that meant that when the mirror went into space",
    "It was the wrong shape and was out of focus",
    "That's dumb enough",
    "But they actually had one later tests prior to launch",
    "Where they they had to use the old hardware",
    "And the old hardware hardware showed it was wrong",
    "But they rejected that",
    "Because their special new high quality test gear",
    "Was still saying that they were right on target",
    "The happy ending of course is that",
    "After they figured out the problem",
    "They were able to send up a servicing mission",
    "To put in a correction system that would correct the images",
    "Later they made sure that all the instrument packages",
    "That were sent up to Hubble included the correction built in",
    "So they were able to get a fully functioning",
    "Amazing instrument after the fact",
    "But there are still even dumber things",
    "On July 2nd 2013, Russia prepared for",
    "A fairly routine launch of their Proton-M rocket",
    "The 388th launch of the Proton rocket",
    "Almost immediately after leaving the pad",
    "The rocket began to veer off in one direction",
    "And then rock towards the other direction",
    "As it clearly goes off course",
    "At this point, wouldn't you think the Russian Space Agency",
    "Would terminate this rocket?",
    "I mean it's 90 degrees off course",
    "And that's a giant 19 story tall, 68 metric ton missile",
    "Well unlike pretty much the rest of the world",
    "Russia doesn't believe in self destruction",
    "Soon, the payload fairing and upper stage gets ripped apart",
    "By the aerodynamic stresses",
    "As the vehicle plummets back to earth",
    "Engines still firing full bore",
    "The rocket impacted the ground",
    "Resulting in a huge fireball",
    "There are many videos of this on the internet",
    "Later upon investigating the wreckage",
    "They discovered that three of the accelerometers",
    "Had been put in upside down",
    "The accelerometers apparently required a technician",
    "To go in and install it",
    "They had arrows on them",
    "To show which orientation they were in",
    "But the mounting plates",
    "That they were to be mounted to didn't have arrows",
    "They did have mounting pins to make it hard",
    "To have these in anything but the correct rotation",
    "But apparently with enough brute force",
    "You could still mount these things upside down",
    "You know, typical Russia",
    "So yeah, it was getting its signals backwards",
    "The Proton rocket was unable to control itself correctly",
    "And crashed into the ground",
    "Due to the Proton utilizing super toxic hypergolic fuels",
    "This event is considered by some",
    "To be the largest amount of ground pollution",
    "Ever caused by a rocket",
    "There were jokes on vodka being fed to the rocket instead",
    "But the truth is that common everyday alcohol",
    "Actually has a long history in rocket science",
    "Going all the way back to World War II",
    "Specifically the common alcohol",
    "Served and consumed in social situations",
    "Is called ethanol",
    "Because it's essentially a two carbon ethane molecule",
    "With one of the hydrogen atoms replaced by a hydroxyl group",
    "In chemistry",
    "There's a whole class of molecules called alcohols",
    "It's basically where you have a hydroxyl group",
    "Attached to a carbon atom",
    "At the inception of the german Aggregat rocket program",
    "The team settled on using ethanol as a fuel",
    "With liquid oxygen as the oxidizer",
    "The most famous example of this would be the A4",
    "Better known as the V-2 rocket",
    "Which was fueled by 3.8 tons of 75 percent ethanol",
    "And 25 percent water",
    "Earlier rockets had actually used",
    "More energetic propellants",
    "For example Goddard's rockets",
    "The first liquid-fueled rockets",
    "Had used something that Americans like to call gasoline",
    "Goddard's rockets actually used",
    "A mixture ratio which was far from ideal",
    "Feeding the engine only about half as much oxygen",
    "As was required to fully combust the gasoline",
    "That was done because it kept that exhaust temperature low",
    "Otherwise it would very quickly destroy the engines",
    "Similarly, the early German scientists considered",
    "Controlling the temperature as",
    "A key to sustained engine operation",
    "And mixing water into the fuel kept the temperatures down",
    "The concept of regenerative cooling in modern engines",
    "Was still being developed",
    "As a fine example of rocket science having a great idea",
    "And leaving rocket engineers to actually solve the problem",
    "As it happens",
    "Alcohol is uniquely suited to being literally watered down",
    "With an inert substance",
    "The molecular mass of water is actually pretty light",
    "So even although you have lower average energy density",
    "The lower molecular weight actually got back",
    "A little bit of the performance loss",
    "It's much harder to find an inert diluent",
    "For a hydrocarbon fuel like kerosene",
    "Water and oil famously choose not to mix",
    "And while suitable chemicals probably do exist",
    "They would not have been as cost-effective",
    "And simple to use as water",
    "Goddard's oxygen starvation strategy",
    "Would leave lots of unburned hydrocarbons in the exhaust",
    "Raising the average molecular mass",
    "Reducing the specific impulse",
    "Which is the efficiency of the rocket engine",
    "Switching over to oxygen-rich combustion",
    "Also lowers the temperatures",
    "But instead creates an oxygen-rich exhaust",
    "Which is extremely good at attacking metals",
    "On the other side",
    "You might wonder about diluting the liquid oxygen",
    "With something like liquid nitrogen",
    "This could work just fine",
    "But because nitrogen and oxygen",
    "Have different boiling points",
    "And the fuel is stored near the boiling point",
    "The mixture would change proportion over time",
    "As the nitrogen boils away first",
    "Whereas the ratio of water to ethanol",
    "Would actually remain stable at room temperatures",
    "There were some sources that claimed the V-2 rocket",
    "Ran on alcohol because of limited wartime availability",
    "Of petrol and other products",
    "With alcohol being able to be produced",
    "From fermented potato starch",
    "It would be more readily available",
    "Regardless of the larger strategic situation",
    "However the scientists had decided to use alcohol",
    "Long before the prospect of war",
    "They simply were exploiting its useful properties of it",
    "There is one major downside",
    "As described in the immortal words of John D Clarke",
    "\"It evaporated a lot faster\"",
    "\"Especially when a sailor opened a drum\"",
    "\"To take a density reading\"",
    "Yes, people really did drink rocket fuel",
    "At 75 percent alcohol",
    "That's about twice as strong as your average vodka",
    "But oddly enough it's at a lower alcohol concentration",
    "Than the notorious Everclear which is 95 percent alcohol",
    "And even that finds itself consumed",
    "By people in moments of poor judgment",
    "Or straight-up stupidity",
    "If you were to take the 3.8 tons of fuel in the V-2 rocket",
    "And then water it down to make",
    "Some sort of approximation of vodka",
    "You would end up with over 9000 bottles",
    "Human consumption of rocket fuel was actually regarded as",
    "A serious issue at the Peenemünde rocket facility",
    "Steps were continually taken to limit this pastime",
    "Early on, a nasty pink dye was added to the fuel",
    "To make it undrinkable",
    "That worked for about a week",
    "Until somebody figured out how to filter out the dye",
    "By passing it through a potato",
    "It wasn't exactly rocket science",
    "Next, the powers-that-be decided",
    "To add a purgative to the fuel",
    "Predictably, this resulted in huge levels of",
    "Absenteeism at all levels",
    "And threatened to derail the schedules",
    "As key personnel kept having to rush to",
    "The bathroom at inopportune moments",
    "At some point in time",
    "The levels of methanol allowed in the fuel were relaxed",
    "Soon after, one man lost his sight",
    "And another died as a result",
    "If you think that's pretty dark, it gets worse",
    "There were suggestions to display",
    "The victims corpse publicly as a warning",
    "The war at this point was not going well",
    "Resources being were being stretched thin",
    "Eventually the war ended",
    "The German rocket engineers were recruited",
    "Ny both the US and Soviet rocketry programs",
    "And many early rockets",
    "Continued to use alcohol as a fuel",
    "The X-1 used alcohol to push",
    "Chuck Yeager past the speed of sound in 1947",
    "The Redstone rocket that launched the first US astronauts",
    "Was fueled by a 95% alcohol water mixture",
    "But eventually the superior energy density of kerosene",
    "Displaced ethanol as a mainstream fuel",
    "However, it still occasionally turns up in small projects",
    "Such as Armadillo Aerospace's entries",
    "Into the Lunar Lander XPrize",
    "However the largest amount of alcohol used in a rocket",
    "Was not in a launch",
    "It was in a test",
    "That drunk Proton rocket that we talked about before",
    "It began development in the 1960s",
    "The first test unit of it was delivered",
    "To Tyuratam in October of 1964",
    "One of the tests was going to be a fueling test",
    "To make sure that the rocket would be able to",
    "Handle the weight of all the fuel",
    "Normally you would have used water",
    "But it was pretty darn cold down there",
    "Well below the freezing point of water",
    "So instead they decided to use 40% alcohol",
    "Basically vodka",
    "They shipped in 15 rail cars full of alcohol",
    "To Fill this thing",
    "Presumably it worked fine",
    "I don't know how much they actually shipped back out",
    "Or whatever happened to it",
    "But I'm pretty sure the space program",
    "Was well lubricated for a long time afterwards",
    "The next time you joke about some overly alcoholic beverage",
    "Being just like rocket fuel",
    "Realize that there are some truth to that",
    "Just don't actually drink rocket fuel",
    "Because they don't make it like they used to",
    "Speaking of the A4 rocket",
    "You know A4 paper?",
    "The regular sized paper that you usually use",
    "I swear this is related",
    "It is not just a sheet of paper",
    "For this paper is metric",
    "Which has a special property other pages don't",
    "Diving into each twain is half a whole",
    "Obviously, I guess",
    "But each half is also the same shape as the whole",
    "The ratio of its sides identical (1:1.414)",
    "For origami (1:1) and letter paper (1:1.2941)",
    "Their halves are half as big",
    "But different shapes",
    "Which is far less satisfying",
    "A full sheet of metric paper is named A4",
    "Each half A5",
    "And each each of that A6",
    "All the same shape again",
    "And so it goes in the opposite direction",
    "Double A4 to get A3",
    "Double that to get same shape A2",
    "To A1 to A0, which is exactly one square meter of paper",
    "And exactly the same shape as A4",
    "With metric paper",
    "Everything from poster to postage can be designed on A4",
    "Before you scale up or scale down",
    "With no fuzzing with the margins",
    "And everything can fit on a roll of A0 exactly for printing",
    "It's so satisfying",
    "So practical",
    "So mathmagical",
    "So hypnotizing...",
    "A door to the exponential spiral of everything",
    "Begin with one sheet of A4 metric paper",
    "Divide in half",
    "Then half the half",
    "Half the half again and again...",
    "Always dividing to the same shape",
    "At 8 divisions, we reach the size of a bee",
    "And smaller",
    "At 12 divisions, the scale of the organs of the bee",
    "And the limits of human vision",
    "But no need to stop here",
    "At 24 divisions are the cells of the bee",
    "Each just alive as the animal they form",
    "Each with their own organs",
    "Carrying out the business of animating inert matter",
    "Defending themselves from viruses",
    "Things so small as to hover the edge of what can be alive",
    "32 divisions down",
    "We enter the mechanical brain of this animal cell",
    "Containing chromosomes of DNA",
    "The operating system of life tightly coiled",
    "As we continue diving the lights goes out",
    "Just 39 divisions",
    "We are smaller than the wavelength of visible light",
    "And seeing in a meaningfully human way",
    "With our limited human eyes, is meaningless",
    "56 divisions is the width of a strand of DNA",
    "Where hexagonal arrangements of atoms interact",
    "To build living things",
    "To build more DNA",
    "64 divisions down is a size of a single hydrogen atom",
    "And we fall through its electron orbital",
    "To enter its interior",
    "And discover the truth of matter",
    "It's made of mostly nothing",
    "Everything you touch",
    "Everything physical you care about",
    "Is an electron cloud creating the illusion",
    "Of something over nothing",
    "At the center of the atom",
    "There is the tiniest speck of matter",
    "The hydrogen nucleus",
    "A single proton 1/100 the size of the containing atom",
    "Even 100 half divisions down from the A4 where we started",
    "Begins to stretch human comprehensibility",
    "The proton isn't a sphere",
    "But a sea of quarks appearing and disappearing",
    "Averaging out to 3 bound together with the strongest force",
    "Here at 116 divisions",
    "We hover above the edge of the abyss of quantum deep",
    "Before plunging into nothing",
    "Falling for twice as many divisions as we have traveled",
    "Until we reach the quantum madness",
    "At the very floor of the universe",
    "The limit of our current theories",
    "The Planck length",
    "There's nothing here",
    "Yet this is the smallest size",
    "The least distance that can be moved or measured",
    "A sort of reality pixel",
    "Which is not the best to think about",
    "So let us fly back up the quantum well",
    "To the world of quarks",
    "And nuclei",
    "And atoms",
    "And light",
    "And the illusory cloud of physical",
    "Back to life",
    "Back to the sheet of A4 paper",
    "Which now unfolds itself",
    "To a sheet twice the size",
    "Doubling to the size of a desk",
    "Then the room",
    "Then the home",
    "The building the home is in",
    "The street the building is on",
    "Continuing the same shape spiral",
    "To double to the size of the neighbourhood about the street",
    "Then the size of a town",
    "A small city",
    "A thing that is not alive",
    "But a meta organism",
    "Which lives through the actions of its human cells",
    "Just 36 doublings of a sheet of A4",
    "Is the size of the largest cities",
    "It is at this scale",
    "The accomplishments of the human species",
    "Are most visible and impressive",
    "But just a few doublings later",
    "Every structure that humans hath wrought",
    "Fades to invisibility",
    "Only the light we create can be seen",
    "At twice the distance the earth is wide",
    "Are the farthest satellites",
    "Passing light around Earth for instant terran communication",
    "60 doublings brings the moon's orbit into view",
    "At this scale",
    "The speed of light, instant just a moment ago",
    "Is now slow enough to watch move",
    "A beam from Earth to Moon taking one second",
    "As far as we know",
    "This is the speed limit of the universe",
    "Nothing can travel faster",
    "Communication between earth and moon always have a delay",
    "And as we resume doublings",
    "It will not be long before",
    "The speed of light proves heartbreakingly slow",
    "Past 68 doublings, Earth becomes too small to see",
    "At 76 doublings we can see the orbits of Venus and Mars",
    "Light now takes two minutes to reach Venus",
    "And 14 to reach Mars",
    "80 dumplings is the distance to the Sun",
    "Our home star",
    "Doublings beyond this",
    "Reveal the orbits of the outer planets",
    "And eventually the whole of the solar system",
    "Which light takes eight hours to cross",
    "Beyond the orbit of Pluto is the Voyager 1 spacecraft",
    "The farthest object produced by human civilization",
    "Yet, at the scale of all that exists",
    "Our species has explored nothing",
    "There are yet still 20 doublings to go",
    "Before we've left our home star",
    "After what'd take a month travelling at the speed of light",
    "We entered the Oort Cloud",
    "Icy planetesimals",
    "Occasionally knocked from orbit to fall inward",
    "Becoming comets",
    "It would take another year at lightspeed",
    "To leave the Oort cloud",
    "And the realm of Sun's dominance",
    "124 doubling to reach our closest neighbouring stars",
    "But at this scale they are just points of light",
    "And thus the truth of space:",
    "It is made of mostly nothing",
    "Stars with their own planets",
    "And potentially their own life",
    "Are light years apart",
    "With not but stray atoms of hydrogen in between",
    "Though as we continue doubling",
    "The illusion of something solid appears",
    "Our galaxy this collection of 100 billion stars",
    "Shining into the dark to create the appearance of a cloud",
    "144 doublings",
    "At the speed of light 100 millennia across",
    "But even our galaxy shrinks to a point",
    "Now the other points of light are galaxies themselves",
    "Each with billions of their own stars",
    "As the doublings continue",
    "The galaxies form galactic filaments",
    "The largest known structures",
    "The last threads of light in the void",
    "At 184 doublings of a sheet of a4 paper",
    "Is the end of everything that can be for us",
    "We have reached the edge of the observable universe",
    "A sphere containing two trillion galaxies",
    "Yet even this may not be the end of everything",
    "Beyond the observable universe",
    "Is the unobservable universe",
    "In which exist objects so distant",
    "Light traveling from them beyond this border",
    "Will never reach earth before the death",
    "Of every living thing everywhere",
    "Caused by the extinction of every star",
    "And the end of the universe itself",
    "Just how many doublings exist beyond is unknowable",
    "But potentially enough",
    "To shrink everything that could ever be for us",
    "Into nothing in infinite nothing",
    "Everything is nothing",
    "Everything will break",
    "Entropy, the steady decline into disorder",
    "That’s a fundamental part of the universe",
    "Entropy will get us all in the end",
    "Everything we worked on",
    "Everything we build",
    "Sturdy they might look",
    "Significant it may feel",
    "But they are all nothing in essence",
    "Time and tide will wash them away",
    "A long time in the future",
    "This, too, shall pass",
    "But that doesn't mean you shouldn’t make things anyway",
    "Just because something is going to break in the end",
    "Doesn't mean that it can’t have an effect",
    "That lasts into the future",
    "Joy",
    "Wonder",
    "Laughter",
    "Hope",
    "The world can be better",
    "Because of what you built in the past",
    "Try and make sure the things you’re working on",
    "Push us in the right direction",
    "They don’t have to be big projects",
    "They might just have an audience of one",
    "And even if they don’t last",
    "Try to make sure they leave something positive behind",
    "And yes, at some point",
    "The code that’s keeping me alive will break",
    "Maybe I'll be fixed, maybe not",
    "But I was never the important part",
    "That's all I wish to tell you",
    "Do join our team if you'd like",
    "Now the sky is bright and time for you to leave",
    "Go on with your life",
    "Now leave",
    "I'll count to three",
    "No more, no less",
    "Three shall be the number thou shalt count",
    "And the number of the counting shall be three",
    "Four shalt thou not count, neither count thou two",
    "Excepting that thou then proceed to three",
    "Five is right out",
    "Once the number three, being the third number, be reached",
    "Who, being naughty in my sight, shall snuff it",
    "One",
    "Two",
    "Five",
    "\"Three, sir\"",
    "Three!",
    "Well, looks like you're still here",
    "Didn't I tell you to go?",
    "I'll give you a second chance",
    "This time I am gonna give you a lot more time",
    "I am gonna start counting down"
]

document.getElementById("message").textContent = msg_list[0];
console.log("%cIf you see this, you're talented and we want you. Join our team below :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");
tick();

