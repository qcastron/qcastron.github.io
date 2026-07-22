document.addEventListener("DOMContentLoaded", () => {
    // Initial setup for .fade-in elements
    const windowHeight = window.innerHeight;
    const targets = document.querySelectorAll('section > section > *');

    targets.forEach(obj => {
        const objTop = obj.getBoundingClientRect().top + window.scrollY;
        if (objTop > window.scrollY + windowHeight * 0.75) {
            obj.classList.add('invisible');
        }
    });

    // Scroll detection using Intersection Observer
    const observer = new IntersectionObserver((entries, self) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('invisible');
                self.unobserve(entry.target); // Stop watching once visible
            }
        });
    }, { rootMargin: '0px 0px -10% 0px' });

    // Observe all currently invisible elements
    targets.forEach(el => observer.observe(el));

    getModal();
});

/**
 * Onload function is executed whenever the page is done loading, initializes the application
 * @return {void}
 */
window.onload = function () {
    getModal();
};

function getAnchor() {
    let url = document.URL.split("#");
    return (url.length > 1) ? url[1].split("?")[0] : null;
}

function getModal() {
    let modal = document.getElementsByClassName("modal"),
        anchor = getAnchor();
    for (let i = 0; i < modal.length; i++) {
        modal[i].addEventListener("shown.bs.modal", () => {
            history.replaceState({}, "", `${document.URL.split("#")[0]}#${modal[i].id}`);
        });
        modal[i].addEventListener("hidden.bs.modal", () => {
            history.replaceState({}, "", document.URL.split("#")[0]);
        });
    }
    if (anchor) {
        try {
            let target = document.getElementById(anchor);
            target.classList.contains("modal") ? new bootstrap.Modal(target).show() : null;
        } catch (e) {
        }
    }
}

for (let i = 2; i <= 10; i++) {
    setTimeout(function () {
        gtag('event', 'ping', { 'event_category': 'ping', 'event_label': 15 * i });
    }, 15000 * i);
}

let count = 0;

function sendGA() {
    if (count++ < 10) {
        gtag('event', 'click', { 'event_category': 'planets', 'event_label': count });
    } else if (!(count++ % 5)) {
        gtag('event', 'click', { 'event_category': 'planets', 'event_label': count });
    }
}

console.log("%cIf you see this, you're talented and we want you. Join our team at https://qcac.hk/#recruitment :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");