function moon_phase(date) {
    let className,
        type,
        count;

    let jd = date / 86400000 - date.getHours() / 24 - date.getMinutes() / 1440 - date.getSeconds() / 86400 + 2440587.5, // total days elapsed in julian days
        phase = jd % 29.53; // divide by the moon cycle (29.53 days)
    if (phase <= 14.765) {
        count = (14.765 - phase) | 0;
        className = count > 0 ? `moon-full-${count}` : "moon-full";
        type = "Full Moon";
    } else {
        count = (29.53 - phase) | 0;
        className = count > 0 ? `moon-new-${count}` : "moon-new";
        type = "New Moon";
    }

    return {
        className: className,
        type: type,
        count: count
    };
}

let today = moon_phase(new Date());
document.getElementById("moon").classList.add(today.className);
document.getElementById("type").textContent = today.type;
document.getElementById("count").textContent = today.count > 1 ? today.count > 0 ? today.count + " days" : "1 day" : "";

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