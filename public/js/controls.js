document.addEventListener("DOMContentLoaded", () => {
    // User Menu Toggle
    const userBtn = document.querySelector(".user");
    const logoutMenu = document.querySelector(".logout");
    const downArrow = document.querySelector(".down-arrow");

    if (userBtn && logoutMenu && downArrow) {
        userBtn.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevents immediate closing when clicking
            logoutMenu.classList.toggle("show");

            // Toggle arrow rotation smoothly
            if (logoutMenu.classList.contains("show")) {
                downArrow.style.transform = "rotate(180deg)";
            } else {
                downArrow.style.transform = "rotate(0deg)";
            }
        });

        // Add smooth transition effect
        downArrow.style.transition = "transform 0.3s ease";
    }

    // Hamburger Menu Toggle
    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".sidebar");

    if (hamburger && sidebar) {
        hamburger.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevents immediate closing
            sidebar.classList.toggle("show");
            hamburger.classList.toggle("open");
        });
    }

    // Favorite Songs Toggle
    const favButton = document.querySelector(".sidebar-link i.fa-heart")?.closest("li");
    const favList = document.getElementById("favoriteSongs");

    if (favButton && favList) {
        favButton.addEventListener("click", (event) => {
            event.preventDefault();
            favList.classList.toggle("show");
        });
    }

    // Click Outside Handler
    document.addEventListener("click", (event) => {
        const searchInput = document.getElementById("searchInput");
        const resultsContainer = document.getElementById("search-results");

        // Hide Search Results when clicking outside
        if (searchInput && resultsContainer && !searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = "none";
        }

        // Hide Logout Menu when clicking outside
        if (logoutMenu && userBtn && !userBtn.contains(event.target) && !logoutMenu.contains(event.target)) {
            logoutMenu.classList.remove("show");
            downArrow.style.transform = "rotate(0deg)";
        }

        // Hide Sidebar when clicking outside
        if (sidebar && !sidebar.contains(event.target) && !hamburger.contains(event.target)) {
            sidebar.classList.remove("show");
            hamburger.classList.remove("open");
        }
    });
});
