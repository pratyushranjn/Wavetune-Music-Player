document.addEventListener("DOMContentLoaded", () => {
    //  User Menu Toggle
    const btn = document.querySelector(".user");
    const logoutBtn = document.querySelector(".logout");
    const downArrow = document.querySelector(".down-arrow");

    if (btn && logoutBtn && downArrow) {
        btn.addEventListener("click", () => {
            logoutBtn.classList.toggle("show");
            downArrow.classList.toggle("rotate");
        });
    }

    // Hamburger Menu
    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".sidebar");

    if (hamburger && sidebar) {
        hamburger.addEventListener("click", () => {
            sidebar.classList.toggle("show");
            hamburger.classList.toggle("open");
        });
    }

    // Favorite 
    const favButton = document.querySelector(".sidebar-link i.fa-heart")?.closest("li");
    const favList = document.getElementById("favoriteSongs");

    if (favButton && favList) {
        favButton.addEventListener("click", (e) => {
            e.preventDefault();
            favList.classList.toggle("show");
        });
    }
});

// Search Bar & Logout Click Outside Handler
document.addEventListener("click", (event) => {
    // Search Bar
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("search-results");

    if (searchInput && resultsContainer && !searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
        resultsContainer.style.display = "none";
    }

    // Logout Button
    const btn = document.querySelector(".user");
    const logoutBtn = document.querySelector(".logout");
    const downArrow = document.querySelector(".down-arrow");

    if (logoutBtn && btn && !btn.contains(event.target) && !logoutBtn.contains(event.target)) {
        logoutBtn.classList.remove("show");
        downArrow.classList.remove("rotate");
    }
});