/* Shared behavior for navigation, animation, counters, and contact validation. */
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("[data-header]");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const revealItems = document.querySelectorAll(".reveal");
    const statNumbers = document.querySelectorAll(".stat-number");
    const contactForm = document.querySelector("#contactForm");

    const setHeaderState = () => {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 18);
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const expanded = navToggle.getAttribute("aria-expanded") === "true";
            navToggle.setAttribute("aria-expanded", String(!expanded));
            navMenu.classList.toggle("open");
            document.body.classList.toggle("nav-open");
        });

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navToggle.setAttribute("aria-expanded", "false");
                navMenu.classList.remove("open");
                document.body.classList.remove("nav-open");
            });
        });
    }

    // IntersectionObserver keeps scroll effects smooth and inexpensive.
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.16 });

    revealItems.forEach((item) => revealObserver.observe(item));

    const animateCounter = (element) => {
        const target = Number(element.dataset.count || 0);
        const duration = 1100;
        const start = performance.now();

        const update = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(target * eased);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target === 100 ? "100%" : String(target);
            }
        };

        requestAnimationFrame(update);
    };

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach((number) => statObserver.observe(number));

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = contactForm.querySelector("#name");
            const email = contactForm.querySelector("#email");
            const message = contactForm.querySelector("#message");
            const status = contactForm.querySelector("#formStatus");

            const validName = validateField(name, "nameError", "Please enter your name.", (value) => value.trim().length >= 2);
            const validEmail = validateField(email, "emailError", "Please enter a valid email address.", isValidEmail);
            const validMessage = validateField(message, "messageError", "Please write a message of at least 10 characters.", (value) => value.trim().length >= 10);

            if (!validName || !validEmail || !validMessage) {
                status.classList.remove("visible");
                return;
            }

            status.textContent = "Thank you. Your message has been validated successfully.";
            status.classList.add("visible");
            contactForm.reset();
        });
    }
});

function validateField(field, errorId, errorText, validator) {
    const error = document.getElementById(errorId);
    const group = field.closest(".form-group");
    const isValid = validator(field.value);

    group.classList.toggle("invalid", !isValid);
    field.setAttribute("aria-invalid", String(!isValid));
    error.textContent = isValid ? "" : errorText;

    return isValid;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
