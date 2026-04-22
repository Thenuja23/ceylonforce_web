// 🔴 REPLACE THESE
const PHONE = "947XXXXXXXX"; // your WhatsApp number
const SCRIPT_URL = "PASTE_YOUR_GOOGLE_SCRIPT_URL";

// EMAILJS INIT (optional)
(function () {
    emailjs.init("YOUR_PUBLIC_KEY");
})();

// MENU
function toggleMenu() {
    document.getElementById('menu').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function closeMenu() {
    document.getElementById('menu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// SCROLL BAR
window.onscroll = () => {
    let scroll = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    document.getElementById("progress").style.width = scroll + "%";
};

// MAIN FUNCTION (WhatsApp)
function openWhatsAppWithLead() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
        alert("Please fill in all fields before sending.");
        return;
    }

    const text = `Hello Ceylonforce,
Name: ${name}
Email: ${email}
Message: ${message}`;

    // ✅ CORRECT URL (this fixes your error)
    const url = "https://wa.me/94768886044?text=" + encodeURIComponent(text);

    window.open(url, "_blank");
}

// RESET FORM
function resetForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';
}

// GENERATE QR CODE AND GLOBAL BACK BUTTON
window.addEventListener('DOMContentLoaded', () => {

    const isHomePage = window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/website/');

    const nav = document.querySelector('.nav');
    if (nav && !isHomePage) {
        const backBtn = document.createElement('div');
        backBtn.innerHTML = '&#8592;';
        backBtn.className = 'back-btn';
        backBtn.onclick = () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        };
        nav.insertAdjacentElement('afterend', backBtn);
    }


});