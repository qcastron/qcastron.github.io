/**
 * Fetches data from the js/moon-phase-data/<Year> file and finds the next new/full moon
 * @param {Date} date
 */
async function getMoonPhase(date = new Date) {

    /**
     * NIGHT_OFFSET is the offset in hours when selecting the day of the new moon/full moon event
     * DAY_OFFSET is the offset in hours when selecting the day of the current time
     * @constant {number}
     */
    const NIGHT_OFFSET = 12,
        DAY_OFFSET = 6;

    date.setHours(date.getHours() - DAY_OFFSET, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    /**
     * Finds the next new moon or full moon from data, if it exists
     * @param {Array} data
     * @returns {{className: String, type: String, count: String, wordIn: String}}
     */
    function findNextEvent(data) {
        for (const i of data) {
            if (i.Phase === 0) {
                let newMoon = new Date(i.Date + "Z");
                newMoon.setHours(newMoon.getHours() - NIGHT_OFFSET, 0, 0, 0);
                newMoon.setHours(0, 0, 0, 0);
                let count = (newMoon - date) / 86400000;
                if (count >= 0) {
                    return {
                        className: count > 0 ? `moon-new-${count}` : "moon-new",
                        type: "New Moon",
                        count: count > 1 ? count + " nights" : count > 0 ? "1 night" : "",
                        wordIn: count ? "in" : ""
                    };
                }
            } else if (i.Phase === 2) {
                let fullMoon = new Date(i.Date + "Z");
                fullMoon.setHours(fullMoon.getHours() - NIGHT_OFFSET, 0, 0, 0);
                fullMoon.setHours(0, 0, 0, 0);
                let count = (fullMoon - date) / 86400000;
                if (count >= 0) {
                    return {
                        className: count > 0 ? `moon-full-${count}` : "moon-full",
                        type: "Full Moon",
                        count: count > 1 ? count + " nights" : count > 0 ? "1 night" : "",
                        wordIn: count ? "in" : ""
                    };
                }
            }
        }
    }

    /**
     * Fetches data from the js/moon-phase-data/<Year> file, feeds into findNextEvent(), and checks if the search is successful
     * @param {number} year
     * @returns {Object} Class name, type, number of days and if the word "in" is needed
     */
    function getPromise(year) {
        return fetch("js/moon-phase-data/" + year.toString() + "/")
            .then(data => data.json())
            .then(data => {
                let results = findNextEvent(data);
                return results ? results : getPromise(year + 1);
            })
            .catch(error => {
                return {
                    className: "moon-full",
                    type: "Invalid Data",
                    count: "",
                    wordIn: error.name
                };
            });
    }

    return getPromise(date.getFullYear());
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

console.log("%cIf you see this, you're talented and we want you. Join our team at https://qcac.hk/#recruitment :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");