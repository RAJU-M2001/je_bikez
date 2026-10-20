// ============================================================
// FULL PAGE LOADER & PAGE NAVIGATION SYSTEM
// ============================================================

function createPageLoader() {
    let loader = document.getElementById("pageLoader");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "pageLoader";
        loader.className = "page-loader active";
        loader.innerHTML = `
            <div class="page-loader-content">
                <div class="page-loader-spinner">
                    <div class="loader-ring"></div>
                    <div class="loader-ring-inner"></div>
                    <i class="fas fa-motorcycle loader-icon"></i>
                </div>
                <div class="loader-brand">JE <span>BIKEZ</span></div>
                <div class="loader-bar"><div class="loader-bar-fill"></div></div>
            </div>
        `;
        if (document.body) {
            document.body.prepend(loader);
        }
    }
    return loader;
}

function showPageLoader() {
    const loader = createPageLoader();
    if (loader) {
        loader.classList.add("active");
    }
}

function hidePageLoader() {
    const loader = document.getElementById("pageLoader");
    if (loader) {
        loader.classList.remove("active");
    }
}

// Initialize loader as early as possible
if (document.body) {
    createPageLoader();
} else {
    document.addEventListener("DOMContentLoaded", createPageLoader);
}

// Hide loader after a clear 1-second interval once page has loaded
window.addEventListener("load", function () {
    setTimeout(hidePageLoader, 1000);
});

// Safety fallback to prevent stuck loader
setTimeout(hidePageLoader, 4000);

// Ensure loader is hidden when navigating with browser back/forward buttons
window.addEventListener("pageshow", function () {
    hidePageLoader();
});

// Intercept page navigation to show full-page loader
document.addEventListener("click", function (e) {
    const anchor = e.target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href) return;

    // Ignore anchor links, void links, email, telephone, new window tabs, and downloads
    if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
    ) {
        return;
    }

    try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Same page with same path and query (only hash difference or identical) - skip loader
        if (
            targetUrl.origin === currentUrl.origin &&
            targetUrl.pathname === currentUrl.pathname &&
            targetUrl.search === currentUrl.search
        ) {
            return;
        }

        e.preventDefault();
        showPageLoader();
        setTimeout(function () {
            window.location.href = anchor.href;
        }, 500);
    } catch (err) {
        if (!href.startsWith("#")) {
            e.preventDefault();
            showPageLoader();
            setTimeout(function () {
                window.location.href = anchor.href;
            }, 500);
        }
    }
});


