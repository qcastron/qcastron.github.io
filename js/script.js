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
    document.getElementById("message").textContent = msg_list[clicks / 10];
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
    "Funny when you're child",
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
    "Interesting eh?",
    ""
]

document.getElementById("message").textContent = msg_list[0];
console.log("%cIf you see this, you're talented and we want you. Join our team below :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba"+ +"a"+"a la!");
tick();

