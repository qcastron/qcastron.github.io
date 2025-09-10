/**
 * Moon Phase + HKO Weather Icon
 * - Keeps original moon phase setHours calculations
 * - Caches results in localStorage
 * - Auto-updates moon phase at 6 AM daily
 * - Auto-updates weather icon every X minutes
 */

document.addEventListener('DOMContentLoaded', async () => {
    updateTime();
    initWallpaperMode();
    await Promise.all([displayMoonPhase(), displayWeatherAndConditions()]);
    initModal();
    initAnalyticsPings();
    startWeatherUpdates();
    scheduleMoonPhaseUpdate();
});

/* ===== CONFIG ===== */
const WEATHER_REFRESH_MINUTES = 5;
const MOON_CACHE_HOURS = 24;
const NIGHT_OFFSET = 12;
const DAY_OFFSET = 6;

/* ===== MOON PHASE ===== */
async function displayMoonPhase(date = new Date()) {
    date.setHours(date.getHours() - DAY_OFFSET, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    // Check cache
    const moonCache = JSON.parse(localStorage.getItem('moonPhaseData') || 'null');
    if (moonCache && Date.now() - moonCache.timestamp < MOON_CACHE_HOURS * 3600000) {
        const nextEvent = new Date(moonCache.events[0].eventDate) > Date.now() ? moonCache.events[0] : moonCache.events[1];
        return updateMoonDOM(nextEvent);
    }

    const findNextEvents = (data) => {
        const events = [];
        for (const i of data) {
            if (i.Phase === 0 || i.Phase === 2) {
                let eventDate = new Date(i.Date + "Z");
                eventDate.setHours(eventDate.getHours() - NIGHT_OFFSET, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
                let count = (eventDate - date) / 86400000;
                if (count >= 0) {
                    events.push({
                        phaseType: i.Phase === 0 ? "New Moon" : "Full Moon",
                        eventDate: eventDate.toISOString()
                    });
                    if (events.length === 2) break; // stop after 2 events
                }
            }
        }
        return events.length ? events : null;
    };

    const getPromise = async (year, needed = 2, found = []) => {
        try {
            const res = await fetch(`js/moon-phase-data/${year}/index.json`);
            const data = await res.json();
            const events = findNextEvents(data) || [];
            found.push(...events);
            if (found.length >= needed) return found.slice(0, needed);
            return getPromise(year + 1, needed, found);
        } catch (error) {
            return [{ phaseType: "Invalid Data", eventDate: null }];
        }
    };

    const nextEvents = await getPromise(date.getFullYear());

    // Store both events in cache
    localStorage.setItem('moonPhaseData', JSON.stringify({
        timestamp: Date.now(),
        events: nextEvents
    }));

    updateMoonDOM(nextEvents[0]); // display first event
}

function updateMoonDOM(data) {
    const moonEl = document.getElementById("moon");
    const eventDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(today.getHours() - DAY_OFFSET, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const count = Math.round((eventDate - today) / 86400000);
    const isNew = data.phaseType === "New Moon";

    const className = count > 0
        ? `moon-${isNew ? 'new' : 'full'}-${count}`
        : `moon-${isNew ? 'new' : 'full'}`;

    if (moonEl) {
        moonEl.className = "moon"; // reset classes
        moonEl.classList.add(className);
    }
    document.getElementById("type").textContent = data.phaseType;
    document.getElementById("in").textContent = count ? "in" : "";
    document.getElementById("count").textContent =
        count > 1 ? `${count} nights` :
            count > 0 ? "1 night" : "";
}

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    document.getElementById('time').textContent = `${hours}:${minutes}`;
}

/* ===== WEATHER ICON ===== */
async function displayWeatherAndConditions() {
    try {
        const res = await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en");
        const { icon = [], temperature = {}, humidity = {} } = await res.json();

        // --- Weather icon ---
        if (icon.length) updateWeatherDOM(icon[0]);

        // --- Temperature & Humidity ---
        updateTempHumDOM(temperature.data, humidity.data);

    } catch (err) {
        console.error("Weather fetch failed:", err);
    }
}

function updateWeatherDOM(iconNumber) {
    const img = document.getElementById("weather-icon");
    if (img && iconNumber) {
        const newSrc = `https://maps.weather.gov.hk/ocf/image/wxicon/b3outline/small/${iconNumber}.png`;
        if (img.src !== newSrc) img.src = newSrc; // avoid redundant assignment
        updateWeatherClasses(iconNumber); // set clouds class from API icon
    }
}

function updateTempHumDOM(tempData = [], humData = []) {
    const el = document.getElementById("temp-hum");
    if (!el) return;

    // Find Happy Valley or fallback
    const tempEntry =
        tempData.find(loc => loc.place?.toLowerCase() === "happy valley" && isFinite(loc.value)) ||
        tempData.find(loc => isFinite(loc.value));

    const humEntry = humData.find(loc => isFinite(loc.value));

    el.textContent = tempEntry && humEntry
        ? `${tempEntry.value}°C ${humEntry.value}%`
        : "--°C --%";
}

// Map API warning codes to actual icon filenames
const WARNING_ICON_MAP = new Map([
    ['WFIREY', 'firey'],      // Yellow Fire Danger
    ['WFIRER', 'firer'],      // Red Fire Danger
    ['WFROST', 'frost'],      // Frost Warning
    ['WHOT', 'vhot'],         // Very Hot Weather Warning
    ['WCOLD', 'cold'],        // Cold Weather Warning
    ['WMSGNL', 'sms'],        // Strong Monsoon
    ['WRAINA', 'raina'],      // Amber Rainstorm Warning Signal
    ['WRAINR', 'rainr'],      // Red Rainstorm Warning Signal
    ['WRAINB', 'rainb'],      // Black Rainstorm Warning Signal
    ['WFNTSA', 'ntfl'],       // Flooding in Northern New Territories
    ['WL', 'landslip'],       // Landslip Warning
    ['TC1', 'tc1'],
    ['TC3', 'tc3'],
    ['TC8NE', 'tc8ne'],
    ['TC8SE', 'tc8b'],
    ['TC8SW', 'tc8c'],
    ['TC8NW', 'tc8d'],
    ['TC9', 'tc9'],
    ['TC10', 'tc10'],
    ['WTMW', 'tsunami-warn'], // Tsunami Warning
    ['WTS', 'ts']             // Thunderstorm Warning
]);


async function displayWeatherWarnings() {
    try {
        const res = await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en");
        const data = await res.json();

        let warningEl = document.getElementById("weather-warning");

        // Count warnings without creating an array
        let hasWarnings = false;
        let html = "";

        for (const key in data) {
            if (data[key].code === "CANCEL") {
                break;
            }
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                hasWarnings = true;
                const w = data[key];
                const code = w.code || w.warningCode || "";
                const filename = WARNING_ICON_MAP.get(code);
                if (filename) {
                    html += `<img src="https://www.hko.gov.hk/en/wxinfo/dailywx/images/${filename}.gif">`;
                }
            }
        }

        // If no warnings, remove element if it exists
        if (!hasWarnings) {
            if (warningEl) warningEl.remove();
            return;
        }

        // Create element only if needed
        if (!warningEl) {
            warningEl = document.createElement("div");
            warningEl.id = "weather-warning";
            document.getElementById("weather-text").appendChild(warningEl);
        }

        // Only update DOM if content changed
        if (warningEl.innerHTML !== html) {
            warningEl.innerHTML = html;
        }

    } catch (err) {
        console.error("Weather warnings fetch failed:", err);
    }
}

// Cloud density according to HKO code
const ICON_TO_CLOUD_CLASS = new Map([
    // clear
    [50, 'clear'], [70, 'clear'], [71, 'clear'], [72, 'clear'],
    [73, 'clear'], [74, 'clear'], [75, 'clear'], [81, 'clear'],

    // scattered
    [52, 'scattered'], [54, 'scattered'], [76, 'scattered'],

    // broken
    [60, 'broken'], [62, 'broken'],

    // overcast
    [61, 'overcast'], [63, 'overcast'], [64, 'overcast'], [65, 'overcast'],

    // foggy
    [83, 'foggy'], [84, 'foggy'], [85, 'foggy']

    // no entry = no extra class
]);

const CLOUD_CLASS_NAMES = ['clear', 'scattered', 'broken', 'overcast', 'foggy'];
const cloudsEl = document.querySelector('.clouds'); // cache element

// Rain intensity according to HKO code
const ICON_TO_RAIN_CLASS = new Map([
    // light rain
    [53, 'light-rain'], [62, 'light-rain'],

    // medium rain
    [54, 'medium-rain'], [63, 'medium-rain'],

    // heavy rain
    [64, 'heavy-rain'],

    // thunderstorm
    [65, 'thunderstorm'],

    // clear (any other number not listed here will default to 'clear')
]);

const RAIN_CLASS_NAMES = ['light-rain', 'medium-rain', 'heavy-rain', 'thunderstorm', 'clear'];
const rainEl = document.querySelector('.rain'); // cache element

function updateWeatherClasses(iconNumber) {
    const newCloudClass = ICON_TO_CLOUD_CLASS.get(iconNumber) || "";
    const currentCloudClass = CLOUD_CLASS_NAMES.find(c => cloudsEl.classList.contains(c));
    if (currentCloudClass !== newCloudClass) {
        if (currentCloudClass) cloudsEl.classList.remove(currentCloudClass);
        if (newCloudClass) cloudsEl.classList.add(newCloudClass);
    }

    const newRainClass = ICON_TO_RAIN_CLASS.get(iconNumber) || "clear";
    const currentRainClass = RAIN_CLASS_NAMES.find(c => rainEl.classList.contains(c));
    if (currentRainClass !== newRainClass) {
        if (currentRainClass) rainEl.classList.remove(currentRainClass);
        if (newRainClass) rainEl.classList.add(newRainClass);
    }
}

function startWeatherUpdates() {
    displayWeatherAndConditions(); // initial load
    displayWeatherWarnings();
    setInterval(displayWeatherAndConditions, WEATHER_REFRESH_MINUTES * 60000);
    setInterval(displayWeatherWarnings, WEATHER_REFRESH_MINUTES * 60000);
    setInterval(updateTime, 1000);
}

/* ===== AUTO-UPDATE MOON PHASE AT 6 AM ===== */
function scheduleMoonPhaseUpdate() {
    const now = new Date();
    const next6am = new Date();
    next6am.setHours(6, 0, 0, 0);
    if (now >= next6am) next6am.setDate(next6am.getDate() + 1);
    const msUntil6am = next6am - now;
    setTimeout(() => {
        displayMoonPhase();
        scheduleMoonPhaseUpdate();
    }, msUntil6am);
}

/* ===== REMOVE IFRAMES WHEN WALLPAPER MODE ===== */
function initWallpaperMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "wallpaper") {
        // Remove all iframes
        document.querySelectorAll("iframe").forEach(iframe => iframe.remove());
        if (params.get("logo") === "true") {
            // No pointer events for the footer
            document.querySelector("footer").style.pointerEvents = "none";
            // No pointer events for the footer
            document.querySelector("nav").style.opacity = "0";
        } else {
            // Remove all footer
            document.querySelectorAll("footer").forEach(footer => footer.remove());
        }
    }
}

/* ===== MODAL HANDLING ===== */
function initModal() {
    const modals = document.getElementsByClassName("modal");
    const anchor = location.hash ? location.hash.substring(1).split("?")[0] : null;

    Array.from(modals).forEach(modal => {
        modal.addEventListener("shown.bs.modal", () => {
            history.replaceState({}, "", `${location.href.split("#")[0]}#${modal.id}`);
        });
        modal.addEventListener("hidden.bs.modal", () => {
            history.replaceState({}, "", location.href.split("#")[0]);
        });
    });

    if (anchor) {
        const target = document.getElementById(anchor);
        if (target?.classList.contains("modal")) {
            new bootstrap.Modal(target).show();
        }
    }
}

/* ===== ANALYTICS PINGS ===== */
function initAnalyticsPings() {
    for (let i = 2; i <= 10; i++) {
        setTimeout(() => gtag('event', 'ping', { event_category: 'ping', event_label: 15 * i }), 15000 * i);
    }
    for (let i = 3; i <= 120; i++) {
        setTimeout(() => gtag('event', 'ping', { event_category: 'ping', event_label: 60 * i }), 60000 * i);
    }
}


console.log("%cIf you see this, you're talented and we want you. Join our team at https://qcac.hk/#recruitment :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");