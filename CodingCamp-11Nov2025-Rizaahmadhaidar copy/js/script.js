// =============================
// Modern Portfolio JavaScript
// Interactive & Smooth UI
// =============================

// Smooth scroll for navigation links
const smoothLinks = document.querySelectorAll('a[href^="#"]');

smoothLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Greeting Button
const helloBtn = document.getElementById("helloBtn");
if (helloBtn) {
    helloBtn.addEventListener("click", () => {
        alert("Halo! Terima kasih sudah mengunjungi portfolio saya 🙌");
    });
}

// Reveal animations on scroll
const revealElements = document.querySelectorAll('.card');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;

    revealElements.forEach(el => {
        const position = el.getBoundingClientRect().top;

        if (position < windowHeight - 100) {
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', () => {
    revealElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = "translateY(40px)";
        el.style.transition = "0.6s ease";
    });
    revealOnScroll();
});
