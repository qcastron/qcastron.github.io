/**
 * Fetches data from the js/moon-phase-data/<Year> file and finds the next new/full moon
 * @param {Date} date
 */
async function getMoonPhase(date = new Date) {
   
    date.setHours(0,0,0,0);

    return fetch("js/moon-phase-data/" + date.getFullYear())
        .then(data => data.json())
        .then(data => {
            for (const i of data) {
                if (i.Phase === 0 && date < new Date(i.Date + "Z")) {
                    let count = (new Date(i.Date + "Z").setHours(0,0,0,0) - date) / 86400000;
                    return {
                        className: count > 0 ? `moon-new-${count}` : "moon-new",
                        type: "New Moon",
                        count: count > 1 ? count + " days" : count > 0 ? "1 day" : "",
                        wordIn: "in"
                    };
                }
                if (i.Phase === 2 && date < new Date(i.Date + "Z")) {
                    let count = (new Date(i.Date + "Z").setHours(0,0,0,0) - date) / 86400000;
                    return {
                        className: count > 0 ? `moon-full-${count}` : "moon-full",
                        type: "Full Moon",
                        count: count > 1 ? count + " days" : count > 0 ? "1 day" : "",
                        wordIn: "in"
                    };
                }
            }
        })
        .catch(() => {
            return {
                className: "moon-full",
                type: "Network",
                count: "Error",
                wordIn: ""
            };
        });
}

async function display() {
    let today = await getMoonPhase();
    document.getElementById("moon").classList.add(today.className);
    document.getElementById("type").textContent = today.type;
    document.getElementById("in").textContent = today.wordIn;
    document.getElementById("count").textContent = today.count;
}

display();

for (let i = 2; i <= 10; i++) {
    setTimeout(function () {
        gtag('event', 'ping', {'event_category': 'ping', 'event_label': 15 * i});
    }, 15000 * i);
}

for (let i = 3; i <= 120; i++) {
    setTimeout(function () {
        gtag('event', 'ping', {'event_category': 'ping', 'event_label': 60 * i});
    }, 60000 * i);
}

console.log("%cIf you see this, you're talented and we want you. Join our team below :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");