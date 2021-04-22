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
    },
    clicks = 0;

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
        clicks++;
        if (!(clicks % 10)) {
            update_msg();
        }
    }
}, false);

function tick() {
    draw();
    update();
    requestAnimationFrame(tick);
}

function update_msg() {
    let id = clicks / 10;
    if (id < msg_list.length - 1) {
        document.getElementById("message").textContent = msg_list[id];
        if (id === 508) {
            document.getElementById("constellations-con").style.background = "#1F084D radial-gradient(farthest-corner at bottom left, #ED5900, #140533)";
            window.open("https://forms.gle/xisG23qMogkenuWA9");
        }
    } else if (msg_list.length - 1 <= id && id <= msg_list.length + 9999) {
        id -= msg_list.length - 1;
        document.getElementById("message").textContent = 10000 - id;
    } else
        document.getElementById("message").textContent = "Please just leave. You have better things to do in your life";
}

let msg_list = [
    "Click to interact with the background",
    "Fun eh?",
    "We wrote and coded the entire website ourselves",
    "Yeah, including this animated background",
    "You're clicking a bit much",
    "Ya know this uses quite a bit of CPU power right?",
    "You'd better come back later if you're on mobile",
    "This is just one of many Easter eggs",
    "What's the point when there's no fun right?",
    "Looks to me you're having real fun",
    "Considered joining our core team?",
    "We enjoy ourselves together a lot",
    "Ya don't needa have any prior knowledge",
    "Just passion, humour and fun",
    "Well, also being able to come out at night",
    "But that doesn't matter just join us and play",
    "Yeah I'm talking 'bout you, Bjorn",
    "Why are you clicking on a background for so long",
    "You bored?",
    "Do you not have anything better to do",
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
    "Wanna hear another one?",
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
    "Named it \"The Georgium Sidis\"",
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
    "Especially one who's slowly loosing his mind",
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
    "Do what we're suppose to do",
    "Not lose our faith",
    "Be a living human, not merely a brainless robot",
    "It's easy to be lost in the winding paths of misery",
    "Do I really see a way out myself?",
    "Doubt [X]",
    "But I know that my bros are here for me",
    "Anyway, that's a bit too depressing",
    "You know our former teacher-in-charge?",
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
    "Every Youtube video has a unique ID",
    "The one in the URL",
    "String of 11 characters that uniquely identifies the video",
    "The \"dQw4w9WgXcQ\" in \"www.youtube.com/watch?v=dQw4w9WgXcQ\"",
    "Youtube has millions if not billions of videos",
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
    "but they don't work so well in URLs",
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
    "Rr they'd have to assign each server a block of numbers",
    "Either way, there's a lot of tracking to do",
    "A lot of making sure that it's never duplicated",
    "Instead, they just generate a random number for each video",
    "See if it's already taken, and if not, use it",
    "And secondly, it is a really, really bad idea",
    "to just count 1, 2, 3 and so on in URLs",
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
    "'cos they can just run though them",
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
    "so for our purposes, we can pretty much just ignore that",
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
    "It's hard to imagine the scale large numbers eh?",
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
    "Even 100 half divisions down from the A4 we where started",
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
    "The planck length",
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
    "light now takes two minutes to reach Venus",
    "And 14 to reach Mars",
    "80 dumplings is the distance to the Sun",
    "Uur home star",
    "Doublings beyond this",
    "Reveal the orbits of the outer planets",
    "And eventually the whole of the solar system",
    "Which light takes eight hours to cross",
    "Beyond the orbit of pluto is the Voyager 1 spacecraft",
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
    "Qe have reached the edge of the observable universe",
    "A sphere containing two trillion galaxies",
    "Yet even this may not be the end of everything",
    "Beyond the observable universe" +
    "Is the unobservable universe",
    "In which exist objects so distant",
    "light traveling from them beyond this border",
    "will never reach earth before the death",
    "Of every living thing everywhere" +
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
    "But that doesn’t mean you shouldn’t make things anyway",
    "Just because something is going to break in the end",
    "doesn’t mean that it can’t have an effect",
    "That lasts into the future",
    "Joy",
    "Wonder",
    "Laugher",
    "Hope",
    "The world can be better",
    "Cecause of what you built in the past",
    "try and make sure the things you’re working on",
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
console.log("Eat a Ba"+ +"a"+"a la!");
tick();

