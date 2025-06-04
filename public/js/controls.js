document.addEventListener("DOMContentLoaded", () => {
    const userBtn = document.querySelector(".user");
    const logoutMenu = document.querySelector(".logout");
    const downArrow = document.querySelector(".down-arrow");
    const removeUserIcon = document.querySelector('.remove-user-icon');
    const userSettingsPanel = document.getElementById('userSettingsPanel');
    const hamburger = document.querySelector(".hamburger");
    const sidebar = document.querySelector(".sidebar");

    const setArrowRotation = () => {
        const isAnyPanelOpen =
            (logoutMenu && logoutMenu.classList.contains("show")) ||
            (userSettingsPanel && userSettingsPanel.classList.contains("active"));

        if (downArrow) {
            downArrow.style.transform = isAnyPanelOpen ? "rotate(180deg)" : "rotate(0deg)";
        }
    };

    if (downArrow) {
        downArrow.style.transition = "transform 0.3s ease";
    }

    // Handle userBtn click 
    if (userBtn && logoutMenu && userSettingsPanel) {
        userBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            const isPanelOpen = userSettingsPanel.classList.contains("active");
            const isLogoutOpen = logoutMenu.classList.contains("show");

            // Toggle both on userBtn click, regardless of where inside it
            const isArrowClicked = e.target.closest(".down-arrow");

            if (isArrowClicked || e.target.closest(".user-name")) {
                const isPanelOpen = userSettingsPanel.classList.contains("active");
                userSettingsPanel.classList.toggle("active", !isPanelOpen);
                logoutMenu.classList.remove("show");
            } else {
                // Clicked somewhere else in userBtn → toggle as well
                userSettingsPanel.classList.toggle("active");
                logoutMenu.classList.remove("show");
            }

            setArrowRotation();
        });

        // Prevent panel from closing when clicked inside
        userSettingsPanel.addEventListener("click", e => e.stopPropagation());
        logoutMenu.addEventListener("click", e => e.stopPropagation());
    }

    // Hamburger toggle
    if (hamburger && sidebar) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("show");
            hamburger.classList.toggle("open");
        });
    }

    // Favorite Songs Toggle
    const favButton = document.querySelector(".sidebar-link i.fa-heart")?.closest("li");
    const favList = document.getElementById("favoriteSongs");

    if (favButton && favList) {
        favButton.addEventListener("click", (e) => {
            e.preventDefault();
            favList.classList.toggle("show");
        });
    }

    // Global click handler to close open menus
    document.addEventListener("click", (event) => {
        const searchInput = document.getElementById("searchInput");
        const resultsContainer = document.getElementById("search-results");

        if (searchInput && resultsContainer && !searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = "none";
        }

        if (logoutMenu && !userBtn.contains(event.target) && !logoutMenu.contains(event.target)) {
            logoutMenu.classList.remove("show");
        }

        if (userSettingsPanel && !userSettingsPanel.contains(event.target) && !userBtn.contains(event.target)) {
            userSettingsPanel.classList.remove("active");
        }

        if (sidebar && !sidebar.contains(event.target) && !hamburger.contains(event.target)) {
            sidebar.classList.remove("show");
            hamburger.classList.remove("open");
        }

        setArrowRotation();
    });


    removeUserIcon.addEventListener('click', function () {
        // const confirmation = confirm("Are you sure you want to delete your account?");
        // if (confirmation) {
        //     fetch('/delete-user', {
        //         method: 'DELETE',
        //         headers: { 'Content-Type': 'application/json' },
        //     })
        //         .then(res => res.json())
        //         .then(data => {
        //             if (data.success) {
        //                 alert("See you again! ");
        //                 window.location.href = '/signup';
        //             } else {
        //                 throw new Error(data.message);
        //             }
        //         })
        //         .catch(error => {
        //             console.error('Error deleting user:', error);
        //             alert("There is an error deleting your account.");
        //         });
        // }

        Swal.fire({
            icon: 'warning',
            title: 'Account Deletion Coming Soon!',
            text: 'This feature is not available yet.',
            confirmButtonText: 'OK',
            background: '#010A49',
            color: '#ffff',
        });

    });
});