// ============================================================
// MAIN APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================================
    // API CONFIGURATION
    // ========================================================
    const isLocalNetwork = window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        /^192\.168\./.test(window.location.hostname) ||
        /^10\./.test(window.location.hostname) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname) ||
        window.location.hostname.endsWith(".local");

    const API_BASE_URL =
        localStorage.getItem("API_BASE_URL") ||
        (window.location.port === "10000"
            ? window.location.origin
            : isLocalNetwork
                ? `http://${window.location.hostname}:10000`
                : "https://bike-modification-api.onrender.com");



    // ========================================================
    // THEME SETTINGS FROM ENV
    // ========================================================

    async function fetchThemeConfig() {

        // 1. Apply cached theme immediately to prevent flicker
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            document.documentElement.classList.add("light-mode");
            document.body.classList.add("light-mode");
        } else {
            document.documentElement.classList.remove("light-mode");
            document.body.classList.remove("light-mode");
        }

        // 2. Cache-first: use stored config response if already available
        const cachedConfig = localStorage.getItem("app_config");
        if (cachedConfig) {
            try {
                window.appConfig = JSON.parse(cachedConfig);
            } catch (e) {
                window.appConfig = null;
            }
            return;
        }

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/config`
                );

            if (!response.ok) {
                return;
            }

            const data =
                await response.json();

            // 3. Store full config in localStorage and make available across the page
            localStorage.setItem("app_config", JSON.stringify(data));
            localStorage.setItem("app_config_ts", String(Date.now()));
            localStorage.setItem("theme", data.theme || "light");
            window.appConfig = data;

            if (data.theme === "light") {

                document.documentElement.classList.add(
                    "light-mode"
                );

                document.body.classList.add(
                    "light-mode"
                );

            } else {

                document.documentElement.classList.remove(
                    "light-mode"
                );

                document.body.classList.remove(
                    "light-mode"
                );
            }

        } catch (error) {

            console.error(
                "Error fetching theme config:",
                error
            );
        }
    }

    fetchThemeConfig();


    // ========================================================
    // MOBILE MENU
    // ========================================================

    window.toggleMobileMenu = function () {

        const menu =
            document.getElementById("navMenu");

        const overlay =
            document.getElementById("menuOverlay");

        if (!menu || !overlay) {
            return;
        }

        menu.classList.toggle("open");
        overlay.classList.toggle("open");

        if (menu.classList.contains("open")) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";
        }
    };


    // ========================================================
    // SCROLL TO WORKS
    // ========================================================

    window.scrollToWorks = function () {

        const works =
            document.getElementById("works");

        if (works) {

            works.scrollIntoView({
                behavior: "smooth"
            });
        }
    };


    // ========================================================
    // SCROLL TO SALES
    // ========================================================

    window.scrollToSales = function () {

        const sales =
            document.getElementById("sales");

        if (sales) {

            sales.scrollIntoView({
                behavior: "smooth"
            });
        }
    };


    // ========================================================
    // FILTER SALES BIKES
    // ========================================================

    window.filterSales = function (category) {

        const buttons =
            document.querySelectorAll(
                ".filter-btn"
            );

        const cards =
            document.querySelectorAll(
                ".sale-card"
            );


        buttons.forEach(btn => {

            btn.classList.remove("active");

            const onclickValue =
                btn.getAttribute("onclick") || "";

            if (
                onclickValue.includes(
                    `'${category}'`
                ) ||
                onclickValue.includes(
                    `"${category}"`
                )
            ) {

                btn.classList.add("active");
            }

        });


        cards.forEach(card => {

            const cardCategory =
                card.getAttribute(
                    "data-category"
                );

            if (
                category === "all" ||
                cardCategory === category
            ) {

                card.style.display =
                    "block";

            } else {

                card.style.display =
                    "none";
            }

        });
    };


    // ========================================================
    // GENERAL DIALOG MANAGEMENT
    // ========================================================

    const dialogs = [

        "aboutDialog",
        "bookingDialog",
        "successDialog",
        "errorDialog"

    ];


    function setScrollLock(lock) {

        if (lock) {

            document.documentElement.classList.add(
                "no-scroll"
            );

            document.body.classList.add(
                "no-scroll"
            );

        } else {

            document.documentElement.classList.remove(
                "no-scroll"
            );

            document.body.classList.remove(
                "no-scroll"
            );
        }
    }


    function closeAllDialogs() {

        dialogs.forEach(id => {

            const dialog =
                document.getElementById(id);

            if (dialog) {

                dialog.style.display =
                    "none";

                dialog.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

        });


        const phoneWarning =
            document.getElementById(
                "phoneWarning"
            );

        if (phoneWarning) {

            phoneWarning.style.display =
                "none";
        }

        setScrollLock(false);
    }


    // ========================================================
    // SET MINIMUM DATE
    // ========================================================

    const dateInput =
        document.getElementById("date");

    if (dateInput) {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        dateInput.setAttribute(
            "min",
            today
        );
    }


    // ========================================================
    // OPEN BOOKING POPUP
    // ========================================================

    window.openBooking = function () {

        closeAllDialogs();

        const dialog =
            document.getElementById(
                "bookingDialog"
            );

        if (dialog) {

            dialog.style.display =
                "flex";

            dialog.setAttribute(
                "aria-hidden",
                "false"
            );

            setScrollLock(true);
        }
    };


    // ========================================================
    // CLOSE BOOKING POPUP
    // ========================================================

    window.closeBooking = function () {

        const dialog =
            document.getElementById(
                "bookingDialog"
            );

        const form =
            document.getElementById(
                "bookingForm"
            );

        const warning =
            document.getElementById(
                "phoneWarning"
            );


        if (dialog) {

            dialog.style.display =
                "none";

            dialog.setAttribute(
                "aria-hidden",
                "true"
            );
        }


        if (form) {

            form.reset();
        }


        if (warning) {

            warning.style.display =
                "none";
        }


        setScrollLock(false);
    };


    // ========================================================
    // OPEN ABOUT POPUP
    // ========================================================

    window.openAbout = function () {

        closeAllDialogs();

        const dialog =
            document.getElementById(
                "aboutDialog"
            );

        if (dialog) {

            dialog.style.display =
                "flex";

            dialog.setAttribute(
                "aria-hidden",
                "false"
            );

            setScrollLock(true);
        }
    };


    // ========================================================
    // CLOSE ABOUT POPUP
    // ========================================================

    window.closeAbout = function () {

        const dialog =
            document.getElementById(
                "aboutDialog"
            );

        if (dialog) {

            dialog.style.display =
                "none";

            dialog.setAttribute(
                "aria-hidden",
                "true"
            );
        }

        setScrollLock(false);
    };


    // ========================================================
    // BOOK SLOT API
    // ========================================================

    const bookingForm =
        document.getElementById(
            "bookingForm"
        );


    if (bookingForm) {

        bookingForm.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                const submitBtn =
                    document.getElementById(
                        "submitBtn"
                    );

                const phone =
                    document.getElementById(
                        "phone"
                    );

                const phoneWarning =
                    document.getElementById(
                        "phoneWarning"
                    );


                if (submitBtn) {

                    submitBtn.disabled =
                        true;

                    submitBtn.innerHTML =
                        'Booking... <span class="spinner"></span>';
                }


                const phoneValue =
                    phone
                        ? phone.value.trim()
                        : "";


                if (phoneValue.length < 10) {

                    if (phoneWarning) {

                        phoneWarning.style.display =
                            "block";
                    }

                    if (submitBtn) {

                        submitBtn.disabled =
                            false;

                        submitBtn.innerHTML =
                            "Book Now";
                    }

                    return;
                }


                if (phoneWarning) {

                    phoneWarning.style.display =
                        "none";
                }


                const name =
                    document
                        .getElementById(
                            "name"
                        )
                        ?.value
                        .trim() || "";


                const bike =
                    document
                        .getElementById(
                            "bike"
                        )
                        ?.value
                        .trim() || "";


                const date =
                    document
                        .getElementById(
                            "date"
                        )
                        ?.value || "";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/book-slot`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    name: name,
                                    phone: phoneValue,
                                    bike: bike,
                                    date: date
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        closeAllDialogs();


                        const successMsg =
                            document.getElementById(
                                "successMsg"
                            );

                        const successDialog =
                            document.getElementById(
                                "successDialog"
                            );


                        if (successMsg) {

                            successMsg.innerText =
                                data.message ||
                                "Your slot has been booked successfully.";
                        }


                        if (successDialog) {

                            successDialog.style.display =
                                "flex";

                            successDialog.setAttribute(
                                "aria-hidden",
                                "false"
                            );

                            setScrollLock(true);
                        }


                        setTimeout(() => {

                            closeAllDialogs();

                        }, 8000);


                        bookingForm.reset();


                    } else {

                        closeAllDialogs();


                        const errorMsg =
                            document.getElementById(
                                "errorMsg"
                            );

                        const errorDialog =
                            document.getElementById(
                                "errorDialog"
                            );


                        if (errorMsg) {

                            errorMsg.innerText =
                                "Error: " +
                                (
                                    data.error ||
                                    "Failed to book slot."
                                );
                        }


                        if (errorDialog) {

                            errorDialog.style.display =
                                "flex";

                            errorDialog.setAttribute(
                                "aria-hidden",
                                "false"
                            );

                            setScrollLock(true);
                        }


                        setTimeout(() => {

                            closeAllDialogs();

                        }, 8000);
                    }


                } catch (error) {

                    console.error(
                        "Booking API Error:",
                        error
                    );


                    closeAllDialogs();


                    const errorMsg =
                        document.getElementById(
                            "errorMsg"
                        );

                    const errorDialog =
                        document.getElementById(
                            "errorDialog"
                        );


                    if (errorMsg) {

                        errorMsg.innerText =
                            "Server error. Please try again later.";
                    }


                    if (errorDialog) {

                        errorDialog.style.display =
                            "flex";

                        errorDialog.setAttribute(
                            "aria-hidden",
                            "false"
                        );

                        setScrollLock(true);
                    }


                    setTimeout(() => {

                        closeAllDialogs();

                    }, 8000);

                } finally {

                    if (submitBtn) {

                        submitBtn.disabled =
                            false;

                        submitBtn.innerHTML =
                            "Book Now";
                    }
                }

            }
        );
    }


    // ========================================================
    // AUTHENTICATION STATE
    // ========================================================

    let isLoggedIn =
        localStorage.getItem(
            "isLoggedIn"
        ) === "true";


    let currentUserId =
        localStorage.getItem(
            "currentUserId"
        );


    let currentUserProfilePic =
        localStorage.getItem(
            "currentUserProfilePic"
        );


    let currentUserName =
        localStorage.getItem(
            "currentUserName"
        );


    let currentUserEmail =
        localStorage.getItem(
            "currentUserEmail"
        );


    // ========================================================
    // FETCH & STORE USER PROFILE HELPER
    // ========================================================

    function fetchAndStoreUserProfile(userId, forceRefresh) {
        if (!userId) return;
        // Cache-first: skip API call if data already in localStorage
        if (!forceRefresh && localStorage.getItem("user_object")) {
            const cached = JSON.parse(localStorage.getItem("user_object"));
            if (cached && cached.profile_picture) {
                currentUserProfilePic = cached.profile_picture;
            }
            updateNavbarAuthUI();
            return;
        }
        fetch(`${API_BASE_URL}/api/user/${userId}`)
            .then(r => r.json())
            .then(profileData => {
                const user = profileData.user;
                if (!user) return;
                localStorage.setItem("user_object", JSON.stringify(user));
                localStorage.setItem("currentUserPhone", user.phone || "");
                if (user.profile_picture) {
                    currentUserProfilePic = user.profile_picture;
                    localStorage.setItem("currentUserProfilePic", currentUserProfilePic);
                }
                updateNavbarAuthUI();
            })
            .catch(() => { });
    }
    // NAVBAR ELEMENTS
    // ========================================================

    const loginSignupBtn =
        document.getElementById(
            "loginSignupBtn"
        );


    const profileContainer =
        document.getElementById(
            "profileContainer"
        );


    const profileAvatarBtn =
        document.getElementById(
            "profileAvatarBtn"
        );


    const navProfileAvatar =
        document.getElementById(
            "navProfileAvatar"
        );


    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    const editProfileBtn =
        document.getElementById(
            "editProfileBtn"
        );


    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    const profileMenuContainer =
        document.getElementById(
            "profileMenuContainer"
        );

    const dropdownProfileAvatar =
        document.getElementById(
            "dropdownProfileAvatar"
        );

    const dropdownProfileName =
        document.getElementById(
            "dropdownProfileName"
        );

    const dropdownProfileEmail =
        document.getElementById(
            "dropdownProfileEmail"
        );


    // ========================================================
    // AUTH / MODAL ELEMENTS
    // ========================================================

    const bookServiceBtnHero =
        document.getElementById(
            "bookServiceBtnHero"
        );


    const loginDialog =
        document.getElementById(
            "loginDialog"
        );


    const signupDialog =
        document.getElementById(
            "signupDialog"
        );


    const addBikeDialog =
        document.getElementById(
            "addBikeDialog"
        );


    const statusDialog =
        document.getElementById(
            "statusDialog"
        );


    const trackingDialog =
        document.getElementById(
            "trackingDialog"
        );


    const goToSignup =
        document.getElementById(
            "goToSignup"
        );


    const goToLogin =
        document.getElementById(
            "goToLogin"
        );


    const loginBtnAction =
        document.getElementById(
            "loginBtnAction"
        );


    const signupBtnAction =
        document.getElementById(
            "signupBtnAction"
        );


    const confirmBookingBtn =
        document.getElementById(
            "confirmBookingBtn"
        );


    const cancelAddBike =
        document.getElementById(
            "cancelAddBike"
        );


    const closeStatusDialogBtn =
        document.getElementById(
            "closeStatusDialogBtn"
        );


    const closeLoginDialog =
        document.getElementById(
            "closeLoginDialog"
        );


    const closeSignupDialog =
        document.getElementById(
            "closeSignupDialog"
        );


    // ========================================================
    // PROFILE MODAL ELEMENTS
    // ========================================================

    const profileDialog =
        document.getElementById(
            "profileDialog"
        );


    const deleteConfirmDialog =
        document.getElementById(
            "deleteConfirmDialog"
        );


    const closeProfileDialog =
        document.getElementById(
            "closeProfileDialog"
        );


    const closeTrackingDialog =
        document.getElementById(
            "closeTrackingDialog"
        );


    const closeAddBikeDialog =
        document.getElementById(
            "closeAddBikeDialog"
        );


    const profileImageInput =
        document.getElementById(
            "profileImageInput"
        );


    const profileImagePreview =
        document.getElementById(
            "profileImagePreview"
        );


    const saveProfileBtn =
        document.getElementById(
            "saveProfileBtn"
        );


    const deleteAccountBtn =
        document.getElementById(
            "deleteAccountBtn"
        );


    const cancelDeleteBtn =
        document.getElementById(
            "cancelDeleteBtn"
        );


    const confirmDeleteBtn =
        document.getElementById(
            "confirmDeleteBtn"
        );


    // ========================================================
    // LOGOUT CONFIRMATION ELEMENTS
    // ========================================================

    const logoutConfirmDialog =
        document.getElementById(
            "logoutConfirmDialog"
        );


    const cancelLogoutTop =
        document.getElementById(
            "cancelLogoutTop"
        );


    const cancelLogoutBtn =
        document.getElementById(
            "cancelLogoutBtn"
        );


    const confirmLogoutBtn =
        document.getElementById(
            "confirmLogoutBtn"
        );


    const logoutUserEmailEl =
        document.getElementById(
            "logoutUserEmail"
        );


    // ========================================================
    // HIDE ALL MODALS
    // ========================================================

    function hideAllModals() {

        const modalElements = [

            loginDialog,
            signupDialog,
            addBikeDialog,
            statusDialog,
            trackingDialog,
            profileDialog,
            deleteConfirmDialog,
            logoutConfirmDialog,
            document.getElementById("serviceReviewDialog")

        ];


        modalElements.forEach(dialog => {

            if (dialog) {

                dialog.classList.remove(
                    "show"
                );

                dialog.style.display =
                    "none";

                dialog.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

        });


        document
            .querySelectorAll(".dialog")
            .forEach(dialog => {

                dialog.classList.remove(
                    "show"
                );

                dialog.style.display =
                    "none";

                dialog.setAttribute(
                    "aria-hidden",
                    "true"
                );

            });


        closeProfileDropdown();

        setScrollLock(false);
    }


    // ========================================================
    // SHOW MODAL
    // ========================================================

    function showModal(dialog) {

        hideAllModals();

        if (!dialog) {
            return;
        }


        dialog.classList.add(
            "show"
        );


        dialog.style.display =
            "flex";


        dialog.setAttribute(
            "aria-hidden",
            "false"
        );


        setScrollLock(true);
    }

    // Expose modal handlers globally
    window.showModal = showModal;
    window.hideAllModals = hideAllModals;


    // ========================================================
    // PROFILE AVATAR
    // ========================================================

    function setAvatar(
        element,
        imageUrl = null
    ) {

        if (!element) {
            return;
        }


        // Remove old content
        element.innerHTML = "";


        if (
            imageUrl &&
            typeof imageUrl === "string" &&
            imageUrl.trim() !== ""
        ) {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                imageUrl.trim();


            img.alt =
                "Profile";


            img.style.width =
                "100%";


            img.style.height =
                "100%";


            img.style.borderRadius =
                "50%";


            img.style.objectFit =
                "cover";


            img.style.display =
                "block";


            img.onerror = function () {

                element.innerHTML =
                    '<i class="fas fa-user"></i>';

            };


            element.appendChild(img);


        } else {

            element.innerHTML =
                '<i class="fas fa-user"></i>';
        }
    }


    // ========================================================
    // UPDATE NAVBAR PROFILE AVATAR
    // ========================================================

    function updateNavbarProfile() {
        const pic = isLoggedIn ? currentUserProfilePic : null;

        if (navProfileAvatar) {
            setAvatar(navProfileAvatar, pic);
        }

        if (dropdownProfileAvatar) {
            setAvatar(dropdownProfileAvatar, pic);
        }

        if (dropdownProfileName) {
            dropdownProfileName.textContent = (isLoggedIn && currentUserName) ? currentUserName : "Account";
        }

        if (dropdownProfileEmail) {
            dropdownProfileEmail.textContent = (isLoggedIn && currentUserEmail) ? currentUserEmail : "Manage your profile";
        }
    }


    // ========================================================
    // UPDATE NAVBAR AUTHENTICATION UI
    //
    // LOGGED OUT:
    //     Login / Signup → SHOW
    //     Profile        → HIDE
    //
    // LOGGED IN:
    //     Login / Signup → HIDE
    //     Profile        → SHOW
    // ========================================================

    function updateNavbarAuthUI() {

        if (
            !loginSignupBtn ||
            !profileContainer
        ) {
            return;
        }


        // ====================================================
        // LOGGED IN
        // ====================================================

        if (isLoggedIn) {
            document.documentElement.classList.add("auth-logged-in");
            document.documentElement.classList.remove("auth-logged-out");

            loginSignupBtn.style.display =
                "none";

            profileContainer.style.display =
                "flex";

            closeProfileDropdown();

            updateNavbarProfile();

            return;
        }


        // ====================================================
        // LOGGED OUT
        // ====================================================

        document.documentElement.classList.add("auth-logged-out");
        document.documentElement.classList.remove("auth-logged-in");

        loginSignupBtn.style.display =
            "inline-flex";

        profileContainer.style.display =
            "none";

        closeProfileDropdown();

        updateNavbarProfile();
    }


    // ========================================================
    // UPDATE PROFILE MODAL AVATAR
    // ========================================================

    function updateProfileDialogAvatar() {

        if (!profileImagePreview) {
            return;
        }


        /*
         * Supports:
         *
         * <img id="profileImagePreview">
         *
         * and
         *
         * <div id="profileImagePreview">
         */


        if (
            profileImagePreview.tagName ===
            "IMG"
        ) {

            profileImagePreview.src =
                currentUserProfilePic ||
                "https://res.cloudinary.com/dzyrruoda/image/upload/v1773771899/fav-icon_korsio.png";


            profileImagePreview.alt =
                "Profile";


        } else {

            setAvatar(
                profileImagePreview,
                currentUserProfilePic
            );
        }
    }


    // ========================================================
    // CLOSE PROFILE DROPDOWN
    // ========================================================

    function closeProfileDropdown() {

        if (profileDropdown) {

            profileDropdown.style.display =
                "none";
        }


        if (profileAvatarBtn) {

            profileAvatarBtn.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    // ========================================================
    // OPEN PROFILE DROPDOWN
    // ========================================================

    function openProfileDropdown() {

        // Profile dropdown should only
        // exist for logged-in users.

        if (
            !profileDropdown ||
            !isLoggedIn
        ) {
            return;
        }


        profileDropdown.style.display =
            "block";


        if (profileAvatarBtn) {

            profileAvatarBtn.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }


    // ========================================================
    // INITIAL NAVBAR STATE
    // ========================================================

    updateNavbarAuthUI();


    // ========================================================
    // LOGIN / SIGNUP BUTTON
    //
    // ONLY USED WHEN USER IS LOGGED OUT
    // ========================================================

    if (loginSignupBtn) {

        loginSignupBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                // Safety check
                if (isLoggedIn) {
                    return;
                }


                closeProfileDropdown();

                showModal(loginDialog);

            }
        );
    }


    // ========================================================
    // PROFILE AVATAR BUTTON
    //
    // ONLY USED WHEN USER IS LOGGED IN
    // ========================================================

    if (profileAvatarBtn) {

        profileAvatarBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                // Safety check
                if (!isLoggedIn) {
                    return;
                }


                if (!profileDropdown) {
                    return;
                }


                const isVisible =
                    profileDropdown.style.display ===
                    "block";


                if (isVisible) {

                    closeProfileDropdown();

                } else {

                    openProfileDropdown();
                }

            }
        );
    }


    // ========================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // ========================================================

    document.addEventListener(
        "click",
        function (e) {

            if (
                profileMenuContainer &&
                !profileMenuContainer.contains(
                    e.target
                )
            ) {

                closeProfileDropdown();
            }
        }
    );


    // ========================================================
    // EDIT PROFILE
    // ========================================================

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                closeProfileDropdown();


                // Safety check
                if (!isLoggedIn) {

                    showModal(loginDialog);

                    return;
                }


                const profileNameInput =
                    document.getElementById(
                        "profileName"
                    );


                const profileEmailInput =
                    document.getElementById(
                        "profileEmail"
                    );


                if (profileNameInput) {

                    profileNameInput.value =
                        currentUserName || "";
                }


                if (profileEmailInput) {

                    profileEmailInput.value =
                        currentUserEmail || "";
                }


                if (profileImageInput) {

                    profileImageInput.value =
                        "";
                }


                updateProfileDialogAvatar();


                showModal(profileDialog);

            }
        );
    }


    // ========================================================
    // OPEN LOGOUT CONFIRMATION
    // ========================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                // Close profile dropdown
                closeProfileDropdown();


                // Make sure user is logged in
                if (!isLoggedIn) {
                    return;
                }


                // Populate user email in dialog
                if (logoutUserEmailEl) {
                    logoutUserEmailEl.textContent = currentUserEmail || "";
                }


                // Open custom logout dialog
                showModal(
                    logoutConfirmDialog
                );

            }
        );
    }


    // ========================================================
    // CANCEL LOGOUT - TOP CLOSE BUTTON
    // ========================================================

    if (cancelLogoutTop) {

        cancelLogoutTop.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                hideAllModals();

            }
        );
    }


    // ========================================================
    // CANCEL LOGOUT - STAY LOGGED IN
    // ========================================================

    if (cancelLogoutBtn) {

        cancelLogoutBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                hideAllModals();

            }
        );
    }


    // ========================================================
    // CONFIRM LOGOUT
    // ========================================================

    if (confirmLogoutBtn) {

        confirmLogoutBtn.addEventListener(
            "click",
            function (e) {

                e.preventDefault();


                // Prevent double click
                if (
                    confirmLogoutBtn.disabled
                ) {
                    return;
                }


                confirmLogoutBtn.disabled =
                    true;


                confirmLogoutBtn.innerHTML =
                    '<i class="fas fa-spinner fa-spin"></i> Logging out...';


                // --------------------------------------------
                // CLOSE PROFILE DROPDOWN
                // --------------------------------------------

                closeProfileDropdown();


                // --------------------------------------------
                // RESET AUTH STATE
                // --------------------------------------------

                isLoggedIn = false;

                currentUserId = null;

                currentUserName = null;

                currentUserEmail = null;

                currentUserProfilePic = null;


                // --------------------------------------------
                // REMOVE AUTH DATA
                // --------------------------------------------

                localStorage.removeItem(
                    "isLoggedIn"
                );

                localStorage.removeItem(
                    "currentUserId"
                );

                localStorage.removeItem(
                    "currentUserName"
                );

                localStorage.removeItem(
                    "currentUserEmail"
                );

                localStorage.removeItem(
                    "currentUserProfilePic"
                );

                localStorage.removeItem(
                    "currentUserPhone"
                );

                localStorage.removeItem(
                    "user_object"
                );


                // --------------------------------------------
                // IMPORTANT
                // UPDATE COMPLETE NAVBAR STATE
                // --------------------------------------------

                updateNavbarAuthUI();


                // --------------------------------------------
                // CLOSE ALL MODALS
                // --------------------------------------------

                hideAllModals();


                // --------------------------------------------
                // RESTORE BUTTON
                // --------------------------------------------

                confirmLogoutBtn.disabled =
                    false;


                confirmLogoutBtn.innerHTML =
                    '<span>Yes, Log Out</span><i class="fas fa-sign-out-alt"></i>';


                // --------------------------------------------
                // FULL PAGE REFRESH
                // --------------------------------------------

                setTimeout(() => {

                    window.location.reload();

                }, 300);

            }
        );
    }


    // ========================================================
    // CLOSE BUTTONS
    // ========================================================

    if (closeLoginDialog) {

        closeLoginDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeSignupDialog) {

        closeSignupDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeProfileDialog) {

        closeProfileDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeTrackingDialog) {

        closeTrackingDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeAddBikeDialog) {

        closeAddBikeDialog.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    if (closeStatusDialogBtn) {

        closeStatusDialogBtn.addEventListener(
            "click",
            () => hideAllModals()
        );
    }


    // ========================================================
    // LOGIN -> SIGNUP
    // ========================================================

    if (goToSignup) {

        goToSignup.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                showModal(signupDialog);

            }
        );
    }


    // ========================================================
    // SIGNUP -> LOGIN
    // ========================================================

    if (goToLogin) {

        goToLogin.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                showModal(loginDialog);

            }
        );
    }


    // ========================================================
    // CLOSE MODALS ON BACKDROP CLICK
    // ========================================================

    document
        .querySelectorAll(".dialog")
        .forEach(dialog => {

            dialog.addEventListener(
                "click",
                function (e) {

                    if (
                        e.target === dialog
                    ) {

                        hideAllModals();
                    }
                }
            );

        });


    // ========================================================
    // ESCAPE KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        function (e) {

            if (e.key === "Escape") {

                closeProfileDropdown();

                hideAllModals();
            }
        }
    );


    // ========================================================
    // PASSWORD VISIBILITY - LOGIN
    // ========================================================

    const loginEye =
        document.getElementById(
            "loginEye"
        );


    if (loginEye) {

        loginEye.addEventListener(
            "click",
            function () {

                const pwdInput =
                    document.getElementById(
                        "loginPwd"
                    );


                if (!pwdInput) {
                    return;
                }


                if (
                    pwdInput.type ===
                    "password"
                ) {

                    pwdInput.type =
                        "text";


                    loginEye.classList.replace(
                        "fa-eye",
                        "fa-eye-slash"
                    );

                } else {

                    pwdInput.type =
                        "password";


                    loginEye.classList.replace(
                        "fa-eye-slash",
                        "fa-eye"
                    );
                }
            }
        );
    }


    // ========================================================
    // PASSWORD VISIBILITY - SIGNUP
    // ========================================================

    const signupEye =
        document.getElementById(
            "signupEye"
        );


    if (signupEye) {

        signupEye.addEventListener(
            "click",
            function () {

                const pwdInput =
                    document.getElementById(
                        "signupPwd"
                    );


                if (!pwdInput) {
                    return;
                }


                if (
                    pwdInput.type ===
                    "password"
                ) {

                    pwdInput.type =
                        "text";


                    signupEye.classList.replace(
                        "fa-eye",
                        "fa-eye-slash"
                    );

                } else {

                    pwdInput.type =
                        "password";


                    signupEye.classList.replace(
                        "fa-eye-slash",
                        "fa-eye"
                    );
                }
            }
        );
    }


    // ========================================================
    // DIALOG ALERT HELPER
    // ========================================================

    function showDialogAlert(
        elementId,
        message,
        type
    ) {

        const alertEl =
            document.getElementById(
                elementId
            );


        if (!alertEl) {
            return;
        }


        alertEl.style.display =
            "block";


        alertEl.innerText =
            message;


        if (type === "success") {

            alertEl.style.backgroundColor =
                "rgba(0, 255, 0, 0.1)";

            alertEl.style.color =
                "#0f0";

            alertEl.style.border =
                "1px solid #0f0";

        } else {

            alertEl.style.backgroundColor =
                "rgba(255, 0, 0, 0.1)";

            alertEl.style.color =
                "#f00";

            alertEl.style.border =
                "1px solid #f00";
        }


        setTimeout(() => {

            alertEl.style.display =
                "none";

        }, 5000);
    }


    // ========================================================
    // LOGIN
    // ========================================================

    if (loginBtnAction) {

        loginBtnAction.addEventListener(
            "click",
            async function () {

                const email =
                    document
                        .getElementById(
                            "loginEmail"
                        )
                        ?.value
                        .trim() || "";


                const password =
                    document
                        .getElementById(
                            "loginPwd"
                        )
                        ?.value || "";


                if (!email || !password) {

                    showDialogAlert(
                        "loginAlert",
                        "Please enter email and password.",
                        "error"
                    );

                    return;
                }


                loginBtnAction.disabled =
                    true;


                loginBtnAction.innerText =
                    "Logging in...";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/auth/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email: email,
                                    password: password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // UPDATE AUTH STATE
                        // ------------------------------------

                        isLoggedIn = true;


                        currentUserId =
                            data.user?.id ||
                            null;


                        currentUserName =
                            data.user?.name ||
                            "";


                        currentUserEmail =
                            data.user?.email ||
                            "";


                        currentUserProfilePic =
                            data.user?.profile_picture ||
                            "";


                        // ------------------------------------
                        // SAVE AUTH STATE
                        // ------------------------------------

                        localStorage.setItem(
                            "isLoggedIn",
                            "true"
                        );


                        localStorage.setItem(
                            "currentUserId",
                            currentUserId || ""
                        );


                        localStorage.setItem(
                            "currentUserName",
                            currentUserName
                        );


                        localStorage.setItem(
                            "currentUserEmail",
                            currentUserEmail
                        );


                        localStorage.setItem(
                            "currentUserProfilePic",
                            currentUserProfilePic
                        );


                        // Fetch full profile to store user_object + phone
                        fetchAndStoreUserProfile(currentUserId);


                        // ------------------------------------
                        // UPDATE COMPLETE NAVBAR
                        // ------------------------------------

                        updateNavbarAuthUI();


                        showDialogAlert(
                            "loginAlert",
                            data.message ||
                            "Logged in successfully!",
                            "success"
                        );


                        // ------------------------------------
                        // CLOSE LOGIN
                        // ------------------------------------

                        setTimeout(() => {

                            hideAllModals();

                            // Keep profile menu closed after login
                            closeProfileDropdown();

                            // Check if user has an unreviewed completed service
                            setTimeout(() => {
                                checkUserPendingServiceReview(currentUserId);
                            }, 500);

                        }, 1200);


                    } else {

                        showDialogAlert(
                            "loginAlert",
                            data.error ||
                            "Login failed.",
                            "error"
                        );
                    }


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showDialogAlert(
                        "loginAlert",
                        "Server error. Please try again later.",
                        "error"
                    );


                } finally {

                    loginBtnAction.disabled =
                        false;


                    loginBtnAction.innerText =
                        "Login";
                }

            }
        );
    }


    // ========================================================
    // SIGNUP
    // ========================================================

    if (signupBtnAction) {

        signupBtnAction.addEventListener(
            "click",
            async function () {

                const name =
                    document
                        .getElementById(
                            "signupName"
                        )
                        ?.value
                        .trim() || "";


                const phone =
                    document
                        .getElementById(
                            "signupPhone"
                        )
                        ?.value
                        .trim() || "";


                const email =
                    document
                        .getElementById(
                            "signupEmail"
                        )
                        ?.value
                        .trim() || "";


                const password =
                    document
                        .getElementById(
                            "signupPwd"
                        )
                        ?.value || "";


                if (
                    !name ||
                    !phone ||
                    !email ||
                    !password
                ) {

                    showDialogAlert(
                        "signupAlert",
                        "Please fill all fields.",
                        "error"
                    );

                    return;
                }


                signupBtnAction.disabled =
                    true;


                signupBtnAction.innerText =
                    "Signing up...";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/auth/signup`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    name: name,
                                    phone: phone,
                                    email: email,
                                    password: password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // UPDATE AUTH STATE
                        // ------------------------------------

                        isLoggedIn = true;


                        currentUserId =
                            data.user_id ||
                            null;


                        currentUserName =
                            name;


                        currentUserEmail =
                            email;


                        currentUserProfilePic =
                            "";


                        // ------------------------------------
                        // SAVE AUTH STATE
                        // ------------------------------------

                        localStorage.setItem(
                            "isLoggedIn",
                            "true"
                        );


                        localStorage.setItem(
                            "currentUserId",
                            currentUserId || ""
                        );


                        localStorage.setItem(
                            "currentUserName",
                            currentUserName
                        );


                        localStorage.setItem(
                            "currentUserEmail",
                            currentUserEmail
                        );


                        localStorage.setItem(
                            "currentUserProfilePic",
                            ""
                        );


                        // Fetch full profile to store user_object + phone
                        fetchAndStoreUserProfile(currentUserId);

                        updateNavbarAuthUI();


                        showDialogAlert(
                            "signupAlert",
                            data.message ||
                            "Signup successful!",
                            "success"
                        );


                        setTimeout(() => {

                            hideAllModals();

                            // Keep profile menu closed after signup
                            closeProfileDropdown();

                        }, 1200);


                    } else {

                        showDialogAlert(
                            "signupAlert",
                            "Error: " +
                            (
                                data.error ||
                                "Signup failed."
                            ),
                            "error"
                        );
                    }


                } catch (error) {

                    console.error(
                        "Signup error:",
                        error
                    );


                    showDialogAlert(
                        "signupAlert",
                        "Server error. Please try again later.",
                        "error"
                    );


                } finally {

                    signupBtnAction.disabled =
                        false;


                    signupBtnAction.innerText =
                        "Sign Up";
                }

            }
        );
    }


    // ========================================================
    // BOOK SERVICE HERO & BOOKING BUTTONS
    // ========================================================

    const heroBookButtons = [
        bookServiceBtnHero,
        document.getElementById("svcHeroBookBtn")
    ];

    heroBookButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener(
                "click",
                function (e) {
                    if (!isLoggedIn) {
                        e.preventDefault();
                        showModal(
                            loginDialog
                        );
                    } else {
                        const bookSec = document.getElementById("bookSection");
                        if (bookSec) {
                            e.preventDefault();
                            bookSec.scrollIntoView({ behavior: "smooth" });
                        } else {
                            window.location.href = "service.html#bookSection";
                        }
                    }
                }
            );
        }
    });

    const svcBookBtn = document.getElementById("bookServiceBtn");
    if (svcBookBtn) {
        svcBookBtn.addEventListener("click", function (e) {
            if (!isLoggedIn) {
                e.preventDefault();
                showModal(loginDialog);
            }
        });
    }


    // ========================================================
    // CANCEL ADD BIKE
    // ========================================================

    if (cancelAddBike) {

        cancelAddBike.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                hideAllModals();

            }
        );
    }


    // ========================================================
    // CONFIRM BOOKING
    // ========================================================

    if (confirmBookingBtn) {

        confirmBookingBtn.addEventListener(
            "click",
            function () {

                hideAllModals();


                if (statusDialog) {

                    statusDialog.classList.add(
                        "show"
                    );


                    statusDialog.style.display =
                        "flex";


                    statusDialog.setAttribute(
                        "aria-hidden",
                        "false"
                    );


                    setScrollLock(true);
                }


                const todaySpan =
                    document.getElementById(
                        "bookedDateSpan"
                    );


                if (todaySpan) {

                    const date =
                        new Date();


                    todaySpan.innerText =
                        date.toLocaleDateString(
                            "en-GB",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        );
                }

            }
        );
    }


    // ========================================================
    // PROFILE IMAGE PREVIEW
    // ========================================================

    if (profileImageInput) {

        profileImageInput.addEventListener(
            "change",
            function () {

                const file =
                    this.files?.[0];


                if (!file) {
                    return;
                }


                // Validate image
                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    showDialogAlert(
                        "profileAlert",
                        "Please select a valid image file.",
                        "error"
                    );


                    this.value =
                        "";


                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (e) {

                        if (
                            !profileImagePreview
                        ) {
                            return;
                        }


                        if (
                            profileImagePreview.tagName ===
                            "IMG"
                        ) {

                            profileImagePreview.src =
                                e.target.result;

                        } else {

                            profileImagePreview.innerHTML =
                                `<img src="${e.target.result}"
                                      alt="Profile preview"
                                      style="width:100%;
                                             height:100%;
                                             border-radius:50%;
                                             object-fit:cover;
                                             display:block;">`;
                        }
                    };


                reader.readAsDataURL(
                    file
                );
            }
        );
    }


    // ========================================================
    // SAVE PROFILE
    // ========================================================

    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            async function () {

                const profileNameInput =
                    document.getElementById(
                        "profileName"
                    );


                const name =
                    profileNameInput
                        ?.value
                        .trim() || "";


                const file =
                    profileImageInput
                        ?.files?.[0];


                if (!name) {

                    showDialogAlert(
                        "profileAlert",
                        "Name cannot be empty.",
                        "error"
                    );


                    return;
                }


                if (!currentUserId) {

                    showDialogAlert(
                        "profileAlert",
                        "User session not found. Please login again.",
                        "error"
                    );


                    return;
                }


                saveProfileBtn.disabled =
                    true;


                saveProfileBtn.innerText =
                    "Saving...";


                const formData =
                    new FormData();


                formData.append(
                    "name",
                    name
                );


                if (file) {

                    formData.append(
                        "image",
                        file
                    );
                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/user/${currentUserId}`,
                            {
                                method: "PATCH",
                                body: formData
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // UPDATE LOCAL STATE
                        // ------------------------------------

                        currentUserName =
                            data.user?.name ||
                            name;


                        currentUserProfilePic =
                            data.user?.profile_picture ||
                            currentUserProfilePic ||
                            "";


                        // ------------------------------------
                        // UPDATE LOCAL STORAGE
                        // ------------------------------------

                        localStorage.setItem(
                            "currentUserName",
                            currentUserName
                        );


                        localStorage.setItem(
                            "currentUserProfilePic",
                            currentUserProfilePic
                        );


                        // ------------------------------------
                        // UPDATE UI IMMEDIATELY
                        // ------------------------------------

                        updateNavbarAuthUI();

                        updateProfileDialogAvatar();


                        showDialogAlert(
                            "profileAlert",
                            data.message ||
                            "Profile updated successfully!",
                            "success"
                        );


                    } else {

                        showDialogAlert(
                            "profileAlert",
                            data.error ||
                            "Failed to update profile.",
                            "error"
                        );
                    }


                } catch (error) {

                    console.error(
                        "Update profile error:",
                        error
                    );


                    showDialogAlert(
                        "profileAlert",
                        "Server error. Please try again later.",
                        "error"
                    );


                } finally {

                    saveProfileBtn.disabled =
                        false;


                    saveProfileBtn.innerText =
                        "Save Changes";
                }

            }
        );
    }


    // ========================================================
    // DELETE ACCOUNT
    // ========================================================

    if (deleteAccountBtn) {

        deleteAccountBtn.addEventListener(
            "click",
            function () {

                if (!isLoggedIn) {

                    showModal(
                        loginDialog
                    );

                    return;
                }


                showModal(
                    deleteConfirmDialog
                );
            }
        );
    }


    // ========================================================
    // CANCEL DELETE
    // ========================================================

    if (cancelDeleteBtn) {

        cancelDeleteBtn.addEventListener(
            "click",
            function () {

                showModal(
                    profileDialog
                );
            }
        );
    }


    // ========================================================
    // CONFIRM DELETE ACCOUNT
    // ========================================================

    if (confirmDeleteBtn) {

        confirmDeleteBtn.addEventListener(
            "click",
            async function () {

                if (!currentUserId) {

                    alert(
                        "User session not found."
                    );


                    return;
                }


                confirmDeleteBtn.disabled =
                    true;


                confirmDeleteBtn.innerText =
                    "Deleting...";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/api/user/${currentUserId}`,
                            {
                                method: "DELETE"
                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        // ------------------------------------
                        // RESET AUTH STATE
                        // ------------------------------------

                        isLoggedIn = false;

                        currentUserId = null;

                        currentUserName = null;

                        currentUserEmail = null;

                        currentUserProfilePic =
                            null;


                        // ------------------------------------
                        // REMOVE AUTH DATA
                        // ------------------------------------

                        localStorage.removeItem(
                            "isLoggedIn"
                        );


                        localStorage.removeItem(
                            "currentUserId"
                        );


                        localStorage.removeItem(
                            "currentUserName"
                        );


                        localStorage.removeItem(
                            "currentUserEmail"
                        );


                        localStorage.removeItem(
                            "currentUserProfilePic"
                        );


                        // ------------------------------------
                        // UPDATE COMPLETE NAVBAR
                        // ------------------------------------

                        updateNavbarAuthUI();


                        closeProfileDropdown();

                        hideAllModals();


                        alert(
                            data.message ||
                            "Account deleted successfully."
                        );


                    } else {

                        alert(
                            "Error: " +
                            (
                                data.error ||
                                "Failed to delete account."
                            )
                        );
                    }


                } catch (error) {

                    console.error(
                        "Delete account error:",
                        error
                    );


                    alert(
                        "Server error. Please try again later."
                    );


                } finally {

                    confirmDeleteBtn.disabled =
                        false;


                    confirmDeleteBtn.innerText =
                        "Yes, Delete";
                }

            }
        );
    }


    // ========================================================
    // FINAL INITIALIZATION
    // ========================================================

    updateNavbarAuthUI();

    // Cache-first: use localStorage data immediately; only fetch from API if no cache
    if (isLoggedIn && currentUserId) {
        fetchAndStoreUserProfile(currentUserId, false);
    }

    // ========================================================
    // BOOK A SLOT LOGIC

    // ========================================================
    const bookSlotDialog = document.getElementById("bookSlotDialog");
    const closeBookSlotDialog = document.getElementById("closeBookSlotDialog");
    const bookSlotForm = document.getElementById("bookSlotForm");
    const slotContactError = document.getElementById("slotContactError");

    window.openBookSlotDialog = function () {
        const slotName = document.getElementById("slotName");
        const slotEmail = document.getElementById("slotEmail");
        const slotPhone = document.getElementById("slotPhone");

        if (isLoggedIn) {
            if (currentUserName && slotName) slotName.value = currentUserName;
            if (currentUserEmail && slotEmail) slotEmail.value = currentUserEmail;

            // Auto-fill phone if it exists in local storage
            const savedPhone = localStorage.getItem("currentUserPhone");
            if (savedPhone && slotPhone) slotPhone.value = savedPhone;
        }

        showModal(bookSlotDialog);
    };

    if (closeBookSlotDialog) {
        closeBookSlotDialog.addEventListener("click", () => {
            hideAllModals();
            if (bookSlotForm) bookSlotForm.reset();
            if (slotContactError) slotContactError.style.display = "none";
        });
    }

    if (bookSlotForm) {
        bookSlotForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("slotName").value.trim();
            const phone = document.getElementById("slotPhone").value.trim();
            const email = document.getElementById("slotEmail").value.trim();
            const bike = document.getElementById("slotBike").value.trim();

            if (!phone && !email) {
                slotContactError.style.display = "block";
                return;
            }
            slotContactError.style.display = "none";

            const submitBtn = document.getElementById("slotSubmitBtn");
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Booking... <span class="spinner"></span>';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/api/modification-slot`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, email, bike })
                });

                const data = await response.json();

                if (response.ok) {
                    hideAllModals();
                    bookSlotForm.reset();

                    const successModal = document.getElementById("modificationSuccessDialog");
                    if (successModal) {
                        showModal(successModal);
                        setTimeout(() => {
                            hideAllModals();
                        }, 5000);
                    }
                } else {
                    const errorMsg = data.error || "Failed to book slot";
                    slotContactError.innerText = "Error: " + errorMsg;
                    slotContactError.style.display = "block";
                }
            } catch (err) {
                console.error(err);
                slotContactError.innerText = "Server error. Please try again.";
                slotContactError.style.display = "block";
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }


    // ========================================================
    // LANDING PAGE: DYNAMIC BUILDS & SALES FROM GET API
    // ========================================================
    async function loadLandingPageBuildsAndSales() {
        const buildsContainer = document.getElementById("landingBuildsGrid") || document.querySelector(".builds-panel .builds-grid");
        const salesContainer = document.getElementById("landingSalesGrid") || document.querySelector(".sales-panel .sales-grid");

        // If not on the landing page, exit
        if (!buildsContainer && !salesContainer) return;

        function safeHtml(str) {
            if (!str) return "";
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // --- 1. FETCH & RENDER BUILDS ---
        if (buildsContainer) {
            buildsContainer.innerHTML = `
                <div class="builds-loader-placeholder" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 10px; color: var(--text-muted); text-align: center;">
                    <i class="fas fa-circle-notch fa-spin" style="font-size: 24px; color: var(--accent); margin-bottom: 8px;"></i>
                    <p style="margin: 0; font-size: 12px; color: var(--text-muted); font-weight: 500;">Loading custom builds...</p>
                </div>
            `;
            try {
                // Try /build, fallback to /api/builds or /api/build
                let res = await fetch(`${API_BASE_URL}/build`).catch(() => null);
                if (!res || !res.ok) {
                    res = await fetch(`${API_BASE_URL}/api/builds`).catch(() => null);
                }
                if (!res || !res.ok) {
                    res = await fetch(`${API_BASE_URL}/api/build`).catch(() => null);
                }

                if (!res || !res.ok) {
                    throw new Error("Builds API response not ok");
                }

                const data = await res.json();
                const builds = Array.isArray(data) ? data : (data.builds || data.data || []);

                if (!builds || builds.length === 0) {
                    buildsContainer.innerHTML = `
                        <div class="empty-state-notice" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-tertiary); border-radius: 8px; border: 1px dashed var(--border);">
                            <i class="fas fa-hammer" style="font-size: 28px; color: var(--accent); margin-bottom: 12px; display: inline-block;"></i>
                            <h4 style="margin: 0 0 6px; font-size: 15px; color: var(--text-primary); font-weight: 600;">No Completed Builds Available</h4>
                            <p style="margin: 0; font-size: 12px; color: var(--text-muted);">New custom build projects are currently in progress. Please check back soon!</p>
                        </div>
                    `;
                } else {
                    buildsContainer.innerHTML = builds.map(build => {
                        const beforeImg = build.beforeImg || (build.images && build.images[1] && build.images[1].url) || "";
                        const afterImg = build.afterImg || (build.images && build.images[0] && build.images[0].url) || build.imageUrl || "https://res.cloudinary.com/dzyrruoda/image/upload/v1779903176/IMG_5384_md6ioo.jpg";
                        const title = safeHtml(build.title || "Custom Build Project");
                        const subtitle = safeHtml(build.subtitle || build.categoryLabel || build.category || "Custom Project");
                        const cost = safeHtml(build.cost || "₹ Contact");
                        const likes = build.likes || 0;

                        let imageBlock = "";
                        if (beforeImg && afterImg) {
                            imageBlock = `
                                <div class="build-images" style="display:flex; height: 120px;">
                                    <div class="build-before" style="flex:1; position:relative;">
                                        <img src="${beforeImg}" alt="Before" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src='https://res.cloudinary.com/dzyrruoda/image/upload/v1779904142/IMG_5393_z5ifnq.jpg';">
                                        <span class="build-label" style="position:absolute; top:5px; left:5px; background: rgba(0,0,0,0.6); font-size:10px; padding: 2px 5px; border-radius: 3px; color: white;">Before</span>
                                    </div>
                                    <div class="build-after" style="flex:1; position:relative;">
                                        <img src="${afterImg}" alt="After" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src='https://res.cloudinary.com/dzyrruoda/image/upload/v1779903176/IMG_5384_md6ioo.jpg';">
                                        <span class="build-label" style="position:absolute; top:5px; right:5px; background: var(--accent); color: black; font-size:10px; padding: 2px 5px; border-radius: 3px; font-weight: bold;">After</span>
                                    </div>
                                </div>
                            `;
                        } else {
                            imageBlock = `
                                <div class="build-images" style="position:relative; height: 120px;">
                                    <img src="${afterImg}" alt="${title}" style="width:100%; height:100%; object-fit:cover;">
                                    <span class="build-label" style="position:absolute; top:5px; right:5px; background: var(--accent); color: black; font-size:10px; padding: 2px 5px; border-radius: 3px; font-weight: bold;">Featured</span>
                                </div>
                            `;
                        }

                        return `
                            <div class="build-card" style="background: var(--bg-tertiary); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s;" onclick="window.location.href='builds.html'">
                                ${imageBlock}
                                <div class="build-info" style="padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <h4 style="margin: 0 0 5px; font-size: 14px; font-weight: 600; color: var(--text-primary);">${title}</h4>
                                        <p style="margin: 0 0 10px; font-size: 12px; color: var(--text-muted);">${subtitle}</p>
                                    </div>
                                    <div class="build-meta" style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: auto;">
                                        <span class="build-price" style="color: var(--accent); font-weight: bold;">${cost}</span>
                                        <span class="build-stats" style="color: var(--text-muted);"><i class="fas fa-heart" style="color: var(--accent); margin-right: 3px;"></i> ${likes}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join("");
                }
            } catch (err) {
                console.warn("Could not load dynamic builds on landing page:", err);
                buildsContainer.innerHTML = `
                    <div class="empty-state-notice" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-tertiary); border-radius: 8px; border: 1px dashed var(--border);">
                        <i class="fas fa-hammer" style="font-size: 28px; color: var(--accent); margin-bottom: 12px; display: inline-block;"></i>
                        <h4 style="margin: 0 0 6px; font-size: 15px; color: var(--text-primary); font-weight: 600;">No Completed Builds Available</h4>
                        <p style="margin: 0; font-size: 12px; color: var(--text-muted);">New custom build projects are currently in progress. Please check back soon!</p>
                    </div>
                `;
            }
        }

        // --- 2. FETCH & RENDER SALES ---
        if (salesContainer) {
            salesContainer.innerHTML = `
                <div class="sales-loader-placeholder" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 10px; color: var(--text-muted); text-align: center;">
                    <i class="fas fa-circle-notch fa-spin" style="font-size: 24px; color: var(--accent); margin-bottom: 8px;"></i>
                    <p style="margin: 0; font-size: 12px; color: var(--text-muted); font-weight: 500;">Loading certified sales...</p>
                </div>
            `;
            try {
                // Try /sales, fallback to /api/sales or /api/sale
                let res = await fetch(`${API_BASE_URL}/sales`).catch(() => null);
                if (!res || !res.ok) {
                    res = await fetch(`${API_BASE_URL}/api/sales`).catch(() => null);
                }
                if (!res || !res.ok) {
                    res = await fetch(`${API_BASE_URL}/api/sale`).catch(() => null);
                }

                if (!res || !res.ok) {
                    throw new Error("Sales API response not ok");
                }

                const data = await res.json();
                const sales = Array.isArray(data) ? data : (data.sales || data.data || []);

                if (!sales || sales.length === 0) {
                    salesContainer.innerHTML = `
                        <div class="empty-state-notice" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-tertiary); border-radius: 8px; border: 1px dashed var(--border);">
                            <i class="fas fa-motorcycle" style="font-size: 28px; color: var(--accent); margin-bottom: 12px; display: inline-block;"></i>
                            <h4 style="margin: 0 0 6px; font-size: 15px; color: var(--text-primary); font-weight: 600;">No Sale Bikes Available</h4>
                            <p style="margin: 0; font-size: 12px; color: var(--text-muted);">All pre-owned bikes are currently reserved or sold out. Check back for fresh arrivals!</p>
                        </div>
                    `;
                } else {
                    salesContainer.innerHTML = sales.map(sale => {
                        const imgUrl = (sale.images && sale.images[0] && sale.images[0].url) || sale.imageUrl || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80";
                        const name = safeHtml(sale.name || "Certified Motorcycle");
                        const year = safeHtml(sale.year || "");
                        const km = safeHtml(sale.km || "");
                        const price = safeHtml(sale.price || "₹ Contact");

                        const specParts = [];
                        if (year) specParts.push(`<span>${year}</span>`);
                        if (km) specParts.push(`<span>${km}</span>`);
                        const specsHtml = specParts.length > 0 ? specParts.join("") : `<span>Certified Pre-Owned</span>`;

                        return `
                            <div class="bike-sale-card" style="background: var(--bg-tertiary); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s;" onclick="window.location.href='sales.html'">
                                <div class="bike-sale-image" style="height: 120px; position:relative;">
                                    <img src="${imgUrl}" alt="${name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80';">
                                    <i class="far fa-heart" style="position:absolute; top:10px; right:10px; color: white;" onclick="event.stopPropagation(); this.classList.toggle('fas'); this.classList.toggle('far'); this.style.color = this.classList.contains('fas') ? 'var(--accent)' : 'white';"></i>
                                </div>
                                <div class="bike-sale-info" style="padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <h4 class="bike-sale-name" style="margin: 0 0 5px; font-size: 14px; font-weight: 600; color: var(--text-primary);">${name}</h4>
                                        <div class="bike-sale-specs" style="font-size: 11px; color: var(--text-muted); display: flex; gap: 10px; margin-bottom: 10px;">
                                            ${specsHtml}
                                        </div>
                                    </div>
                                    <div class="bike-sale-footer">
                                        <span class="bike-sale-price" style="color: var(--accent); font-weight: bold; font-size: 14px;">${price}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join("");
                }
            } catch (err) {
                console.warn("Could not load dynamic sales on landing page:", err);
                salesContainer.innerHTML = `
                    <div class="empty-state-notice" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--bg-tertiary); border-radius: 8px; border: 1px dashed var(--border);">
                        <i class="fas fa-motorcycle" style="font-size: 28px; color: var(--accent); margin-bottom: 12px; display: inline-block;"></i>
                        <h4 style="margin: 0 0 6px; font-size: 15px; color: var(--text-primary); font-weight: 600;">No Sale Bikes Available</h4>
                        <p style="margin: 0; font-size: 12px; color: var(--text-muted);">All pre-owned bikes are currently reserved or sold out. Check back for fresh arrivals!</p>
                    </div>
                `;
            }
        }
    }

    loadLandingPageBuildsAndSales();


    // ========================================================
    // LANDING PAGE: RECENT ENQUIRIES FROM SERVICE-BOOKING API
    // ========================================================
    async function loadRecentEnquiries() {
        const container = document.getElementById("recentEnquiriesList");
        if (!container) return;

        const fallbackImg = "https://res.cloudinary.com/dzyrruoda/image/upload/v1779903176/IMG_5389_gcrjn8.jpg";

        function safeHtmlEq(str) {
            if (!str) return "";
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function timeAgo(isoStr) {
            if (!isoStr) return "Recently";
            const then = new Date(isoStr);
            if (isNaN(then.getTime())) return "Recently";
            const now = new Date();
            const diffMs = now - then;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins}m ago`;
            const diffHrs = Math.floor(diffMins / 60);
            if (diffHrs < 24) return `${diffHrs}h ago`;
            const diffDays = Math.floor(diffHrs / 24);
            if (diffDays < 30) return `${diffDays}d ago`;
            return then.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        }

        function statusBadge(status) {
            const s = (status || "Pending").toLowerCase();
            if (s === "completed" || s === "done") {
                return `<span style="background:#1e4d2b; color:#4caf50; font-size:10px; padding:2px 7px; border-radius:4px; font-weight:600;">Completed</span>`;
            }
            if (s === "in progress" || s === "in-progress") {
                return `<span style="background:#1a2e4a; color:#2196f3; font-size:10px; padding:2px 7px; border-radius:4px; font-weight:600;">In Progress</span>`;
            }
            if (s === "cancelled") {
                return `<span style="background:#2d1a1a; color:#f44336; font-size:10px; padding:2px 7px; border-radius:4px; font-weight:600;">Cancelled</span>`;
            }
            return `<span style="background:var(--accent); color:black; font-size:10px; padding:2px 7px; border-radius:4px; font-weight:600;">Pending</span>`;
        }

        function renderEnquiriesList(enquiries) {
            if (!enquiries || enquiries.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:40px 20px; color:var(--text-muted); font-size:13px;">
                        <i class="fas fa-clipboard-list" style="font-size:28px; color:var(--accent); margin-bottom:10px; display:block;"></i>
                        No service bookings yet.<br>
                        <a href="service.html" style="color:var(--accent); text-decoration:none; font-weight:600; margin-top:8px; display:inline-block;">Book a Service →</a>
                    </div>`;
                return;
            }

            container.innerHTML = enquiries.map(enq => {
                const serviceType = safeHtmlEq(enq.serviceType || enq.service_type || "Service Enquiry");
                const manufacturer = enq.manufacturer || (enq.bike && enq.bike.manufacturer) || "";
                const model = enq.model || (enq.bike && enq.bike.model) || "";
                const bikeLabel = [manufacturer, model].filter(Boolean).map(safeHtmlEq).join(" ");
                const imgSrc = enq.bike_image_url || (enq.bike && (enq.bike.bike_image_url || enq.bike.image_url)) || fallbackImg;
                const when = timeAgo(enq.created_at || enq.date);
                const badge = statusBadge(enq.status);

                return `
                <div class="enquiry-item" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-tertiary); margin-bottom:10px; border-radius:8px; padding:10px; gap:10px; transition:background 0.2s;" onmouseover="this.style.background='var(--bg-card)'" onmouseout="this.style.background='var(--bg-tertiary)'">
                    <div class="enquiry-left" style="display:flex; gap:10px; align-items:center; min-width:0;">
                        <img src="${imgSrc}" alt="Bike" class="enquiry-img" style="width:40px; height:40px; border-radius:6px; object-fit:cover; flex-shrink:0;" onerror="this.onerror=null;this.src='${fallbackImg}';">
                        <div class="enquiry-info" style="min-width:0;">
                            <h5 style="margin:0; font-size:13px; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${serviceType}</h5>
                            <p style="margin:0; font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${bikeLabel ? "For " + bikeLabel : "Service Booking"}</p>
                        </div>
                    </div>
                    <div class="enquiry-right" style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0;">
                        <span style="font-size:11px; color:var(--text-muted);">${when}</span>
                        ${badge}
                    </div>
                </div>`;
            }).join("");
        }

        // 1. Immediate optimistic render from cache if available (prevents mobile wait/flashing)
        let hasCachedEnquiries = false;
        try {
            const cached = localStorage.getItem("cached_recent_enquiries");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    renderEnquiriesList(parsed);
                    hasCachedEnquiries = true;
                }
            }
        } catch (_) { }

        if (!hasCachedEnquiries) {
            container.innerHTML = `
                <div id="enquiriesLoader" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 35px 10px; color: var(--text-muted); font-size: 12px; text-align: center;">
                    <i class="fas fa-circle-notch fa-spin" style="font-size: 22px; color: var(--accent); margin-bottom: 8px;"></i>
                    <span style="font-weight: 500;">Loading recent enquiries...</span>
                </div>
            `;
        }

        // 2. Candidate endpoints in priority order
        const endpoints = [
            `${API_BASE_URL}/api/recent-enquiries`,
            `${API_BASE_URL}/recent-enquiries`,
            `${API_BASE_URL}/api/admin/services`
        ];

        // Also add cross-host fallbacks if needed
        if (API_BASE_URL.includes("onrender.com")) {
            // If primary is Render, try local server if available
            endpoints.push(`http://${window.location.hostname || "127.0.0.1"}:10000/api/recent-enquiries`);
            endpoints.push(`http://127.0.0.1:10000/api/recent-enquiries`);
        } else {
            // If primary is local, try Render backend endpoints as fallback
            endpoints.push("https://bike-modification-api.onrender.com/api/admin/services");
            endpoints.push("https://bike-modification-api.onrender.com/api/recent-enquiries");
        }

        let liveEnquiries = null;

        for (const url of endpoints) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                const res = await fetch(url, { signal: controller.signal }).catch(() => null);
                clearTimeout(timeoutId);

                if (res && res.ok) {
                    const data = await res.json().catch(() => null);
                    if (data) {
                        const list = Array.isArray(data)
                            ? data
                            : (data.enquiries || data.services || data.data || []);
                        if (Array.isArray(list) && list.length > 0) {
                            liveEnquiries = list;
                            try {
                                localStorage.setItem("cached_recent_enquiries", JSON.stringify(list.slice(0, 10)));
                            } catch (_) { }
                            break;
                        }
                    }
                }
            } catch (_) {
                // Try next endpoint in priority list
            }
        }

        if (liveEnquiries && liveEnquiries.length > 0) {
            renderEnquiriesList(liveEnquiries);
            return;
        }

        // 3. If cache already rendered items, keep them
        try {
            const cached = localStorage.getItem("cached_recent_enquiries");
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    renderEnquiriesList(parsed);
                    return;
                }
            }
        } catch (_) { }

        // 4. Default high-quality fallback items (guarantees mobile landing page is NEVER broken)
        const defaultRecent = [
            {
                serviceType: "General Service + Chain Clean",
                manufacturer: "Yamaha",
                model: "R15 V4",
                status: "Completed",
                created_at: new Date(Date.now() - 42 * 60000).toISOString(),
                bike_image_url: "https://res.cloudinary.com/dzyrruoda/image/upload/v1779731554/sports_zt8uwz.jpg"
            },
            {
                serviceType: "Performance Upgrade",
                manufacturer: "KTM",
                model: "Duke 390",
                status: "In Progress",
                created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
                bike_image_url: "https://res.cloudinary.com/dzyrruoda/image/upload/v1779731554/naked_a5hden.jpg"
            },
            {
                serviceType: "Custom Paint & Detailing",
                manufacturer: "Royal Enfield",
                model: "Classic 350",
                status: "Pending",
                created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
                bike_image_url: "https://res.cloudinary.com/dzyrruoda/image/upload/v1779731553/cruiser_u7686r.jpg"
            },
            {
                serviceType: "LED Setup & Wiring",
                manufacturer: "BMW",
                model: "G 310 GS",
                status: "Pending",
                created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
                bike_image_url: "https://res.cloudinary.com/dzyrruoda/image/upload/v1779731553/adv_n8l3dc.jpg"
            }
        ];

        renderEnquiriesList(defaultRecent);
    }

    loadRecentEnquiries();


    // ========================================================
    // ========================================================
    // 🌟 WHAT OUR RIDERS SAY - SCROLLABLE DYNAMIC REVIEWS
    // ========================================================

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/[&<>"']/g, function (m) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[m];
        });
    }

    function renderRiderAvatar(rev) {
        const userName = rev.user_name || rev.name || "Rider";
        const initial = userName.trim().charAt(0).toUpperCase() || "R";
        const pic = (rev.user_avatar || rev.profile_picture || "").trim();

        // Check if there is an actual uploaded user picture (do not use hardcoded favicon)
        if (pic && !pic.includes("fav-icon") && !pic.includes("google-icon")) {
            return `
                <div class="testimonial-avatar" style="width: 38px; height: 38px; min-width: 38px; border-radius: 50%; overflow: hidden; background: #ff6600; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <img src="${escapeHtml(pic)}" alt="${escapeHtml(userName)}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.parentElement.innerHTML='<span style=\\\'color:#fff;font-weight:700;font-size:14px;\\\'>${escapeHtml(initial)}</span>'">
                </div>
            `;
        }

        // Clean user profile initial in brand accent background
        return `
            <div class="testimonial-avatar" style="width: 38px; height: 38px; min-width: 38px; border-radius: 50%; background: #ff6600; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(255,102,0,0.3);">
                ${escapeHtml(initial)}
            </div>
        `;
    }

    function renderReviewsList(reviews) {
        const container = document.getElementById("ridersReviewsContainer");
        const badge = document.getElementById("reviewsCountBadge");
        if (!container) return;

        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div class="testimonial-card" style="padding: 14px 16px; border-radius: 10px; background: var(--bg-tertiary); border: 1px solid var(--border);">
                    <p class="testimonial-text" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary); margin: 0 0 12px; font-style: italic;">
                        "Amazing service and perfect modification! My bike feels brand new. Highly recommended!"
                    </p>
                    <div class="testimonial-author" style="display: flex; align-items: center; gap: 10px;">
                        <div class="testimonial-avatar" style="width: 38px; height: 38px; min-width: 38px; border-radius: 50%; background: #ff6600; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0;">
                            A
                        </div>
                        <div class="testimonial-info" style="min-width: 0; flex: 1;">
                            <h5 style="margin: 0; font-size: 13px; font-weight: 700;">Arun Karthik</h5>
                            <p style="margin: 0; font-size: 11px; color: var(--text-muted);">Yamaha R15 V4</p>
                            <div class="testimonial-stars" style="color: var(--accent); font-size: 11px; margin-top: 3px; display: flex; gap: 2px;">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if (badge) badge.textContent = "1 Review";
            return;
        }

        if (badge) badge.textContent = `${reviews.length} Review${reviews.length > 1 ? 's' : ''}`;

        container.innerHTML = reviews.map(rev => {
            const rating = Math.min(5, Math.max(1, parseInt(rev.rating) || 5));
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                if (i <= rating) {
                    starsHtml += '<i class="fas fa-star" style="color: var(--accent);"></i>';
                } else {
                    starsHtml += '<i class="far fa-star" style="color: #444;"></i>';
                }
            }

            const userName = rev.user_name || rev.name || "Happy Rider";
            const bikeInfo = rev.bike || rev.service_type || "Motorcycle Service";
            const comment = rev.description || rev.comment || "Great service experience!";
            const avatarHtml = renderRiderAvatar(rev);

            return `
                <div class="testimonial-card" style="padding: 14px 16px; border-radius: 10px; background: var(--bg-tertiary); border: 1px solid var(--border); transition: transform 0.2s, border-color 0.2s;">
                    <p class="testimonial-text" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary); margin: 0 0 12px; font-style: italic;">
                        "${escapeHtml(comment)}"
                    </p>
                    <div class="testimonial-author" style="display: flex; align-items: center; gap: 10px;">
                        ${avatarHtml}
                        <div class="testimonial-info" style="min-width: 0; flex: 1;">
                            <h5 style="margin: 0; font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(userName)}</h5>
                            <p style="margin: 0; font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(bikeInfo)}</p>
                            <div class="testimonial-stars" style="font-size: 11px; margin-top: 3px; display: flex; gap: 2px;">
                                ${starsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function loadRidersReviews() {
        const container = document.getElementById("ridersReviewsContainer");
        if (!container) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews`);
            const data = await res.json();
            if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
                renderReviewsList(data.reviews);
            } else {
                renderReviewsList([]);
            }
        } catch (e) {
            console.error("Failed to load reviews:", e);
            renderReviewsList([]);
        }
    }

    loadRidersReviews();


    // ========================================================
    // ⭐ SERVICE COMPLETED REVIEW DIALOG SYSTEM
    // ========================================================
    let currentSelectedRating = 5;

    const ratingLabels = {
        1: "1.0 - Needs Improvement",
        2: "2.0 - Fair Experience",
        3: "3.0 - Good Service",
        4: "4.0 - Very Good Service",
        5: "5.0 - Excellent Experience"
    };

    function updateStarDisplay(rating) {
        currentSelectedRating = rating;
        const dialog = document.getElementById("serviceReviewDialog");
        if (!dialog) return;

        const stars = dialog.querySelectorAll("#reviewStarRating .review-star");
        const label = dialog.querySelector("#reviewRatingLabel");
        stars.forEach(s => {
            const starVal = parseInt(s.dataset.rating) || 1;
            if (starVal <= rating) {
                s.className = "fas fa-star review-star";
                s.style.color = "var(--accent)";
            } else {
                s.className = "far fa-star review-star";
                s.style.color = "#444";
            }
        });
        if (label) {
            label.textContent = ratingLabels[rating] || `${rating}.0`;
        }
    }

    function setupReviewDialogEvents(dialog) {
        if (!dialog || dialog.dataset.eventsAttached === "true") return;
        dialog.dataset.eventsAttached = "true";

        const stars = dialog.querySelectorAll("#reviewStarRating .review-star");
        stars.forEach(s => {
            s.addEventListener("click", () => {
                const r = parseInt(s.dataset.rating) || 5;
                updateStarDisplay(r);
            });
            s.addEventListener("mouseenter", () => {
                const r = parseInt(s.dataset.rating) || 5;
                const starsList = dialog.querySelectorAll("#reviewStarRating .review-star");
                starsList.forEach(st => {
                    const v = parseInt(st.dataset.rating) || 1;
                    if (v <= r) {
                        st.className = "fas fa-star review-star";
                        st.style.color = "var(--accent)";
                    } else {
                        st.className = "far fa-star review-star";
                        st.style.color = "#444";
                    }
                });
            });
        });

        const starRatingContainer = dialog.querySelector("#reviewStarRating");
        if (starRatingContainer) {
            starRatingContainer.addEventListener("mouseleave", () => {
                updateStarDisplay(currentSelectedRating);
            });
        }

        const cancelBtn = dialog.querySelector("#cancelReviewBtn");
        const crossBtn = dialog.querySelector("#closeReviewDialogCross");
        const closeDialog = () => {
            const bookingId = dialog.querySelector("#reviewBookingId")?.value;
            if (bookingId) {
                sessionStorage.setItem("dismissed_review_" + bookingId, "true");
            }
            dialog.classList.remove("show");
            dialog.style.display = "none";
            setScrollLock(false);
        };

        if (cancelBtn) cancelBtn.addEventListener("click", closeDialog);
        if (crossBtn) crossBtn.addEventListener("click", closeDialog);

        const submitBtn = dialog.querySelector("#submitReviewBtn");
        if (submitBtn) {
            submitBtn.addEventListener("click", async () => {
                const bookingId = dialog.querySelector("#reviewBookingId")?.value;
                const desc = dialog.querySelector("#reviewDescription")?.value.trim();
                const bikeName = dialog.querySelector("#reviewBikeName")?.textContent || "";
                const serviceType = dialog.querySelector("#reviewServiceType")?.textContent || "";
                const alertEl = dialog.querySelector("#reviewAlert");

                if (!bookingId) {
                    if (alertEl) {
                        alertEl.style.display = "block";
                        alertEl.style.background = "rgba(255, 0, 0, 0.15)";
                        alertEl.style.color = "#ff6b6b";
                        alertEl.style.border = "1px solid rgba(255, 0, 0, 0.3)";
                        alertEl.textContent = "Service booking reference is missing.";
                    }
                    return;
                }

                if (!desc) {
                    if (alertEl) {
                        alertEl.style.display = "block";
                        alertEl.style.background = "rgba(255, 0, 0, 0.15)";
                        alertEl.style.color = "#ff6b6b";
                        alertEl.style.border = "1px solid rgba(255, 0, 0, 0.3)";
                        alertEl.textContent = "Please write a few words about your experience.";
                    }
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

                try {
                    const resp = await fetch(`${API_BASE_URL}/api/reviews`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            booking_id: bookingId,
                            rating: currentSelectedRating,
                            description: desc,
                            user_id: currentUserId,
                            name: currentUserName,
                            user_avatar: currentUserProfilePic,
                            bike: bikeName,
                            service_type: serviceType
                        })
                    });

                    const result = await resp.json();

                    if (resp.ok && result.success) {
                        localStorage.setItem("reviewed_booking_" + bookingId, "true");
                        if (alertEl) {
                            alertEl.style.display = "block";
                            alertEl.style.background = "rgba(46, 204, 113, 0.15)";
                            alertEl.style.color = "#2ecc71";
                            alertEl.style.border = "1px solid rgba(46, 204, 113, 0.3)";
                            alertEl.textContent = "✓ Review submitted! Thank you for your feedback.";
                        }
                        setTimeout(() => {
                            dialog.classList.remove("show");
                            dialog.style.display = "none";
                            setScrollLock(false);
                            loadRidersReviews();
                        }, 1200);
                    } else {
                        if (result.already_reviewed) {
                            localStorage.setItem("reviewed_booking_" + bookingId, "true");
                        }
                        if (alertEl) {
                            alertEl.style.display = "block";
                            alertEl.style.background = "rgba(255, 0, 0, 0.15)";
                            alertEl.style.color = "#ff6b6b";
                            alertEl.style.border = "1px solid rgba(255, 0, 0, 0.3)";
                            alertEl.textContent = result.error || "Failed to submit review.";
                        }
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = "Submit Review";
                    }
                } catch (err) {
                    if (alertEl) {
                        alertEl.style.display = "block";
                        alertEl.style.background = "rgba(255, 0, 0, 0.15)";
                        alertEl.style.color = "#ff6b6b";
                        alertEl.style.border = "1px solid rgba(255, 0, 0, 0.3)";
                        alertEl.textContent = "Connection error. Please try again.";
                    }
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = "Submit Review";
                }
            });
        }
    }

    function ensureReviewDialogInDOM() {
        let dialog = document.getElementById("serviceReviewDialog");
        if (!dialog) {
            dialog = document.createElement("div");
            dialog.id = "serviceReviewDialog";
            dialog.className = "dialog";
            dialog.setAttribute("role", "dialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.style.display = "none";
            dialog.innerHTML = `
                <div class="dialog-box"
                    style="position: relative; margin: auto; width: 92%; max-width: 440px; background: #0c0c0c; border: 1px solid rgba(255, 102, 0, 0.35); border-radius: 16px; padding: 28px 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.85), 0 0 35px rgba(255,102,0,0.15); animation: dialogPopup 0.4s var(--ease-out) forwards;">
                    <button id="closeReviewDialogCross" type="button" aria-label="Close"
                        style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: #777; font-size: 22px; cursor: pointer; line-height: 1; padding: 5px; transition: color 0.2s;"
                        onmouseover="this.style.color='white'" onmouseout="this.style.color='#777'">&times;</button>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fas fa-check-circle"></i> Service Completed
                        </span>
                    </div>
                    <h3 id="reviewDialogTitle" style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 6px;">Rate Your Service</h3>
                    <p style="color: #999; font-size: 13px; margin: 0 0 16px; line-height: 1.4;">
                        Your motorcycle service is complete! How was your experience with JE Bikez?
                    </p>
                    <div id="reviewBookingDetailsPill" style="background: #141414; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; margin-bottom: 18px; display: flex; align-items: center; gap: 12px;">
                        <div style="width: 38px; height: 38px; border-radius: 8px; background: rgba(255, 102, 0, 0.12); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
                            <i class="fas fa-motorcycle"></i>
                        </div>
                        <div style="min-width: 0; flex: 1;">
                            <div id="reviewBikeName" style="color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Your Motorcycle</div>
                            <div id="reviewServiceType" style="color: #888; font-size: 11px;">Service Booking</div>
                        </div>
                    </div>
                    <input type="hidden" id="reviewBookingId" value="">
                    <div style="text-align: center; margin-bottom: 18px;">
                        <label style="display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; margin-bottom: 8px;">
                            Tap a star to rate
                        </label>
                        <div id="reviewStarRating" style="display: inline-flex; gap: 8px; font-size: 28px; cursor: pointer;">
                            <i class="fas fa-star review-star" data-rating="1" style="color: var(--accent); transition: transform 0.15s, color 0.15s;"></i>
                            <i class="fas fa-star review-star" data-rating="2" style="color: var(--accent); transition: transform 0.15s, color 0.15s;"></i>
                            <i class="fas fa-star review-star" data-rating="3" style="color: var(--accent); transition: transform 0.15s, color 0.15s;"></i>
                            <i class="fas fa-star review-star" data-rating="4" style="color: var(--accent); transition: transform 0.15s, color 0.15s;"></i>
                            <i class="fas fa-star review-star" data-rating="5" style="color: var(--accent); transition: transform 0.15s, color 0.15s;"></i>
                        </div>
                        <div id="reviewRatingLabel" style="font-size: 12px; color: var(--accent); margin-top: 6px; font-weight: 600;">5.0 - Excellent Experience</div>
                    </div>
                    <div id="reviewAlert" style="display: none; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; font-size: 12px; text-align: center;"></div>
                    <div style="margin-bottom: 20px;">
                        <label for="reviewDescription" style="display: block; font-size: 12px; color: #aaa; margin-bottom: 8px; font-weight: 500;">
                            Your Feedback / Description <span style="color: var(--accent);">*</span>
                        </label>
                        <textarea id="reviewDescription" rows="3" placeholder="Tell us how your bike feels, workshop service quality, etc..."
                            style="width: 100%; box-sizing: border-box; background: #111; border: 1px solid #282828; border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 13px; line-height: 1.5; resize: vertical; outline: none; transition: border-color 0.2s;"></textarea>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button id="cancelReviewBtn" type="button"
                            style="flex: 1; padding: 12px 16px; background: transparent; border: 1px solid #333; color: #bbb; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">
                            Cancel
                        </button>
                        <button id="submitReviewBtn" type="button"
                            style="flex: 1.5; padding: 12px 16px; background: var(--accent); border: none; color: #000; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Submit Review
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
            setupReviewDialogEvents(dialog);
        } else {
            setupReviewDialogEvents(dialog);
        }
        return dialog;
    }

    async function checkUserPendingServiceReview(userId) {
        if (!userId) return;
        try {
            const resp = await fetch(`${API_BASE_URL}/api/reviews/pending/${userId}`);
            const data = await resp.json();
            if (data.success && data.has_pending && data.booking) {
                const b = data.booking;
                if (localStorage.getItem("reviewed_booking_" + b.booking_id) === "true") {
                    return;
                }
                if (sessionStorage.getItem("dismissed_review_" + b.booking_id) === "true") {
                    return;
                }

                const dialog = ensureReviewDialogInDOM();
                const bookingIdInput = dialog.querySelector("#reviewBookingId");
                const bikeNameEl = dialog.querySelector("#reviewBikeName");
                const serviceTypeEl = dialog.querySelector("#reviewServiceType");
                const descInput = dialog.querySelector("#reviewDescription");
                const alertEl = dialog.querySelector("#reviewAlert");

                if (bookingIdInput) bookingIdInput.value = b.booking_id;
                if (bikeNameEl) bikeNameEl.textContent = b.bike || "Your Motorcycle";
                if (serviceTypeEl) serviceTypeEl.textContent = (b.serviceType || "Service") + " • Completed";
                if (descInput) descInput.value = "";
                if (alertEl) alertEl.style.display = "none";

                updateStarDisplay(5);

                setTimeout(() => {
                    hideAllModals();
                    dialog.classList.add("show");
                    dialog.style.display = "flex";
                    setScrollLock(true);
                }, 1000);
            }
        } catch (e) {
            console.error("Error checking pending service reviews:", e);
        }
    }

    // Initialize existing dialog in DOM if present
    const staticReviewDialog = document.getElementById("serviceReviewDialog");
    if (staticReviewDialog) {
        setupReviewDialogEvents(staticReviewDialog);
    }

    // Check on startup if current user has an unreviewed completed service
    if (isLoggedIn && currentUserId) {
        checkUserPendingServiceReview(currentUserId);
    }
});
