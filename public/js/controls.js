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

// Search Bar Click Outside Handler
document.addEventListener("click", (event) => {
    const searchInput = document.getElementById("searchInput");
    const resultsContainer = document.getElementById("search-results");

    if (!searchInput || !resultsContainer) return;

    if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
        resultsContainer.style.display = "none";
    }
});
