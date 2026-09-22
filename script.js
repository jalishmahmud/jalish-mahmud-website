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

const blogPosts = [
    {
        category: "frontend",
        label: "Frontend",
        title: "Making React Interfaces Feel Effortless",
        excerpt: "A practical look at responsive layouts, useful loading states, and the small details that make an interface easier to trust.",
        date: "Aug 12, 2026",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Colorful interface design on a laptop screen",
        content: "<p>Great interfaces are rarely about adding more decoration. They are about making the next action obvious and keeping the experience steady while data changes.</p><h3>Start with structure</h3><p>Use a clear layout system before styling individual components. Consistent spacing, readable hierarchy, and deliberate empty space do more for usability than a pile of visual effects.</p><h3>Design for the waiting moments</h3><p>Loading, empty, and error states are part of the product. Give each state a useful message and preserve the shape of the surrounding layout so the page does not jump around.</p>"
    },
    {
        category: "backend",
        label: "Backend",
        title: "API Design Lessons from Growing Products",
        excerpt: "Patterns that keep REST APIs understandable as features, integrations, and the number of clients continue to grow.",
        date: "Jul 28, 2026",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Server racks in a data center",
        content: "<p>An API should make the correct path easy for its consumers. That means predictable naming, consistent response shapes, and errors that explain what needs to change.</p><h3>Consistency compounds</h3><p>Document pagination, validation, authentication, and error formats once, then apply those rules across every endpoint. Small inconsistencies create large costs for frontend teams.</p><h3>Protect the boundary</h3><p>Validate input at the edge, keep business rules inside the service layer, and test the behavior that clients depend on. This keeps integrations stable while the internals evolve.</p>"
    },
    {
        category: "frontend",
        label: "Career & Craft",
        title: "What I Look for During a Code Review",
        excerpt: "A compact checklist for reviews that improve correctness, maintainability, and the quality of collaboration.",
        date: "Jun 16, 2026",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
        imageAlt: "Laptop showing code during a collaborative work session",
        content: "<p>A useful review is a conversation about the code's behavior and future cost, not a search for opportunities to rewrite somebody else's style.</p><h3>Review in this order</h3><p>First check correctness and edge cases. Then look at data flow, failure handling, and test coverage. Style comes last, and automated tools should handle most of it.</p><h3>Make comments actionable</h3><p>Explain the risk and suggest a direction when possible. A specific comment helps the author decide quickly and keeps the review focused on shipping a stronger change.</p>"
    }
];

const blogPostsContainer = document.getElementById("blog-posts");
const articleDialog = document.getElementById("article-dialog");
const articleTitle = document.getElementById("article-title");
const articleMeta = document.getElementById("article-meta");
const articleContent = document.getElementById("article-content");
const articleImage = document.getElementById("article-image");

function renderBlogPosts(category = "all") {
    const visiblePosts = blogPosts.filter(post => category === "all" || post.category === category);

    blogPostsContainer.innerHTML = visiblePosts.map(post => `
        <article class="blog-card">
            <img class="blog-card-image" src="${post.image}" alt="${post.imageAlt}" loading="lazy">
            <div class="blog-card-body">
                <div class="blog-card-category">${post.label}</div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="blog-card-footer">
                    <span>${post.date}</span>
                    <button class="read-post" type="button" data-post-index="${blogPosts.indexOf(post)}">Read article <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>
        </article>
    `).join("");
}

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(filter => filter.classList.remove("active"));
        button.classList.add("active");
        renderBlogPosts(button.dataset.category);
    });
});

blogPostsContainer.addEventListener("click", event => {
    const readButton = event.target.closest(".read-post");
    if (!readButton) return;

    const post = blogPosts[Number(readButton.dataset.postIndex)];
    articleImage.src = post.image;
    articleImage.alt = post.imageAlt;
    articleMeta.textContent = `${post.label} / ${post.date}`;
    articleTitle.textContent = post.title;
    articleContent.innerHTML = post.content;
    articleDialog.showModal();
});

document.getElementById("dialog-close").addEventListener("click", () => articleDialog.close());
articleDialog.addEventListener("click", event => {
    if (event.target === articleDialog) articleDialog.close();
});

// Initialize script on page load
window.addEventListener("DOMContentLoaded", () => {
    typeWriter();
    renderBlogPosts();
});
