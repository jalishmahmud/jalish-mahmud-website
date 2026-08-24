// Typewriter Effect Logic
const textParts = [
    { text: "Building Scalable Web Apps ", class: "" },
    { text: "With React", class: "text-gradient-green" },
    { text: " & ", class: "" },
    { text: "Next.js", class: "text-gradient-amber" }
];

const target = document.getElementById("typewriter-text");
let partIndex = 0;
let charIndex = 0;
let currentSpan = null;

function typeWriter() {
    if (partIndex < textParts.length) {
        const currentPart = textParts[partIndex];

        if (charIndex === 0) {
            currentSpan = document.createElement("span");
            if (currentPart.class) {
                currentSpan.className = currentPart.class;
            }
            target.appendChild(currentSpan);
        }

        currentSpan.textContent += currentPart.text.charAt(charIndex);
        charIndex++;

        if (charIndex < currentPart.text.length) {
            setTimeout(typeWriter, 50);
        } else {
            charIndex = 0;
            partIndex++;
            setTimeout(typeWriter, 100);
        }
    }
}

// Theme Toggle Logic
const themeToggleBtn = document.getElementById("theme-toggle");
const body = document.body;
const themeIcon = themeToggleBtn.querySelector("i");

themeToggleBtn.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme");

    if (currentTheme === "dark") {
        body.setAttribute("data-theme", "light");
        themeIcon.className = "fa-solid fa-sun";
    } else {
        body.setAttribute("data-theme", "dark");
        themeIcon.className = "fa-regular fa-sun";
    }
});

// Initialize script on page load
window.addEventListener("DOMContentLoaded", typeWriter);
