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
        gtag('event', 'ping', {'event_category': 'ping', 'event_label': 15 * i});
    }, 15000 * i);
}

console.log("%cIf you see this, you're talented and we want you. Join our team at https://qcac.hk/#recruitment :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");